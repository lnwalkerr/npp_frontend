import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    // Fetch data from multiple endpoints concurrently
    const [usersRes, newsRes, donationsRes] = await Promise.all([
      fetch(`${baseUrl}/getAll`, {
        headers: authHeaders,
      }),
      fetch(`${baseUrl}/news/getAll`, {
        headers: authHeaders,
      }),
      fetch(`${baseUrl}/donation/getAll`, {
        headers: authHeaders,
      }),
    ]);

    const [usersData, newsData, donationsData] = await Promise.all([
      usersRes.ok ? usersRes.json() : { totalCounts: 0, data: [] },
      newsRes.ok ? newsRes.json() : { data: [] },
      donationsRes.ok ? donationsRes.json() : { data: [] },
    ]);

    // Calculate statistics
    const totalUsers = usersData.totalCounts || 0;
    const totalNews = newsData.data?.length || 0;
    const totalDonations = donationsData.data?.length || 0;

    // Calculate user growth (simplified - would need proper date filtering)
    const userGrowthChange = "+12% from last month";

    // Calculate donation amount (simplified - would need actual donation transactions)
    const totalDonationAmount = "14,581";

    // Calculate news change
    const newsChange = "+5% from last month";

    // Calculate events (hardcoded for now since no events endpoint exists)
    const totalEvents = 24;
    const eventsChange = "+2% from last month";

    // Generate chart data (simplified - would need proper date aggregation)
    const userGrowthData = [
      { name: "Jan", users: 400 },
      { name: "Feb", users: 520 },
      { name: "Mar", users: 680 },
      { name: "Apr", users: 750 },
      { name: "May", users: 890 },
      { name: "Jun", users: 1050 },
    ];

    const activityData = [
      { name: "Jan", Donations: 2400, News: 24 },
      { name: "Feb", Donations: 2210, News: 32 },
      { name: "Mar", Donations: 2290, News: 28 },
      { name: "Apr", Donations: 2000, News: 35 },
      { name: "May", Donations: 2181, News: 42 },
      { name: "Jun", Donations: 2500, News: 38 },
    ];

    const dashboardData = {
      statistics: [
        {
          title: "Total Users",
          value: totalUsers.toString(),
          change: userGrowthChange,
        },
        {
          title: "Total Donations",
          value: totalDonationAmount,
          change: "+8% from last month",
        },
        {
          title: "News Articles",
          value: totalNews.toString(),
          change: newsChange,
        },
        {
          title: "Events",
          value: totalEvents.toString(),
          change: eventsChange,
        },
      ],
      userGrowthChart: userGrowthData,
      activityChart: activityData,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
