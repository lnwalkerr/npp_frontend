"use client";

import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea, Select, SelectItem } from "@heroui/react";
import { Form } from "@heroui/form";

interface EventData {
  id: string;
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  status: string;
  isActive: boolean;
}

export default function EditEventPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);

  const handleBack = (): void => {
    router.push("/admin/events");
  };

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/events/getById?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          setEventData(data.data);
        } else {
          console.error("Failed to fetch event");
          alert("Failed to load event data");
          router.push("/admin/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        alert("Error loading event data");
        router.push("/admin/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!eventData) return;

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
      const response = await fetch(`/api/admin/events/update?id=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Event updated successfully!");
        router.push("/admin/events");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event");
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Event not found</p>
            <Button onClick={() => router.push("/admin/events")}>
              Back to Events
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
          <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
          <p className="mt-1 text-gray-500">Update the event details</p>
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
                defaultValue={eventData.title}
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
                defaultValue={new Date(eventData.date)
                  .toISOString()
                  .slice(0, 16)}
                errorMessage="Please select a date"
                label="Date"
                labelPlacement="outside"
                name="date"
                type="datetime-local"
              />

              {/* Location */}
              <Input
                defaultValue={eventData.location || ""}
                label="Location"
                labelPlacement="outside"
                name="location"
                placeholder="Event location (optional)"
                type="text"
              />

              {/* Status */}
              <Select
                isRequired
                defaultSelectedKeys={[eventData.status]}
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
                defaultValue={eventData.description}
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
                  {submitting ? "Saving..." : "Save Event"}
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
