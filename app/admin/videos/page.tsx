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
    videos: Array<{
      id: string;
      _id: string;
      title: string;
      duration: string;
      views: number;
      created_at: string;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    videos: [],
    totalPages: 1,
    totalItems: 0,
  });

  const handleEdit = (id: number | string) => {
    router.push(`/admin/videos/${id}/edit`);
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this video?");

    if (confirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/videos/delete?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("Video deleted successfully");
          fetchVideos(page, searchTerm);
        } else {
          const errorData = await response.json();

          alert(errorData.message || "Failed to delete video");
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Error deleting video");
      }
    }
  };

  const fetchVideos = async (pageNum: number, search: string = "") => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        ...(search && { searchText: search }),
      });

      const response = await fetch(`/api/admin/videos/getAll?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        console.log("Videos API response:", data); // Debug log
        const videos = (data.data || []).map((video: any) => ({
          ...video,
          id: video._id || video.id, // Ensure id field exists
        }));

        setApiData({
          videos: videos,
          totalPages: Math.ceil((data.totalCounts || 0) / 10),
          totalItems: data.totalCounts || 0,
        });
      } else {
        console.error("Failed to fetch videos:", response.status);
        setApiData({
          videos: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setApiData({
        videos: [],
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
    fetchVideos(newPage, searchTerm);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchVideos(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    fetchVideos(page, searchTerm);
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    { key: "duration", label: "Duration" },
    { key: "views", label: "Views" },
    { key: "created_at", label: "Created" },
    { key: "actions", label: "Actions" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCell = React.useCallback(
    (
      video: {
        id: string;
        title: string;
        duration: string;
        views: number;
        created_at: string;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "created_at":
          return formatDate(video.created_at);
        case "actions":
          return (
            <div className="flex gap-3">
              <Edit
                className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => handleEdit(video.id)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(video.id)}
              />
            </div>
          );
        default:
          return getKeyValue(video, columnKey);
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
            Video Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage Video content</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          type="button"
          onClick={() => router.push("/admin/videos/new")}
        >
          <Plus className="w-4 h-4" />
          New Video
        </button>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Videos</h3>
        </CardHeader>

        <CardBody>
          {/* Search bar */}
          <div className="flex w-full flex-wrap md:flex-nowrap max-w-[60%] gap-4 mb-4">
            <Input
              placeholder="Search by title..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Videos table"
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
              emptyContent={"No videos found"}
              items={apiData.videos}
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
