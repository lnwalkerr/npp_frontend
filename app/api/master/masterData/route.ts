import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";
  const value = searchParams.get("value") || "";
  const masterCategoryId = searchParams.get("masterCategoryId") || "";

  // Get token from cookies (set by login API)
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

  let API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/master/masterData/getAll`;
  const params = new URLSearchParams();

  if (masterCategoryId) {
    // If masterCategoryId is provided, use the specific endpoint
    API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/master/masterData/getByMasterCategoryId?masterCategoryId=${masterCategoryId}`;
  } else {
    if (code) params.append("code", code);
    if (value) params.append("value", value);
    if (params.toString()) {
      API_URL += `?${params.toString()}`;
    }
  }

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
        { message: data.message || "Failed to fetch master data" },
        { status: res.status },
      );
    }

    // Return raw backend response
    return NextResponse.json(data);
  } catch (error) {
    console.error("MasterData API error:", error);

    return NextResponse.json(
      { message: "Internal server error", data: [], status_code: 500 },
      { status: 500 },
    );
  }
}
