"use client";

import { useState, FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button } from "@heroui/react";
import { Form } from "@heroui/form";

export default function EditNewsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<string | null>(null);

  const handleBack = (): void => {
    router.push("/admin/videos");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = {
      title: (formData.get("title") as string) || "",
      url: (formData.get("url") as string) || "",
    };

    console.log("✅ Form submitted:", data);
    setAction(`submit ${JSON.stringify(data)}`);
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
          <h1 className="text-3xl font-bold text-foreground">Edit Video</h1>
          <p className="mt-1 text-gray-500">Add YouTube videos</p>
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
                label="Title"
                labelPlacement="outside"
                name="title"
                placeholder="Video title"
                type="text"
              />

              {/* YouTube URL */}
              <Input
                isRequired
                errorMessage="Please enter a YouTube URL"
                label="YouTube URL"
                labelPlacement="outside"
                name="url"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                type="text"
              />

              {/* Help Text */}
              <p className="text-sm text-gray-500 -mt-4">
                Paste the full YouTube video URL
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" type="submit">
                  Save Video
                </Button>
                <Button type="button" variant="flat" onClick={handleCancel}>
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
