import 'server-only';
import { db } from '../db';
import { randomToken, sha256 } from '../crypto';

export type EmailTokenType = 'verify_email' | 'reset_password' | 'invite';

const HOUR = 60 * 60 * 1000;

export const TOKEN_TTL_MS: Record<EmailTokenType, number> = {
  verify_email: 24 * HOUR,
  reset_password: 1 * HOUR,
  invite: 72 * HOUR,
};

/** Creates a single-use token for an email link, revoking earlier unused tokens of the same type. */
export async function issueEmailToken(userId: string, type: EmailTokenType): Promise<string> {
  const raw = randomToken();
  await db.transaction(async (trx) => {
    await trx('user_tokens')
      .where({ user_id: userId, type })
      .whereNull('used_at')
      .update({ used_at: trx.fn.now() });
    await trx('user_tokens').insert({
      user_id: userId,
      type,
      token_hash: sha256(raw),
      expires_at: new Date(Date.now() + TOKEN_TTL_MS[type]),
    });
  });
  return raw;
}

/**
 * Atomically marks a token as used and returns its user id, or null when the token is unknown,
 * already used, expired or of another type.
 */
export async function consumeEmailToken(raw: string, type: EmailTokenType): Promise<string | null> {
  const [row] = await db('user_tokens')
    .where({ token_hash: sha256(raw), type })
    .whereNull('used_at')
    .where('expires_at', '>', db.fn.now())
    .update({ used_at: db.fn.now() })
    .returning<{ user_id: string }[]>('user_id');
  return row?.user_id ?? null;
}

/** The user id of a currently usable token, without consuming it (to show the form or an error). */
export async function peekEmailToken(
  raw: string | undefined,
  type: EmailTokenType
): Promise<string | null> {
  if (!raw) return null;
  const row = await db('user_tokens')
    .where({ token_hash: sha256(raw), type })
    .whereNull('used_at')
    .where('expires_at', '>', db.fn.now())
    .first<{ user_id: string } | undefined>('user_id');
  return row?.user_id ?? null;
}
