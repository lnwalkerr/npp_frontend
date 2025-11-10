import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/leaders/getAll?${params}`;

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Return empty data for 401/403 errors to prevent crashes
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          data: [],
          totalCounts: 0,
          message: "No leaders found",
        });
      }

      return NextResponse.json(
        { message: data.message || "Failed to fetch leaders" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Leaders fetch error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}


