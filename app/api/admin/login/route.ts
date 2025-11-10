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

  // Return the backend response directly, ensuring token is included
  const response = NextResponse.json({
    message: "Login successful",
    token: data.token,
    user: data.data,
  });

  response.cookies.set("token", data.token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
