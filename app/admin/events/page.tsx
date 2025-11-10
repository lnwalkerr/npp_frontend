"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  getKeyValue,
} from "@heroui/react";
import { Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<{
    events: Array<{
      id: string;
      _id: string;
      title: string;
      date: string;
      description: string;
      status: string;
      location?: string;
      created_at: string;
      isActive: boolean;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    events: [],
    totalPages: 1,
    totalItems: 0,
  });

  const handleEdit = (id: number | string) => {
    router.push(`/admin/events/${id}/edit`);
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this event?");

    if (confirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/events/delete?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("Event deleted successfully");
          fetchEvents(page, searchTerm);
        } else {
          const errorData = await response.json();

          alert(errorData.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-sky-100 text-sky-800";
      case "Past":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchEvents = async (pageNum: number, search: string = "") => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        ...(search && { searchText: search }),
      });

      const response = await fetch(`/api/admin/events/getAll?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        console.log("Events API response:", data); // Debug log
        const events = (data.data || []).map((event: any) => ({
          ...event,
          id: event._id || event.id, // Ensure id field exists
        }));

        setApiData({
          events: events,
          totalPages: Math.ceil((data.totalCounts || 0) / 10),
          totalItems: data.totalCounts || 0,
        });
      } else {
        console.error("Failed to fetch events:", response.status);
        setApiData({
          events: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setApiData({
        events: [],
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
    fetchEvents(newPage, searchTerm);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchEvents(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    fetchEvents(page, searchTerm);
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (
      event: {
        _id: string;
        title: string;
        date: string;
        description: string;
        status: string;
        location?: string;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "date":
          return formatDate(event.date);
        case "status":
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
            >
              {event.status}
            </span>
          );
        case "actions":
          return (
            <div className="flex gap-3">
              <Edit
                className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => handleEdit(event._id)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(event._id)}
              />
            </div>
          );
        default:
          return getKeyValue(event, columnKey);
      }
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Events Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage upcoming and past events
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          type="button"
          onClick={() => router.push("/admin/events/new")}
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Events</h3>
        </CardHeader>

        <CardBody>
          {/* Search bar - preserved original style */}
          <div className="flex w-full flex-wrap md:flex-nowrap max-w-[60%] gap-4 mb-4">
            <Input
              placeholder="Search events..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Events table"
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
            classNames={{
              base: "max-h-[600px] overflow-auto",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={"No events found"}
              items={apiData.events}
              loadingContent={<Spinner />}
              loadingState={isLoading ? "loading" : "idle"}
            >
              {(item) => (
                <TableRow key={item.id || item._id}>
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
