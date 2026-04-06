// lib/resend.ts — cliente Resend + templates de email

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Finexa <noreply@finexa.app>';

// ─── Email de boas-vindas / confirmação ──────────────────────────────────────
export async function enviarEmailBoasVindas(to: string, nome: string, confirmUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: 'Confirme seu email — Finexa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <div style="width:48px;height:48px;background:#5330ff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;margin-bottom:24px">F</div>
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Bem-vinda ao Finexa, ${nome}! 👋</h1>
        <p style="color:#888;margin:0 0 24px;line-height:1.6">Seu trial de 14 dias começa assim que você confirmar o email. Nenhum cartão necessário agora.</p>
        <a href="${confirmUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">
          Confirmar email →
        </a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 24 horas. Se não foi você, ignore este email.</p>
      </div>
    `,
  });
}

// ─── Reset de senha ───────────────────────────────────────────────────────────
export async function enviarEmailSenha(to: string, nome: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: 'Redefinir senha — Finexa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Redefinir sua senha</h1>
        <p style="color:#888;margin:0 0 24px">Olá ${nome}, recebemos uma solicitação para redefinir sua senha.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">
          Redefinir senha →
        </a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 1 hora. Se não foi você, ignore este email.</p>
      </div>
    `,
  });
}

// ─── Convite de membro ────────────────────────────────────────────────────────
export async function enviarEmailConvite(to: string, nomeFamilia: string, nomeQuemConvidou: string, conviteUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `${nomeQuemConvidou} te convidou para o Finexa`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <div style="width:48px;height:48px;background:#5330ff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;margin-bottom:24px">F</div>
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Você foi convidada! 💜</h1>
        <p style="color:#888;margin:0 0 8px;line-height:1.6"><strong style="color:#f5f5f5">${nomeQuemConvidou}</strong> te convidou para gerenciar as finanças juntas no Finexa.</p>
        <p style="color:#888;margin:0 0 24px;line-height:1.6">Clique abaixo para criar sua conta e entrar na família <strong style="color:#f5f5f5">${nomeFamilia}</strong>.</p>
        <a href="${conviteUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">
          Aceitar convite →
        </a>
        <p style="color:#555;font-size:12px;margin-top:24px">Link válido por 7 dias.</p>
      </div>
    `,
  });
}

// ─── Trial expirando ──────────────────────────────────────────────────────────
export async function enviarEmailTrialExpirando(to: string, nome: string, diasRestantes: number, upgradeUrl: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Seu trial expira em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} — Finexa`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0f0f0f;color:#f5f5f5;border-radius:16px">
        <h1 style="font-size:22px;font-weight:900;margin:0 0 8px">Trial expirando em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} ⏰</h1>
        <p style="color:#888;margin:0 0 24px;line-height:1.6">Olá ${nome}! Seu período gratuito termina em breve. Para continuar usando o Finexa, assine agora.</p>
        <a href="${upgradeUrl}" style="display:inline-block;background:#5330ff;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:900;font-size:15px">
          Assinar agora →
        </a>
      </div>
    `,
  });
}
