import { NextResponse } from "next/server";
import { saveUser, findUserByEmail } from "@/lib/auth-utils";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Password policy check
        if (password.length < 12) {
            return NextResponse.json({ error: "Password does not meet military protocol (min 12 chars)" }, { status: 400 });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: "Operator identity already established" }, { status: 400 });
        }

        const user = await saveUser({ username, email, password });
        return NextResponse.json({ success: true, user: { email: user.email } });
    } catch (error) {
        return NextResponse.json({ error: "Internal Protocol Failure" }, { status: 500 });
    }
}
