import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface Repository {
  _id: string;
  title: string;
  images: Array<{ url: string; filename: string; originalName: string; description?: string }>;
  created_at: string;
  updated_at?: string;
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

// Update repository
async function updateRepository(id: string, title: string, newFiles: File[] = [], imagesToDelete: string[] = []) {
  try {
    await ensureDataFile();

    const data = await readFile(REPOSITORIES_FILE, "utf-8");
    const repositories: Repository[] = JSON.parse(data);

    const repositoryIndex = repositories.findIndex(repo => repo._id === id);

    if (repositoryIndex === -1) {
      return { success: false, message: "Repository not found" };
    }

    const repository = repositories[repositoryIndex];

    // Update title
    repository.title = title;

    // Handle image deletions
    if (imagesToDelete.length > 0) {
      for (const filename of imagesToDelete) {
        try {
          // Remove from filesystem
          const filePath = join(process.cwd(), "public", "uploads", filename);
          if (existsSync(filePath)) {
            await unlink(filePath);
          }

          // Remove from repository images array
          repository.images = repository.images.filter(img => img.filename !== filename);
        } catch (error) {
          console.error(`Error deleting image ${filename}:`, error);
          // Continue with other deletions
        }
      }
    }

    // Note: Individual image descriptions are not used in this implementation
    // The description is at the repository level, not per image

    // Handle new file uploads
    if (newFiles.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, continue
      }

      // Save new files
      const savedFiles: { filename: string; originalName: string; url: string; description?: string }[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1e9);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomId}.${extension}`;

        const filePath = join(uploadsDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);

        await writeFile(filePath, buffer);

        savedFiles.push({
          filename,
          originalName: file.name,
          url: `/uploads/${filename}`
        });
      }

      // Add new files to repository
      repository.images.push(...savedFiles);
    }

    repository.imageCount = repository.images.length;

    repository.updated_at = new Date().toISOString();

    // Save updated repositories
    await writeFile(REPOSITORIES_FILE, JSON.stringify(repositories, null, 2));

    return {
      success: true,
      message: "Repository updated successfully",
      data: repository,
    };

  } catch (error) {
    console.error("Error updating repository:", error);
    return { success: false, message: "Failed to update repository" };
  }
}

export async function PATCH(
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

    const formData = await request.formData();
    const title = formData.get("title") as string;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    // Get images to delete
    const imagesToDeleteJson = formData.get("imagesToDelete") as string;
    const imagesToDelete: string[] = imagesToDeleteJson ? JSON.parse(imagesToDeleteJson) : [];

    // Note: Individual image descriptions are not used in this implementation

    // Get all new files from form data
    const newFiles: File[] = [];
    const formDataEntries = Array.from(formData.entries());
    for (const [key, value] of formDataEntries) {
      if (value instanceof File && key.startsWith("photo_")) {
        newFiles.push(value);
      }
    }

    const result = await updateRepository(id, title, newFiles, imagesToDelete);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in PATCH /api/admin/images/[id]/update:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
