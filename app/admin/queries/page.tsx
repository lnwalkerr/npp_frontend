"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  getKeyValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Eye, Trash2 } from "lucide-react";

interface Query {
  id: number;
  constituency: string;
  category: string;
  priority: string;
  subject: string;
  status: string;
  message: string;
  reply: string;
}

function Page() {
  const [filters, setFilters] = useState({
    category: "All Categories",
    priority: "All Priorities",
    status: "All Statuses",
    search: "",
  });
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<{
    queries: Array<Query>;
    totalPages: number;
    totalItems: number;
  }>({
    queries: [],
    totalPages: 1,
    totalItems: 0,
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const categories = [
    "All Categories",
    "Infrastructure",
    "Education",
    "Healthcare",
    "Agriculture",
    "Employment",
    "Other"
  ];
  const priorities = ["All Priorities", "High", "Medium", "Low"];
  const statuses = ["All Statuses", "Open", "In Progress", "Resolved", "Closed"];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchQueries = async (pageNum: number, currentFilters: any) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        category: currentFilters.category,
        priority: currentFilters.priority,
        status: currentFilters.status,
        search: currentFilters.search,
      });

      const response = await fetch(`/api/admin/queries?${queryParams}`);
      const data = await response.json();

      if (data.status_code === 200) {
        setApiData({
          queries: data.queries,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } else {
        console.error("Error fetching queries:", data.message);
        setApiData({
          queries: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
      setApiData({
        queries: [],
        totalPages: 1,
        totalItems: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchQueries(newPage, filters);
  };

  // Handle filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchQueries(1, filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Initial data load
  useEffect(() => {
    fetchQueries(page, filters);
  }, []);

  const handleView = async (query: Query) => {
    try {
      const response = await fetch(`/api/admin/queries/${query.id}`);
      const data = await response.json();

      if (data.status_code === 200) {
        setSelectedQuery(data.query);
        setReplyText(data.query.reply || "");
        onOpen();
      } else {
        console.error("Error fetching query details:", data.message);
        alert("Failed to load query details");
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
      alert("Failed to load query details");
    }
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this query?");

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/queries/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.status_code === 200) {
          alert("Query deleted successfully");
          fetchQueries(page, filters);
        } else {
          console.error("Error deleting query:", data.message);
          alert("Failed to delete query");
        }
      } catch (error) {
        console.error("Error deleting query:", error);
        alert("Failed to delete query");
      }
    }
  };

  const handleSendReply = async () => {
    if (selectedQuery && replyText.trim()) {
      try {
        const response = await fetch(`/api/admin/queries/${selectedQuery.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reply: replyText.trim(),
            status: "Resolved"
          }),
        });
        const data = await response.json();

        if (data.status_code === 200) {
          alert("Reply sent successfully");
          setReplyText("");
          fetchQueries(page, filters);
        } else {
          console.error("Error sending reply:", data.message);
          alert("Failed to send reply");
        }
      } catch (error) {
        console.error("Error sending reply:", error);
        alert("Failed to send reply");
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (selectedQuery) {
      try {
        const response = await fetch(`/api/admin/queries/${selectedQuery.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus
          }),
        });
        const data = await response.json();

        if (data.status_code === 200) {
          alert(`Query status updated to ${newStatus}`);
          fetchQueries(page, filters);
        } else {
          console.error("Error updating status:", data.message);
          alert("Failed to update query status");
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update query status");
      }
    }
  };

  const columns = [
    { key: "constituency", label: "Constituency" },
    { key: "category", label: "Category" },
    { key: "priority", label: "Priority" },
    { key: "subject", label: "Subject" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback((query: Query, columnKey: string) => {
    switch (columnKey) {
      case "priority":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}
          >
            {query.priority}
          </span>
        );
      case "status":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}
          >
            {query.status}
          </span>
        );
      case "actions":
        return (
          <div className="flex gap-3">
            <Eye
              className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
              onClick={() => handleView(query)}
            />
            <Trash2
              className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
              onClick={() => handleDelete(query.id)}
            />
          </div>
        );
      default:
        return getKeyValue(query, columnKey);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Query Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage user queries
          </p>
        </div>
      </div>

      {/* Query Details Modal */}
      <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Query Details
              </ModalHeader>
              <ModalBody>
                {selectedQuery && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ID</p>
                        <p className="font-medium">{selectedQuery.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Subject</p>
                        <p className="font-medium">{selectedQuery.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Constituency</p>
                        <p className="font-medium">
                          {selectedQuery.constituency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{selectedQuery.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedQuery.priority)}`}
                        >
                          {selectedQuery.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.status)}`}
                        >
                          {selectedQuery.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Message</p>
                      <p className="font-medium mt-1">
                        {selectedQuery.message}
                      </p>
                    </div>

                    {selectedQuery.status === "Resolved" &&
                      selectedQuery.reply && (
                        <div>
                          <p className="text-sm text-gray-500">Reply</p>
                          <p className="font-medium mt-1 text-green-600">
                            {selectedQuery.reply}
                          </p>
                        </div>
                      )}

                    {(selectedQuery.status === "Open" || selectedQuery.status === "In Progress") && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          Type your reply here...
                        </p>
                        <Textarea
                          className="w-full"
                          minRows={3}
                          placeholder="Enter your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                {/* Status Toggle Buttons */}
                <Button
                  color={
                    selectedQuery?.status === "Open" ? "primary" : "default"
                  }
                  variant={selectedQuery?.status === "Open" ? "solid" : "flat"}
                  onPress={() => {
                    handleStatusChange("Open");
                    onClose();
                  }}
                >
                  Set as Open
                </Button>
                <Button
                  color={
                    selectedQuery?.status === "In Progress" ? "primary" : "default"
                  }
                  variant={
                    selectedQuery?.status === "In Progress" ? "solid" : "flat"
                  }
                  onPress={() => {
                    handleStatusChange("In Progress");
                    onClose();
                  }}
                >
                  Set as In Progress
                </Button>
                <Button
                  color={
                    selectedQuery?.status === "Resolved" ? "primary" : "default"
                  }
                  variant={
                    selectedQuery?.status === "Resolved" ? "solid" : "flat"
                  }
                  onPress={() => {
                    handleStatusChange("Resolved");
                    onClose();
                  }}
                >
                  Set as Resolved
                </Button>

                {(selectedQuery?.status === "Open" || selectedQuery?.status === "In Progress") && (
                  <Button
                    color="primary"
                    disabled={!replyText.trim()}
                    onPress={() => {
                      handleSendReply();
                      onClose();
                    }}
                  >
                    Send Reply
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Queries</h3>
        </CardHeader>

        <CardBody>
          {/* Search and Filters - preserved original style */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <Input
                className="w-full"
                label="Search by subject..."
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />

              <Select
                className="w-full"
                label="All Categories"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                {categories.map((category) => (
                  <SelectItem key={category}>{category}</SelectItem>
                ))}
              </Select>

              <Select
                className="w-full"
                label="All Priorities"
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                {priorities.map((priority) => (
                  <SelectItem key={priority}>{priority}</SelectItem>
                ))}
              </Select>

              <Select
                className="w-full"
                label="All Statuses"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                {statuses.map((status) => (
                  <SelectItem key={status}>{status}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Queries table"
            bottomContent={
              apiData.totalPages > 0 ? (
                <div className="flex w-full justify-end pr-4 mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={apiData.totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={apiData.queries}
              loadingContent={<Spinner />}
              loadingState={isLoading ? "loading" : "idle"}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Page;
