import bcrypt from "bcryptjs";
import postgres  from "postgres";
import { fetchGoalPageBySlug } from "./lib/data";

const sql = postgres(process.env.DATABASE_URL!);

export async function authenticateViewAccess(goalPageID: string, providedToken: string) : Promise<boolean> {
  const accessTokens = await sql`
    SELECT token_hash, expires_at
    FROM goal_access_settings
    WHERE goal_page_id = ${goalPageID}
  ` as {token_hash: string, expires_at : string}[];
  if (accessTokens.length === 0) {
    return Promise.resolve(false);
  }
  for (const token of accessTokens) {
    const isMatch = await bcrypt.compare(providedToken, token.token_hash);
    if (isMatch && (Date.now() - new Date(token.expires_at).getTime()) < 24 * 60 * 60 * 1000) {
      return true;
    }
  }
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
  for (const token of accessTokens) {
    const isMatch = await bcrypt.compare(providedToken, token.token_hash);
    if (isMatch && (Date.now() - new Date(token.expires_at).getTime()) < 24 * 60 * 60 * 1000) {
      return true;
    }
  }
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
    ) ON CONFLICT (token_hash) DO UPDATE SET token_hash = EXCLUDED.token_hash, is_edit = EXCLUDED.is_edit, created_at = CURRENT_TIMESTAMP
  `;
  return token;
}

export async function createAccessSession(slug: string, password: string) : Promise<string | "not_found" | "wrong_password"> {
  const goalPage = await fetchGoalPageBySlug(slug);
  if (!goalPage) {
      return("not_found");
  }
  if(typeof password !== 'string' || password.length === 0) 
      return("wrong_password");
  let token = '';
  if(await bcrypt.compare(password, goalPage.view_password_hash))
    token = await createAccessToken(goalPage.id, false);
  else if(goalPage.edit_password_hash && await bcrypt.compare(password, goalPage.edit_password_hash))
    token = await createAccessToken(goalPage.id, true);
    

  if (token === '') {
      return("wrong_password");
  }
  
  return token;
}