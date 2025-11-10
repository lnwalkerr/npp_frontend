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
  const [articles, setArticles] = useState<
    Array<{
      id: string;
      title: string;
      section: string;
      date: string;
      author: string;
      views: number;
    }>
  >([]);
  const [totalPages, setTotalPages] = useState(1);

  const handleEdit = (id: number | string) => {
    router.push(`/admin/news/${id}/edit`);
  };

  const fetchNews = async (pageNum: number, search: string = "") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "5",
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setArticles(data.news);
        setTotalPages(data.totalPages);
      } else {
        console.error("Error fetching news:", data.message);
        setArticles([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this article?");

    if (confirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/news/delete?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("News article deleted successfully");
          fetchNews(page, searchTerm);
        } else {
          const errorData = await response.json();

          alert(errorData.message || "Failed to delete news article");
        }
      } catch (error) {
        console.error("Error deleting news article:", error);
        alert("Error deleting news article");
      }
    }
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  // Note: Author search input is kept for future implementation but not currently used

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchNews(newPage, searchTerm);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchNews(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    fetchNews(page, searchTerm);
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    { key: "section", label: "Section" },
    { key: "date", label: "Date" },
    { key: "author", label: "Author" },
    { key: "views", label: "Views" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (
      article: {
        id: string;
        title: string;
        section: string;
        date: string;
        author: string;
        views: number;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex gap-3">
              <Edit
                className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => handleEdit(article.id)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(article.id)}
              />
            </div>
          );
        default:
          return getKeyValue(article, columnKey);
      }
    },
    [],
  );

  // Pagination logic for articles
  const rowsPerPage = 5;
  const pages = totalPages;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            News Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage news articles and updates
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          type="button"
          onClick={() => router.push("/admin/news/new")}
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Articles</h3>
        </CardHeader>

        <CardBody>
          {/* Search bar */}
          <div className="flex w-full flex-wrap md:flex-nowrap max-w-[60%] gap-4 mb-4">
            <Input
              aria-label="Search articles by title or description"
              className="w-full"
              placeholder="Search articles by title or description..."
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Articles table"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-end pr-4 mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages}
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
              items={articles}
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
