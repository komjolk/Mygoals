'use server'
import { createAccessSession } from "@/lib/data"

export default async function  enterPasswordAction(formData: FormData, slug : string) {
    const password = formData.get("password") as string;
    try {
        const accessToken = await createAccessSession(slug, password, false);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`; // 1 day
        window.location.href = `/goal/${slug}`;
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
}