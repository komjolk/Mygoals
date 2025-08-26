import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function seedGoalPages() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS goal_pages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            slug varchar(100) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            view_password_hash VARCHAR(60),
            edit_password_hash VARCHAR(60)

        )
    `;
    await sql`
        iNSERT INTO goal_pages (slug, view_password_hash, edit_password_hash) VALUES (
            'my-first-goal-page',
            ${await bcrypt.hash('viewpassword', 10)},
            ${await bcrypt.hash('editpassword', 10)}
        ) ON CONFLICT (slug) DO NOTHING
    `;
}

async function seedGoals() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS goals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            goal_page_id UUID REFERENCES goal_pages(id) ON DELETE CASCADE,
            completed BOOLEAN DEFAULT FALSE,
            deadline TIMESTAMP,
            date_finished TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type varchar(20) NOT NULL,
            data JSONB NOT NULL
        )
    `;
    await sql`
        INSERT INTO goals (goal_page_id, type, data) VALUES (
            (SELECT id FROM goal_pages WHERE slug = 'my-first-goal-page'),
            'checklist', ${JSON.stringify({title: 'My first checklist goal', items: [{name: 'Item 1', deadLine: 1787727200, status: 'incomplete'}, {name: 'Item 2', deadLine: 1787727200, status: 'incomplete'}]})}
        ) ON CONFLICT DO NOTHING
    `;
    await sql`
        INSERT INTO goals (goal_page_id, type, data) VALUES (
            (SELECT id FROM goal_pages WHERE slug = 'my-first-goal-page'),
            'progress', ${JSON.stringify({title: 'My first progress goal', currentProgress: 20, target: 100, unit: 'hours', history : [{date: 1753512800, progress: 5}, {date: 1756198497, progress: 20}]})}
        ) ON CONFLICT DO NOTHING
         `;
};

export default async function main() {
    try {
        sql.begin(async (sql) => {
            await seedGoalPages();
            await seedGoals();
        });
        return 'Database seeded successfully'
    } catch (error) {
        console.error('Error during seeding:', error);
        return 'Error during seeding' 
    }
}
