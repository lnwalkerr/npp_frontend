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
    leaders: Array<{
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
      created_at: string;
      isActive: boolean;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    leaders: [],
    totalPages: 1,
    totalItems: 0,
  });

  const handleEdit = (id: number | string) => {
    router.push(`/admin/leaders/${id}/edit`);
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this leader?");

    if (confirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`/api/admin/leaders/delete?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("Leader deleted successfully");
          fetchLeaders(page, searchTerm);
        } else {
          const errorData = await response.json();

          alert(errorData.message || "Failed to delete leader");
        }
      } catch (error) {
        console.error("Error deleting leader:", error);
        alert("Error deleting leader");
      }
    }
  };

  const fetchLeaders = async (pageNum: number, search: string = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        ...(search && { searchText: search }),
      });

      const response = await fetch(`/api/admin/leaders/getAll?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        console.log("Leaders API response:", data);
        const leaders = (data.data || []).map((leader: any) => ({
          ...leader,
          id: leader._id || leader.id,
        }));

        setApiData({
          leaders: leaders,
          totalPages: Math.ceil((data.totalCounts || 0) / 10),
          totalItems: data.totalCounts || 0,
        });
      } else {
        console.error("Failed to fetch leaders:", response.status);
        setApiData({ leaders: [], totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
      setApiData({ leaders: [], totalPages: 1, totalItems: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders(1, "");
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeaders(page, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    { key: "description", label: "Description" },
    { key: "order", label: "Order" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (
      leader: {
        id: string;
        name: string;
        position: string;
        description: string;
        order: number;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex gap-3">
              <Edit
                className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => handleEdit(leader.id)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(leader.id)}
              />
            </div>
          );
        default:
          return getKeyValue(leader, columnKey);
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
            Leaders Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage organization leaders
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          type="button"
          onClick={() => router.push("/admin/leaders/new")}
        >
          <Plus className="w-4 h-4" />
          New Leader
        </button>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Leaders</h3>
        </CardHeader>

        <CardBody>
          {/* Search bar */}
          <div className="flex w-full flex-wrap md:flex-nowrap max-w-[60%] gap-4 mb-4">
            <Input
              placeholder="Search leaders..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Leaders table"
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
                    onChange={setPage}
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
              emptyContent={"No leaders found"}
              items={apiData.leaders}
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
