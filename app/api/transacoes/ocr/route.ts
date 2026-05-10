// app/api/transacoes/ocr/route.ts — extrai dados de comprovante via GPT-4o Vision
import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';

const CATEGORIAS = [
  'Alimentação','Casa','Transporte','Lazer','Saúde','Moradia','Compras',
  'Educação','Energia','Gás','Pets','Assinaturas','Vestuário','Beleza',
  'Higiene','Viagem','Presentes','Eletrônicos','Serviços','Impostos',
  'Dívidas','Investimentos','Seguro','Academia','Trabalho','Carro',
  'Farmácia','Mercado','Outros',
];

export async function POST(req: Request) {
  const { error } = await authGuard(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get('imagem') as File | null;

    if (!file)
      return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 });

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(file.type))
      return NextResponse.json({ error: 'Formato inválido. Use JPG, PNG ou WebP.' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'Imagem muito grande. Máximo 5MB.' }, { status: 400 });

    // Converter para base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = file.type;

    // Chamar GPT-4o Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // mini é mais barato e suficiente para OCR
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64}`,
                  detail: 'low', // menor custo, suficiente para extrair texto
                },
              },
              {
                type: 'text',
                text: `Analise esta imagem de comprovante, recibo, nota fiscal ou print de app (Uber, iFood, etc) e extraia os dados da transação.

Responda APENAS com JSON válido, sem texto adicional:

{
  "valor": número em reais sem símbolo (ex: 45.90),
  "descricao": "nome curto do estabelecimento ou serviço (máx 40 chars)",
  "categoria": uma das opções abaixo,
  "confianca": "alta" | "media" | "baixa"
}

Categorias: ${CATEGORIAS.join(', ')}

Regras:
- valor: use o total/valor final. Se não encontrar, retorne null
- Uber/99/InDriver/corrida → "Transporte"
- iFood/Rappi/delivery/restaurante → "Alimentação"  
- confianca: alta = tudo claro; media = alguma dúvida; baixa = muito incerto`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('[ocr] Erro OpenAI:', err);
      // Tratar erro de quota
      if (response.status === 429)
        return NextResponse.json({ error: 'Limite de leituras atingido. Tente mais tarde.' }, { status: 429 });
      return NextResponse.json({ error: 'Erro ao processar imagem' }, { status: 500 });
    }

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content ?? '';

    let resultado: {
      valor: number | null;
      descricao: string;
      categoria: string;
      confianca: string;
    };

    try {
      resultado = JSON.parse(texto.replace(/```json|```/g, '').trim());
    } catch {
      console.error('[ocr] Falha ao parsear:', texto);
      return NextResponse.json({ error: 'Não foi possível extrair dados da imagem' }, { status: 422 });
    }

    if (!CATEGORIAS.includes(resultado.categoria)) resultado.categoria = 'Outros';

    return NextResponse.json({
      success:   true,
      valor:     resultado.valor,
      descricao: resultado.descricao ?? '',
      categoria: resultado.categoria ?? 'Outros',
      confianca: resultado.confianca ?? 'baixa',
    });

  } catch (err: any) {
    console.error('[ocr] Erro interno:', err.message);
    return NextResponse.json({ error: 'Erro interno ao processar imagem' }, { status: 500 });
  }
}