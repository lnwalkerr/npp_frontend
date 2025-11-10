"use client";

import { useState, FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea } from "@heroui/react";
import { Form } from "@heroui/form";

export default function CreateVideoPage(): JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleBack = (): void => {
    router.push("/admin/videos");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

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
      const response = await fetch("/api/admin/videos/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Video created successfully!");
        router.push("/admin/videos");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to create video");
      }
    } catch (error) {
      console.error("Error creating video:", error);
      alert("Error creating video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/videos");
  };

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
          <h1 className="text-3xl font-bold text-foreground">Create Video</h1>
          <p className="mt-1 text-gray-500">Fill in the video details</p>
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
                errorMessage="Please enter a video URL"
                label="Video URL"
                labelPlacement="outside"
                name="videoUrl"
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />

              {/* Thumbnail URL */}
              <Input
                label="Thumbnail URL"
                labelPlacement="outside"
                name="thumbnailUrl"
                placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                type="url"
              />

              {/* Duration */}
              <Input
                label="Duration"
                labelPlacement="outside"
                name="duration"
                placeholder="15:30"
                type="text"
              />

              {/* Tags */}
              <Input
                label="Tags"
                labelPlacement="outside"
                name="tags"
                placeholder="education, technology, community (comma-separated)"
                type="text"
              />

              {/* Description */}
              <Textarea
                isRequired
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
                  {submitting ? "Creating..." : "Create Video"}
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
