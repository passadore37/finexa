// lib/mailer.ts — Resend (substitui Nodemailer + Gmail)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Finexa <onboarding@resend.dev>';

export async function enviarEmailBoasVindas(to: string, nome: string, confirmUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: 'Confirme seu email — Finexa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <div style="width:48px;height:48px;background:#5330ff;border-radius:12px;font-size:24px;font-weight:900;color:#fff;line-height:48px;text-align:center;margin-bottom:24px">F</div>
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Bem-vinda ao Finexa, ${nome}! 👋</h1>
        <p style="color:#888;margin:0 0 24px;line-height:1.6">Clique abaixo para confirmar seu email e ativar os 14 dias grátis.</p>
        <a href="${confirmUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">Confirmar email →</a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 24 horas.</p>
      </div>
    `,
  });
}

export async function enviarEmailSenha(to: string, nome: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: 'Redefinir senha — Finexa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Redefinir sua senha</h1>
        <p style="color:#888;margin:0 0 24px">Olá ${nome}, clique abaixo para redefinir sua senha.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">Redefinir senha →</a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 1 hora.</p>
      </div>
    `,
  });
}

export async function enviarEmailConvite(to: string, nomeFamilia: string, nomeQuemConvidou: string, conviteUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `${nomeQuemConvidou} te convidou para o Finexa`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <div style="width:48px;height:48px;background:#5330ff;border-radius:12px;font-size:24px;font-weight:900;color:#fff;line-height:48px;text-align:center;margin-bottom:24px">F</div>
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Você foi convidada! 💜</h1>
        <p style="color:#888;margin:0 0 24px;line-height:1.6"><strong style="color:#f5f5f5">${nomeQuemConvidou}</strong> te convidou para o Finexa.</p>
        <a href="${conviteUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">Aceitar convite →</a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 7 dias.</p>
      </div>
    `,
  });
}

export async function enviarEmailTrialExpirando(to: string, nome: string, diasRestantes: number, upgradeUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Seu trial expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} — Finexa`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Trial expirando em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} ⏰</h1>
        <p style="color:#888;margin:0 0 24px;line-height:1.6">Olá ${nome}! Seu período gratuito termina em breve.</p>
        <a href="${upgradeUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">Assinar agora →</a>
      </div>
    `,
  });
}

export async function enviarEmailSemanal(to: string, nome: string, dados: {
  diasAtivos: number;
  totalGastos: number;
  totalLancamentos: number;
  metasAtualizadas: number;
  semana: string;
}) {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  return resend.emails.send({
    from: FROM, to,
    subject: `Seu resumo da semana — Finexa 📊`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <div style="width:48px;height:48px;background:#5330ff;border-radius:12px;font-size:24px;font-weight:900;color:#fff;line-height:48px;text-align:center;margin-bottom:24px">F</div>
        <h1 style="font-size:20px;font-weight:900;margin:0 0 4px">Olá, ${nome}! 👋</h1>
        <p style="color:#888;margin:0 0 24px;font-size:13px">Resumo da semana ${dados.semana}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <div style="background:#1a1a1a;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#5330ff">${dados.diasAtivos}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Dias ativos</div>
          </div>
          <div style="background:#1a1a1a;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#ff64ca">${dados.totalLancamentos}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Lançamentos</div>
          </div>
          <div style="background:#1a1a1a;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:20px;font-weight:900;color:#ffa857">${fmt(dados.totalGastos)}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Gastos registrados</div>
          </div>
          <div style="background:#1a1a1a;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#01b695">${dados.metasAtualizadas}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px">Metas atualizadas</div>
          </div>
        </div>
        ${dados.diasAtivos === 0
          ? `<div style="background:#2a1a1a;border:1px solid #E24B4A33;border-radius:12px;padding:16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#E24B4A">Você não lançou nada essa semana 😅 — leva só 30 segundos!</p></div>`
          : dados.diasAtivos >= 5
          ? `<div style="background:#1a2a1a;border:1px solid #01b69533;border-radius:12px;padding:16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#01b695">🔥 Incrível! Você ficou ativa ${dados.diasAtivos} dias essa semana!</p></div>`
          : `<div style="background:#1a1a2a;border:1px solid #5330ff33;border-radius:12px;padding:16px;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#82a1fd">💪 Boa semana! Tente registrar pelo menos 1 gasto por dia.</p></div>`
        }
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:14px">Abrir Finexa →</a>
        <p style="color:#555;font-size:11px;margin-top:24px">Você recebe este email toda segunda-feira como participante do beta.</p>
      </div>
    `,
  });
}