"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Input,
  Button,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { Form } from "@heroui/form";

interface QueryFormData {
  userName: string;
  userEmail: string;
  userPhone: string;
  constituency: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
}

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState<QueryFormData>({
    userName: "",
    userEmail: "",
    userPhone: "",
    constituency: "",
    subject: "",
    message: "",
    category: "Other",
    priority: "Medium",
  });

  const categories = [
    "Infrastructure",
    "Education",
    "Healthcare",
    "Agriculture",
    "Employment",
    "Other"
  ];

  const priorities = ["High", "Medium", "Low"];

  const handleInputChange = (field: keyof QueryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/public/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status_code === 201) {
        setSubmitMessage({ type: 'success', text: 'Your query has been submitted successfully! We will get back to you soon.' });
        // Reset form
        setFormData({
          userName: "",
          userEmail: "",
          userPhone: "",
          constituency: "",
          subject: "",
          message: "",
          category: "Other",
          priority: "Medium",
        });
      } else {
        setSubmitMessage({ type: 'error', text: data.message || 'Failed to submit query. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      setSubmitMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.userName.trim() &&
      formData.userEmail.trim() &&
      formData.constituency.trim() &&
      formData.subject.trim() &&
      formData.message.trim()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit Your Query
          </h1>
          <p className="text-lg text-gray-600">
            Have a question or concern? We'd love to help you.
          </p>
        </div>

        {/* Success/Error Message */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {submitMessage.text}
            </p>
          </div>
        )}

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader className="pb-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Query Details
            </h2>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  isRequired
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.userName}
                  onChange={(e) => handleInputChange("userName", e.target.value)}
                  className="w-full"
                />

                <Input
                  isRequired
                  type="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.userEmail}
                  onChange={(e) => handleInputChange("userEmail", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+91-XXXXXXXXXX"
                  value={formData.userPhone}
                  onChange={(e) => handleInputChange("userPhone", e.target.value)}
                  className="w-full"
                />

                <Input
                  isRequired
                  label="Constituency"
                  placeholder="Enter your constituency"
                  value={formData.constituency}
                  onChange={(e) => handleInputChange("constituency", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Query Details */}
              <Input
                isRequired
                label="Subject"
                placeholder="Brief subject of your query"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Category"
                  placeholder="Select category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full"
                >
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Priority"
                  placeholder="Select priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full"
                >
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea
                isRequired
                label="Message"
                placeholder="Please describe your query in detail..."
                minRows={5}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="w-full"
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  disabled={isSubmitting || !isFormValid()}
                  className="px-8"
                >
                  {isSubmitting ? "Submitting..." : "Submit Query"}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Your query will be reviewed by our team</li>
            <li>• You'll receive a confirmation email</li>
            <li>• We'll respond to your query as soon as possible</li>
            <li>• You can track your query status if provided with login credentials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Page;
