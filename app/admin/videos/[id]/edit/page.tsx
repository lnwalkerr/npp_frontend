"use client";

import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea } from "@heroui/react";
import { Form } from "@heroui/form";

interface VideoData {
  id: string;
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  tags: string[];
  isActive: boolean;
}

export default function EditVideoPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const handleBack = (): void => {
    router.push("/admin/videos");
  };

  // Fetch video data on component mount
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/videos/getById?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          setVideoData(data.data);
        } else {
          console.error("Failed to fetch video");
          alert("Failed to load video data");
          router.push("/admin/videos");
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        alert("Error loading video data");
        router.push("/admin/videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!videoData) return;

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      const tagsInput = (formData.get("tags") as string) || "";
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const data = {
        title: (formData.get("title") as string) || "",
        description: (formData.get("description") as string) || "",
        videoUrl: (formData.get("videoUrl") as string) || "",
        thumbnailUrl: (formData.get("thumbnailUrl") as string) || "",
        duration: (formData.get("duration") as string) || "",
        tags: tags,
      };

      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/videos/update?id=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Video updated successfully!");
        router.push("/admin/videos");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to update video");
      }
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Error updating video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/videos");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Video not found</p>
            <Button onClick={() => router.push("/admin/videos")}>
              Back to Videos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center justify-center p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Go back"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Video</h1>
          <p className="mt-1 text-gray-500">Update the video details</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Video Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Video Title */}
              <Input
                isRequired
                defaultValue={videoData.title}
                errorMessage="Please enter a title"
                label="Video Title"
                labelPlacement="outside"
                name="title"
                placeholder="Video title"
                type="text"
              />

              {/* Video URL */}
              <Input
                isRequired
                defaultValue={videoData.videoUrl}
                errorMessage="Please enter a video URL"
                label="Video URL"
                labelPlacement="outside"
                name="videoUrl"
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />

              {/* Thumbnail URL */}
              <Input
                defaultValue={videoData.thumbnailUrl || ""}
                label="Thumbnail URL"
                labelPlacement="outside"
                name="thumbnailUrl"
                placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                type="url"
              />

              {/* Duration */}
              <Input
                defaultValue={videoData.duration || ""}
                label="Duration"
                labelPlacement="outside"
                name="duration"
                placeholder="15:30"
                type="text"
              />

              {/* Tags */}
              <Input
                defaultValue={videoData.tags?.join(", ") || ""}
                label="Tags"
                labelPlacement="outside"
                name="tags"
                placeholder="education, technology, community (comma-separated)"
                type="text"
              />

              {/* Description */}
              <Textarea
                isRequired
                defaultValue={videoData.description}
                errorMessage="Please enter a valid description"
                label="Description"
                labelPlacement="outside"
                minRows={4}
                name="description"
                placeholder="Video description"
                variant="flat"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" disabled={submitting} type="submit">
                  {submitting ? "Saving..." : "Save Video"}
                </Button>
                <Button
                  disabled={submitting}
                  type="button"
                  variant="flat"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </CardBody>

        <CardFooter />
      </Card>
    </div>
  );
}
