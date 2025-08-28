'use server';
import { createAccessSession } from "../lib/data";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

export default async function EnterPasswordForm(props: { params: Promise<{ id: string}> }) {
    const params = await props.params;

    async function enterPasswordAction(formData: FormData) {
        'use server';
        const password = formData.get("password") as string;
        const id = params.id; // Extract the `id` from `params`
        const cookieStore = await cookies();
        try {
            const accessToken = await createAccessSession(id, password, false);
            cookieStore.set({
                name: `goal_access_${id}`,
                value: accessToken,
                httpOnly: true,
            });
        } catch (e) {
            if (e === "not_found") {
                throw new Error("Goal page not found");
            } else if (e === "wrong_password") {
                throw new Error("Wrong password");
            } else {
                throw new Error("An error occurred");
            }
        }
        redirect("/goal/" + id);

    }
return <form action={enterPasswordAction} className="flex flex-col gap-4">
        <label htmlFor="password">
            Password:
        </label>
        <input type="password" id="password" name="password" placeholder="Enter password" required />
        <button type="submit">Submit</button>
    </form>
}