'use server';
import EnterPasswordForm from "@/ui/enterPasswordForm";

export default async function LoginPage(props: { params: { id: string } }) {
    const params = await props.params;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Enter Password</h1>
                <EnterPasswordForm params={Promise.resolve({ id: params.id })} />
            </div>
        </div>
    );
}