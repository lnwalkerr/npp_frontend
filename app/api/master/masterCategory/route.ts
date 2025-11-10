import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";

  // Get token from cookies (optional since backend doesn't require auth)
  const cookies = req.headers.get("cookie") || "";
  const cookieObj: { [key: string]: string } = {};

  if (cookies) {
    cookies.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");

      if (name && value) {
        cookieObj[name.trim()] = decodeURIComponent(value.trim());
      }
    });
  }

  const token = cookieObj["token"] || "";

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/master/masterCategory/getAll${code ? `?code=${code}` : ""}`;

  try {
    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(API_URL, {
      method: "GET",
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch master categories" },
        { status: res.status },
      );
    }

    // Return raw backend response
    return NextResponse.json(data);
  } catch (error) {
    console.error("MasterCategory API error:", error);

    return NextResponse.json(
      { message: "Internal server error", data: [], status_code: 500 },
      { status: 500 },
    );
  }
}
