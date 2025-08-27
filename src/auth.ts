import bcrypt from "bcryptjs";
import postgres  from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export async function authenticateViewAccess(goalPageID: string, providedToken: string) : Promise<boolean> {
  const accessTokens = await sql`
    SELECT token_hash, created_at
    FROM goal_access_settings
    WHERE goal_page_id = ${goalPageID}
  ` as {token_hash: string, expires_at : string}[];
  if (accessTokens.length === 0) {
    return Promise.resolve(false);
  }
  accessTokens.forEach(async (token) => {
    const isMatch = await bcrypt.compare(providedToken, token.token_hash);
    if (isMatch && (Date.now() - new Date(token.expires_at).getTime()) < 24 * 60 * 60 * 1000) {
      return true;
    }
  });
  return false

}

export async function authenticateEditAccess(goalPageID: string, providedToken: string) : Promise<boolean> {
  const accessTokens = await sql`
    SELECT token_hash, created_at
    FROM goal_access_settings
    WHERE goal_page_id = ${goalPageID} AND is_edit = TRUE
  ` as {token_hash: string, expires_at : string}[];
  if (accessTokens.length === 0) {
    return Promise.resolve(false);
  }
  accessTokens.forEach(async (token) => {
    const isMatch = await bcrypt.compare(providedToken, token.token_hash);
    if (isMatch && (Date.now() - new Date(token.expires_at).getTime()) < 24 * 60 * 60 * 1000) {
      return true;
    }
  });
  return false

}

export async function createAccessToken(goalPageID: string, isEdit: boolean) : Promise<string> {
  const token = Math.random().toString(36).substring(2);
  const tokenHash = await bcrypt.hash(token, 10);
  await sql`
    INSERT INTO goal_access_settings (token_hash, goal_page_id, is_edit) VALUES (
      ${tokenHash},
      ${goalPageID},
      ${isEdit}
    ) ON CONFLICT (goal_page_id) DO UPDATE SET token_hash = EXCLUDED.token_hash, is_edit = EXCLUDED.is_edit, created_at = CURRENT_TIMESTAMP
  `;
  return token;
}