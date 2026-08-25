import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail en wachtwoord zijn verplicht." },
        { status: 400 },
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens." },
        { status: 401 },
      );
    }

    await createSession(user);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Inloggen mislukt." },
      { status: 500 },
    );
  }
}
