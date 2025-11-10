import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
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

// Get repository by ID
async function getRepositoryById(id: string) {
  try {
    await ensureDataFile();

    const data = await readFile(REPOSITORIES_FILE, "utf-8");
    const repositories: Repository[] = JSON.parse(data);

    const repository = repositories.find(repo => repo._id === id);

    if (!repository) {
      return { success: false, message: "Repository not found" };
    }

    return {
      success: true,
      message: "Repository fetched successfully",
      data: repository,
    };
  } catch (error) {
    console.error("Error reading repository:", error);
    return { success: false, message: "Failed to fetch repository" };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Repository ID is required" },
        { status: 400 }
      );
    }

    const result = await getRepositoryById(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in GET /api/admin/images/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
