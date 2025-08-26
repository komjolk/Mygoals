import {fetchGoalPageBySlug, fetchGoalsForGoalPage} from "@/lib/data";

export default async function GoalPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const goalPage = await fetchGoalPageBySlug(params.id);

    const goals = await fetchGoalsForGoalPage(goalPage.id);

    return<div>Goal Page: {goalPage.slug}</div>
}