'use server';

import postgres from "postgres";
import bcrypt from "bcryptjs";
import { GoalPage, Goal} from "./interfaces";
import { authenticateViewAccess} from "../auth";

const sql = postgres(process.env.DATABASE_URL!);

export async function fetchGoalPageBySlug(slug: string) : Promise<GoalPage> {
    const goalPages = await sql<GoalPage[]>`
        SELECT id, slug, created_at, view_password_hash, edit_password_hash
        FROM goal_pages
        WHERE slug = ${slug}
    `;
    return goalPages[0];
}

export async function fetchGoalPage(slug: string, accessToken?: string) : Promise<GoalPage | "password_needed" | "not_found"> {
    const goalPage = await fetchGoalPageBySlug(slug);
    if (!goalPage) {
        return "not_found";
    }
    if (goalPage.view_password_hash === null) {
        return goalPage;
    }
    if (!accessToken) {
        return "password_needed";
    }
    const isAuthenticated = await authenticateViewAccess(goalPage.id, accessToken);
    if (!isAuthenticated) {
        return "password_needed";
    }
    return goalPage;
}



export async function fetchGoalsForGoalPage(goalPageId: string) : Promise<Goal[]> {
    const goals = await sql<Goal[]>`
        SELECT id, goal_page_id, completed, deadline, date_finished, created_at, type, data
        FROM goals
        WHERE goal_page_id = ${goalPageId}
        ORDER BY created_at DESC
    `;
    return goals;
}

