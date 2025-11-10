"use client";

import { useState, FormEvent, useEffect, useRef, KeyboardEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import {
  Input,
  Button,
  Textarea,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { Form } from "@heroui/form";

interface NewsData {
  id: string;
  _id: string;
  title: string;
  description: string;
  type: string;
  author?: string;
  date?: string;
  tags?: string[];
  isActive: boolean;
}

export default function EditNewsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [newsTypeOptions, setNewsTypeOptions] = useState<
    { key: string; label: string }[]
  >([]);
  const [loadingNewsTypes, setLoadingNewsTypes] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedNewsTypes = useRef(false);

  // Fetch news types on component mount
  useEffect(() => {
    const fetchNewsTypes = async () => {
      // Prevent duplicate API calls
      if (hasFetchedNewsTypes.current) {
        console.log("News types already fetched, skipping duplicate call");

        return;
      }

      console.log("Fetching news types from API...");
      hasFetchedNewsTypes.current = true;

      try {
        setLoadingNewsTypes(true);

        console.log("API Call 1: Fetching master category...");
        // First API call to get the master category ID
        const categoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/masterCategory/getAll?code=typeOfNews`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch master category");
        }

        const categoryData = await categoryResponse.json();

        if (!categoryData.data || categoryData.data.length === 0) {
          throw new Error("No master category found for typeOfNews");
        }

        const masterCategoryId = categoryData.data[0]._id;

        console.log(
          "API Call 2: Fetching news types for category ID:",
          masterCategoryId,
        );
        // Second API call to get the news types using the category ID
        const typesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/master/masterData/getByMasterCategoryId?masterCategoryId=${masterCategoryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!typesResponse.ok) {
          throw new Error("Failed to fetch news types");
        }

        const typesData = await typesResponse.json();

        // Transform the response to match the expected format
        const options = typesData.data.map((item: any) => ({
          key: item.value,
          label: item.title,
        }));

        setNewsTypeOptions(options);
        console.log("Successfully loaded", options.length, "news types");
      } catch (error) {
        console.error("Error fetching news types:", error);
        // Set empty array if API fails - no fallback hardcoded options
        setNewsTypeOptions([]);
      } finally {
        setLoadingNewsTypes(false);
      }
    };

    fetchNewsTypes();
  }, []);

  const handleBack = (): void => {
    router.push("/admin/news");
  };

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/news/getById?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          setNewsData(data.data);
          // Pre-populate tags and author
          setTags(data.data.tags || []);
          // Author is already in newsData
        } else {
          console.error("Failed to fetch news article");
          alert("Failed to load news article data");
          router.push("/admin/news");
        }
      } catch (error) {
        console.error("Error fetching news article:", error);
        alert("Error loading news article data");
        router.push("/admin/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newsData) return;
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        title: (formData.get("title") as string) || "",
        description: (formData.get("description") as string) || "",
        type: (formData.get("type") as string) || "",
        author: (formData.get("author") as string) || "",
        date: (formData.get("date") as string) || "",
        tags: tags,
      };

      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/news/update?id=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("News article updated successfully!");
        router.push("/admin/news");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to update news article");
      }
    } catch (error) {
      console.error("Error updating news article:", error);
      alert("Error updating news article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/news");
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-600">Loading news article data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">News article not found</p>
          <Button className="mt-4" onClick={handleBack}>
            Go Back
          </Button>
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
          <h1 className="text-3xl font-bold text-foreground">
            Edit News Article
          </h1>
          <p className="mt-1 text-gray-500">Update the news article details</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">News Article Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Title */}
              <Input
                isRequired
                errorMessage="Please enter a title"
                label="Title"
                labelPlacement="outside"
                name="title"
                placeholder="News article title"
                type="text"
                value={newsData.title}
                onChange={(e) =>
                  setNewsData((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
              />

              {/* Description */}
              <Textarea
                isRequired
                errorMessage="Please enter a description"
                label="Description"
                labelPlacement="outside"
                minRows={4}
                name="description"
                placeholder="News article description and content"
                value={newsData.description}
                variant="flat"
                onChange={(e) =>
                  setNewsData((prev) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
              />

              {/* News Type */}
              <Select
                isRequired
                errorMessage="Please select a news type"
                isDisabled={loadingNewsTypes}
                label="News Type"
                labelPlacement="outside"
                name="type"
                placeholder={
                  loadingNewsTypes
                    ? "Loading news types..."
                    : "Select news category"
                }
                selectedKeys={newsData.type ? [newsData.type] : []}
                onSelectionChange={(keys) => {
                  const selectedType = Array.from(keys)[0] as string;

                  setNewsData((prev) =>
                    prev ? { ...prev, type: selectedType } : null,
                  );
                }}
              >
                {newsTypeOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>

              {/* Author */}
              <Input
                label="Author"
                labelPlacement="outside"
                name="author"
                placeholder="Enter author name"
                type="text"
                value={newsData.author || ""}
                onChange={(e) =>
                  setNewsData((prev) =>
                    prev ? { ...prev, author: e.target.value } : null,
                  )
                }
              />

              {/* Date */}
              <Input
                label="Publication Date"
                labelPlacement="outside"
                name="date"
                placeholder="Select publication date"
                type="date"
                value={
                  newsData.date
                    ? new Date(newsData.date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setNewsData((prev) =>
                    prev ? { ...prev, date: e.target.value } : null,
                  )
                }
              />

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[3rem] bg-white w-full">
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      className="text-xs"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onClose={() => removeTag(tag)}
                    >
                      {tag}
                    </Chip>
                  ))}
                  <input
                    ref={tagInputRef}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-gray-400"
                    placeholder={
                      tags.length === 0
                        ? "Add tags (press comma or Enter to add)"
                        : ""
                    }
                    type="text"
                    value={tagInput}
                    onBlur={handleTagInputBlur}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Type a tag and press comma (,) or Enter to add it
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" disabled={submitting} type="submit">
                  {submitting ? "Saving..." : "Save Article"}
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
