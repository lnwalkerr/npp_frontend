import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";

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
      userTypes: [],
      totalPages: 1,
      totalItems: 0,
    });
  }

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/userType/getAll${type ? `?type=${type}` : ""}`;

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({
          userTypes: [],
          totalPages: 1,
          totalItems: 0,
        });
      }

      return NextResponse.json(
        { message: data.message || "Failed to fetch user types" },
        { status: res.status },
      );
    }

    // Transform backend response to frontend format
    const transformedData = {
      userTypes: data.data.map((userType: any) => ({
        id: userType._id,
        type: userType.type,
        title: userType.title,
        description: userType.description,
        createdAt: new Date(userType.created_at).toLocaleDateString(),
        updatedAt: new Date(userType.updated_at).toLocaleDateString(),
      })),
      totalPages: Math.ceil(data.data.length / 10), // Assuming 10 per page
      totalItems: data.data.length,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("UserType API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
