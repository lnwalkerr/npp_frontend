"use client";

import { useState, FormEvent, useRef, KeyboardEvent, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Form } from "@heroui/form";

export default function CreateNewsPage(): JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [newsTypeOptions, setNewsTypeOptions] = useState<{ key: string; label: string }[]>([]);
  const [loadingNewsTypes, setLoadingNewsTypes] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Fetch news types on component mount
  useEffect(() => {
    const fetchNewsTypes = async () => {
      try {
        setLoadingNewsTypes(true);

        // First API call to get the master category ID
        const categoryResponse = await fetch('http://localhost:5001/api/master/masterCategory/getAll?code=typeOfNews', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch master category');
        }

        const categoryData = await categoryResponse.json();

        if (!categoryData.data || categoryData.data.length === 0) {
          throw new Error('No master category found for typeOfNews');
        }

        const masterCategoryId = categoryData.data[0]._id;

        // Second API call to get the news types using the category ID
        const typesResponse = await fetch(`http://localhost:5001/api/master/masterData/getByMasterCategoryId?masterCategoryId=${masterCategoryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!typesResponse.ok) {
          throw new Error('Failed to fetch news types');
        }

        const typesData = await typesResponse.json();

        // Transform the response to match the expected format
        const options = typesData.data.map((item: any) => ({
          key: item.value,
          label: item.title,
        }));

        setNewsTypeOptions(options);
      } catch (error) {
        console.error('Error fetching news types:', error);
        // Fallback to static options if API fails
        setNewsTypeOptions([
          { key: "politics", label: "Politics" },
          { key: "economy", label: "Economy" },
          { key: "sports", label: "Sports" },
          { key: "technology", label: "Technology" },
          { key: "health", label: "Health" },
          { key: "education", label: "Education" },
          { key: "entertainment", label: "Entertainment" },
          { key: "general", label: "General" },
        ]);
      } finally {
        setLoadingNewsTypes(false);
      }
    };

    fetchNewsTypes();
  }, []);

  const handleBack = (): void => {
    router.push("/admin/news");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
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
      const response = await fetch("/api/admin/news/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("News article created successfully!");
        router.push("/admin/news");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to create news article");
      }
    } catch (error) {
      console.error("Error creating news article:", error);
      alert("Error creating news article");
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
    setTags(tags.filter(tag => tag !== tagToRemove));
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
            Create News Article
          </h1>
          <p className="mt-1 text-gray-500">Fill in the news article details</p>
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
                variant="flat"
              />

              {/* News Type */}
              <Select
                isRequired
                isDisabled={loadingNewsTypes}
                errorMessage="Please select a news type"
                label="News Type"
                labelPlacement="outside"
                name="type"
                placeholder={loadingNewsTypes ? "Loading news types..." : "Select news category"}
              >
                {newsTypeOptions.map((option) => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Author */}
              <Input
                label="Author"
                labelPlacement="outside"
                name="author"
                placeholder="Enter author name"
                type="text"
              />

              {/* Date */}
              <Input
                label="Publication Date"
                labelPlacement="outside"
                name="date"
                placeholder="Select publication date"
                type="date"
              />

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[3rem] bg-white w-full">
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      onClose={() => removeTag(tag)}
                      variant="flat"
                      color="primary"
                      size="sm"
                      className="text-xs"
                    >
                      {tag}
                    </Chip>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={handleTagInputBlur}
                    placeholder={tags.length === 0 ? "Add tags (press comma or Enter to add)" : ""}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Type a tag and press comma (,) or Enter to add it
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" disabled={submitting} type="submit">
                  {submitting ? "Creating..." : "Create Article"}
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
