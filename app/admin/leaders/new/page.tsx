"use client";

import { useState, FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea } from "@heroui/react";
import { Form } from "@heroui/form";

export default function CreateLeaderPage(): JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleBack = (): void => {
    router.push("/admin/leaders");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
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
      const response = await fetch("/api/admin/leaders/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Leader created successfully!");
        router.push("/admin/leaders");
      } else {
        const errorData = await response.json();

        alert(errorData.message || "Failed to create leader");
      }
    } catch (error) {
      console.error("Error creating leader:", error);
      alert("Error creating leader");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/leaders");
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
            {" "}
            Add New Leader
          </h1>
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
                label="Phone"
                labelPlacement="outside"
                name="phone"
                placeholder="Phone number"
                type="tel"
              />

              <Input
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Email address"
                type="email"
              />

              {/* Display Order */}
              <Input
                isRequired
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
                  {submitting ? "Creating..." : "Create Leader"}
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
