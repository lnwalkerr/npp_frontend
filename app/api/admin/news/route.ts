import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  // 👉 Use authenticated endpoint
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/getAll?${new URLSearchParams(
    {
      page: page.toString(),
      limit: limit.toString(),
      searchText: search,
      type,
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
        news: [],
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
          news: [],
          totalPages: 1,
          totalItems: 0,
          currentPage: page,
        });
      }

      return NextResponse.json(
        { message: data.message || "Failed to fetch news" },
        { status: res.status },
      );
    }

    // Transform backend response to frontend format
    const transformedData = {
      news: data.data.map((newsItem: any) => ({
        id: newsItem._id,
        title: newsItem.title,
        section: newsItem.type || "General",
        date: new Date(newsItem.created_at).toLocaleDateString(),
        author: newsItem.created_by
          ? `${newsItem.created_by.firstName} ${newsItem.created_by.lastName}`
          : "Unknown",
        views: newsItem.viewCount || 0,
        description: newsItem.description || "",
        status: newsItem.isActive ? "Active" : "Inactive",
      })),
      totalPages: data.totalPages || 1,
      totalItems: data.totalCounts || 0,
      currentPage: data.currentPage || page,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("News API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
