'use server';
import { createAccessSession } from "@/lib/data"


export default async function EnterPasswordForm(props: { params: Promise<{ id: string}> }) {
    const params = await props.params;

return <form action={async (formData: FormData) => {
        'use server';
    const password = formData.get("password") as string;
        try {
            const accessToken = await createAccessSession(params.id, password, false);
            document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`; // 1 day
            window.location.href = `/goal/${params.id}`;
            console.log("Access token:", accessToken);
        } catch (e) {
            if (e === "not_found") {
                alert("Goal page not found");
            } else if (e === "wrong_password") {
                alert("Wrong password");
            } else {
                alert("An error occurred");
            }
        }
    }} className="flex flex-col gap-4">
        <label htmlFor="password">
            Password:
        </label>
        <input type="password" id="password" name="password" placeholder="Enter password" required />
        <button type="submit">Submit</button>
    </form>
}