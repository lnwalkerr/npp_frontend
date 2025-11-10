import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // 👉 Replace with your backend URL
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Login failed" },
      { status: res.status },
    );
  }

  // ✅ assume backend returns token in `data.token`
  const response = NextResponse.json({
    message: "Login successful",
    user: data.user,
  });

  response.cookies.set("token", data.token, {
    httpOnly: true,
    path: "/",
  });

  return response;
}
