"use client";

import { useState, FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea, Select, SelectItem } from "@heroui/react";
import { Form } from "@heroui/form";

export default function CreateEventPage(): JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleBack = (): void => {
    router.push("/admin/events");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      const data = {
        title: (formData.get("title") as string) || "",
        description: (formData.get("description") as string) || "",
        date: (formData.get("date") as string) || "",
        location: (formData.get("location") as string) || "",
        status: (formData.get("status") as string) || "",
      };

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/events/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Event created successfully!");
        router.push("/admin/events");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/events");
  };

  const statusOptions = [
    { key: "Upcoming", label: "Upcoming" },
    { key: "Past", label: "Past" },
    { key: "Cancelled", label: "Cancelled" },
  ];

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
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="mt-1 text-gray-500">Fill in the event details</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Event Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Event Title */}
              <Input
                isRequired
                errorMessage="Please enter a title"
                label="Event Title"
                labelPlacement="outside"
                name="title"
                placeholder="Event title"
                type="text"
              />

              {/* Date */}
              <Input
                isRequired
                errorMessage="Please select a date"
                label="Date"
                labelPlacement="outside"
                name="date"
                type="datetime-local"
              />

              {/* Location */}
              <Input
                label="Location"
                labelPlacement="outside"
                name="location"
                placeholder="Event location (optional)"
                type="text"
              />

              {/* Status */}
              <Select
                isRequired
                defaultSelectedKeys={["Upcoming"]}
                errorMessage="Please select a status"
                label="Status"
                labelPlacement="outside"
                name="status"
                placeholder="Select event status"
              >
                {statusOptions.map((option) => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Description */}
              <Textarea
                isRequired
                errorMessage="Please enter a valid description"
                label="Description"
                labelPlacement="outside"
                minRows={4}
                name="description"
                placeholder="Event description"
                variant="flat"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" disabled={submitting} type="submit">
                  {submitting ? "Creating..." : "Create Event"}
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
