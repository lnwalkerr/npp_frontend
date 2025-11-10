"use client";

import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea } from "@heroui/react";
import { Form } from "@heroui/form";

interface LeaderData {
  id: string;
  _id: string;
  name: string;
  position: string;
  description: string;
  order: number;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  isActive: boolean;
}

export default function EditLeaderPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderData, setLeaderData] = useState<LeaderData | null>(null);

  const handleBack = (): void => {
    router.push("/admin/leaders");
  };

  useEffect(() => {
    const fetchLeader = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/leaders/getById?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          setLeaderData(data.data);
        } else {
          console.error("Failed to fetch leader");
          alert("Failed to load leader data");
          router.push("/admin/leaders");
        }
      } catch (error) {
        console.error("Error fetching leader:", error);
        alert("Error loading leader data");
        router.push("/admin/leaders");
      } finally {
        setLoading(false);
      }
    };

    fetchLeader();
  }, [id, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!leaderData) return;
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: (formData.get("name") as string) || "",
        position: (formData.get("position") as string) || "",
        description: (formData.get("description") as string) || "",
        order: parseInt((formData.get("order") as string) || "0"),
        contactInfo: {
          phone: (formData.get("phone") as string) || "",
          email: (formData.get("email") as string) || "",
        },
      };

      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/leaders/update?id=${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Leader updated successfully!");
        router.push("/admin/leaders");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to update leader");
      }
    } catch (error) {
      console.error("Error updating leader:", error);
      alert("Error updating leader");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/leaders");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-gray-600">Loading leader data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!leaderData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Leader not found</p>
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
          <h1 className="text-3xl font-bold text-foreground">Edit Leader</h1>
          <p className="mt-1 text-gray-500">Fill in the leader details</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Leader Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Name */}
              <Input
                isRequired
                defaultValue={leaderData.name}
                errorMessage="Please enter a name"
                label="Name"
                labelPlacement="outside"
                name="name"
                placeholder="Leader name"
                type="text"
              />

              {/* Position */}
              <Input
                isRequired
                defaultValue={leaderData.position}
                errorMessage="Please enter a position"
                label="Position"
                labelPlacement="outside"
                name="position"
                placeholder="e.g., President, Vice President"
                type="text"
              />

              {/* Description */}
              <Textarea
                isRequired
                defaultValue={leaderData.description}
                errorMessage="Please enter a description"
                label="Description"
                labelPlacement="outside"
                minRows={3}
                name="description"
                placeholder="Leader description and bio"
                variant="flat"
              />

              {/* Contact Info */}
              <Input
                defaultValue={leaderData.contactInfo?.phone || ""}
                label="Phone"
                labelPlacement="outside"
                name="phone"
                placeholder="Phone number"
                type="tel"
              />

              <Input
                defaultValue={leaderData.contactInfo?.email || ""}
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Email address"
                type="email"
              />

              {/* Display Order */}
              <Input
                isRequired
                defaultValue={leaderData.order.toString()}
                errorMessage="Please enter display order"
                label="Display Order"
                labelPlacement="outside"
                min="1"
                name="order"
                placeholder="e.g., 1, 2, 3 (lower numbers appear first)"
                type="number"
              />

              {/* Help Text */}
              <p className="text-sm text-gray-500 -mt-4">
                Lower numbers will appear first in the UI
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" disabled={submitting} type="submit">
                  {submitting ? "Saving..." : "Save Leader"}
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
