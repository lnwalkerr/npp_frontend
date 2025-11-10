import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
      type,
      status,
      search,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/admin/join-requests/getAll?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch join requests" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching join requests:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
