'use server';

import postgres from "postgres";
import bcrypt from "bcryptjs";
import { GoalPage} from "./interfaces";

const sql = postgres(process.env.DATABASE_URL!);

export async function fetchGoalPageBySlug(slug: string) : Promise<GoalPage> {
    const goalPages = await sql<GoalPage[]>`
        SELECT id, slug, created_at, view_password_hash, edit_password_hash
        FROM goal_pages
        WHERE slug = ${slug}
    `;
    return goalPages[0];
}


export async function fetchGoalsForGoalPage(goalPageId: string) {
    const goals = await sql`
        SELECT id, goal_page_id, completed, deadline, date_finished, created_at, type, data
        FROM goals
        WHERE goal_page_id = ${goalPageId}
        ORDER BY created_at DESC
    `;
    return goals;
}