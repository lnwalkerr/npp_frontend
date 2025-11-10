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
    repositories: Array<{
      id: number;
      title: string;
      photos: string;
      created: string;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    repositories: [],
    totalPages: 1,
    totalItems: 0,
  });

  const handleEdit = (id: number | string) => {
    router.push(`/admin/images/${id}/edit`);
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this repository?",
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/images/delete/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          alert("Repository deleted successfully!");
          fetchRepositories(page, searchTerm);
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Error deleting repository:", error);
        alert("Failed to delete repository. Please try again.");
      }
    }
  };

  const fetchRepositories = async (pageNum: number, search: string = "") => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/images?${params}`);
      const result = await response.json();

      if (result.success) {
        setApiData({
          repositories: result.data.map((repo: any) => ({
            id: repo._id,
            title: repo.title,
            photos: `${repo.imageCount} photos`,
            created: new Date(repo.created_at).toLocaleDateString(),
          })),
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems,
        });
      } else {
        console.error("API Error:", result.message);
        setApiData({
          repositories: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setApiData({
        repositories: [],
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
    fetchRepositories(newPage, searchTerm);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchRepositories(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    fetchRepositories(page, searchTerm);
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    { key: "photos", label: "Photos" },
    { key: "created", label: "Created" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (
      repository: {
        id: number;
        title: string;
        photos: string;
        created: string;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex gap-3">
              <Edit
                className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => handleEdit(repository.id)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(repository.id)}
              />
            </div>
          );
        default:
          return getKeyValue(repository, columnKey);
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
            Image Repositories
          </h1>
          <p className="text-muted-foreground mt-1">Manage photo collections</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          type="button"
          onClick={() => router.push("/admin/images/new")}
        >
          <Plus className="w-4 h-4" />
          New Repository
        </button>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Repositories</h3>
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
            aria-label="Repositories table"
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
              items={apiData.repositories}
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
