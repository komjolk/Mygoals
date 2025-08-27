import {fetchGoalPage, fetchGoalsForGoalPage} from "@/lib/data";
import { redirect } from "next/navigation";
export default async function GoalPage(props: { params: Promise<{ id: string}> }) {
    const params = await props.params;

    const goalPage = await fetchGoalPage(params.id);
    if (goalPage === "not_found") {
        throw new Error("Goal page not found");
    } else if (goalPage === "password_needed") {
        redirect(`/goal/${params.id}/enterPassword`);
    }

    const goals = await fetchGoalsForGoalPage(goalPage.id);

    return<div>Goal Page: {goalPage.slug}</div>
}