import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, unlink } from "fs/promises";
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

// Delete repository and its images
async function deleteRepository(id: string) {
  try {
    await ensureDataFile();

    const data = await readFile(REPOSITORIES_FILE, "utf-8");
    const repositories: Repository[] = JSON.parse(data);

    const repositoryIndex = repositories.findIndex(repo => repo._id === id);

    if (repositoryIndex === -1) {
      return { success: false, message: "Repository not found" };
    }

    const repository = repositories[repositoryIndex];

    // Delete all images associated with this repository
    for (const image of repository.images) {
      try {
        const imagePath = join(process.cwd(), "public", image.url);
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch (error) {
        console.error(`Error deleting image ${image.filename}:`, error);
        // Continue with other images even if one fails
      }
    }

    // Remove repository from array
    repositories.splice(repositoryIndex, 1);

    // Save updated repositories
    await writeFile(REPOSITORIES_FILE, JSON.stringify(repositories, null, 2));

    return {
      success: true,
      message: "Repository and associated images deleted successfully",
      deletedImages: repository.images.length
    };

  } catch (error) {
    console.error("Error deleting repository:", error);
    return { success: false, message: "Failed to delete repository" };
  }
}

export async function DELETE(
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

    const result = await deleteRepository(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in DELETE /api/admin/images/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
