import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const userType = searchParams.get("userType") || "";

  // 👉 Use admin endpoint (requires auth) - for now we'll handle auth issues
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/getAll?${new URLSearchParams(
    {
      page: page.toString(),
      limit: limit.toString(),
      search,
      userType,
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
        users: [],
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
          users: [],
          totalPages: 1,
          totalItems: 0,
          currentPage: page,
        });
      }

      return NextResponse.json(
        { message: data.message || "Failed to fetch users" },
        { status: res.status },
      );
    }

    // Transform backend response to frontend format
    const transformedData = {
      users: data.data.map((user: any) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        gender: user.gender || "Not specified",
        dob: user.dob || "Not specified",
        address: user.address || "Not specified",
        userType: user.userType?.title || "Unknown",
        constituency: user.constituency?.value || "Not specified",
        registrationType: user.registrationType?.value || "Not specified",
        status: user.status ? "Active" : "Inactive",
      })),
      totalPages: Math.ceil(data.totalCounts / limit),
      totalItems: data.totalCounts,
      currentPage: page,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Users API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}


