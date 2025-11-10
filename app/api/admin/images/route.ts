import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface Repository {
  _id: string;
  title: string;
  images: Array<{ url: string; filename: string; originalName: string }>;
  created_at: string;
  imageCount: number;
}

const REPOSITORIES_FILE = join(process.cwd(), "data", "repositories.json");

// Ensure data directory and repositories file exist
async function ensureDataFile() {
  const dataDir = join(process.cwd(), "data");
  try {
    if (!existsSync(dataDir)) {
      await import("fs").then(fs => fs.mkdirSync(dataDir, { recursive: true }));
    }
    if (!existsSync(REPOSITORIES_FILE)) {
      await writeFile(REPOSITORIES_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error ensuring data file:", error);
  }
}

// Get all repositories with pagination and search
async function getRepositories(page: number = 1, limit: number = 10, search: string = "") {
  try {
    await ensureDataFile();

    const data = await readFile(REPOSITORIES_FILE, "utf-8");
    let repositories: Repository[] = JSON.parse(data);

    // Filter by search term if provided
    if (search) {
      repositories = repositories.filter(repo =>
        repo.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    repositories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalItems = repositories.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRepositories = repositories.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Repositories fetched successfully",
      data: paginatedRepositories,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error reading repositories:", error);
    return {
      success: false,
      message: "Failed to fetch repositories",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const result = await getRepositories(page, limit, search);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/admin/images:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      { status: 500 }
    );
  }
}

