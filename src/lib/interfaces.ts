export interface GoalPage {
    id: string;
    slug: string;
    created_at: string;
    view_password_hash: string;
    edit_password_hash: string;
}
export interface ChecklistItem {
    name: string;
    deadLine: number;
    status: 'incomplete' | 'complete';
}
export interface ChecklistGoalData {
    title: string;
    items: ChecklistItem[];
}
export interface ProgressEntry {
    date: number;
    progress: number;
}
export interface ProgressGoalData {
    title: string;
    currentProgress: number;
    target: number;
    unit: string;
    history: ProgressEntry[];
}

export type Goal = {
    id: string;
    goal_page_id: string;
    completed: boolean;
    deadline: string | null;
    date_finished: string | null;
    created_at: string;
    type: 'checklist'
    data: ChecklistGoalData
} | {
    id: string;
    goal_page_id: string;
    completed: boolean;
    deadline: string | null;
    date_finished: string | null;
    created_at: string;
    type: 'progress'
    data: ProgressGoalData
}