import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

import { NextRequest, NextResponse } from "next/server";

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
      await import("fs").then((fs) =>
        fs.mkdirSync(dataDir, { recursive: true }),
      );
    }
    if (!existsSync(REPOSITORIES_FILE)) {
      await writeFile(REPOSITORIES_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error ensuring data file:", error);
  }
}

// Save repository metadata
async function saveRepository(repository: Repository) {
  try {
    await ensureDataFile();

    const data = await readFile(REPOSITORIES_FILE, "utf-8");
    const repositories: Repository[] = JSON.parse(data);

    repositories.push(repository);

    await writeFile(REPOSITORIES_FILE, JSON.stringify(repositories, null, 2));
  } catch (error) {
    console.error("Error saving repository:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 },
      );
    }

    // Get all files from form data
    const files: File[] = [];
    const formDataEntries = Array.from(formData.entries());

    for (const [key, value] of formDataEntries) {
      if (value instanceof File && key.startsWith("photo_")) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image file is required" },
        { status: 400 },
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save files locally
    const savedFiles: {
      filename: string;
      originalName: string;
      url: string;
    }[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${timestamp}-${randomId}.${extension}`;

      const filePath = join(uploadsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = new Uint8Array(bytes);

      await writeFile(filePath, buffer);

      savedFiles.push({
        filename,
        originalName: file.name,
        url: `/uploads/${filename}`,
      });
    }

    // Create repository object
    const repository: Repository = {
      _id: `repo_${Date.now()}`,
      title,
      images: savedFiles,
      created_at: new Date().toISOString(),
      imageCount: savedFiles.length,
    };

    // Save repository metadata
    await saveRepository(repository);

    return NextResponse.json({
      success: true,
      message: "Repository created successfully (local storage)",
      data: repository,
    });
  } catch (error) {
    console.error("Error creating repository:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
