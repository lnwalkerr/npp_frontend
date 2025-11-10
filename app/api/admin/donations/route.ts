import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // 👉 Replace with your backend URL
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/donation/getAll?${new URLSearchParams(
    {
      page: page.toString(),
      limit: limit.toString(),
      search,
    },
  ).toString()}`;

  try {
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

    if (!token) {
      return NextResponse.json({
        donations: [],
        totalPages: 1,
        totalItems: 0,
        currentPage: page,
      });
    }

    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      // Return empty data for auth errors to avoid breaking the UI
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({
          donations: [],
          totalPages: 1,
          totalItems: 0,
          currentPage: page,
        });
      }

      return NextResponse.json(
        { message: data.message || "Failed to fetch donations" },
        { status: res.status },
      );
    }

    // Transform backend response to frontend format
    const transformedData = {
      donations: data.data.map((donation: any) => ({
        id: donation._id,
        title: donation.title,
        type: donation.typeOfDonation?.value || "General",
        goal: donation.totalGoal || 0,
        description: donation.description || "",
        status: donation.status ? "Active" : "Inactive",
        createdAt: new Date(donation.created_at).toLocaleDateString(),
        createdBy: donation.created_by
          ? `${donation.created_by.firstName} ${donation.created_by.lastName}`
          : "Unknown",
      })),
      totalPages: Math.ceil(data.data.length / limit), // Backend doesn't return total count
      totalItems: data.data.length,
      currentPage: page,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Donations API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}


