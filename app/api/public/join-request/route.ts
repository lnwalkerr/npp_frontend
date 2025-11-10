import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const { fullName, email, phone, constituency, type } = body;

    if (!fullName || !email || !phone || !constituency || !type) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/public/join-request/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to submit join request" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating join request:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
