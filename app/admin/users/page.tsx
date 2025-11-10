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
  Select,
  SelectItem,
} from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<{
    users: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      gender: string;
      dob: string;
      address: string;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    users: [],
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch data from API instead of dummy data

  const handleDelete = (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this user?");

    if (confirmed) {
      console.log("Deleted user with ID:", id);
      // In real implementation, call API and then refetch
      fetchUsers(page, searchTerm, userTypeFilter);
    }
  };

  // Fetch users from API
  const fetchUsers = async (
    pageNum: number,
    search: string = "",
    gender: string = "all",
  ) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "5",
      });

      if (search) {
        params.append("search", search);
      }

      if (userTypeFilter !== "all") {
        params.append("userType", userTypeFilter);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setApiData({
          users: data.users,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } else {
        console.error("Error fetching users:", data.message);
        setApiData({
          users: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setApiData({
        users: [],
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
    fetchUsers(newPage, searchTerm, userTypeFilter);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchUsers(1, searchTerm, userTypeFilter);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, userTypeFilter]);

  // Initial data load
  useEffect(() => {
    fetchUsers(page, searchTerm, userTypeFilter);
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "dob", label: "DOB" },
    { key: "address", label: "Address" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (
      user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        gender: string;
        dob: string;
        address: string;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex gap-3">
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(user.id)}
              />
            </div>
          );
        default:
          return getKeyValue(user, columnKey);
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
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage registered users
          </p>
        </div>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Users</h3>
        </CardHeader>

        <CardBody>
          {/* Search and Filter bars - 50% width each in same row */}
          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4 w-full">
            <div className="w-full md:w-1/2">
              <Input
                className="w-full"
                placeholder="Search by name or email..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/2">
              <Select
                className="w-full"
                placeholder="Filter by user type"
                selectedKeys={[userTypeFilter]}
                onChange={(e) => setUserTypeFilter(e.target.value)}
              >
                <SelectItem key="all">All User Types</SelectItem>
                <SelectItem key="superAdmin">Super Admin</SelectItem>
                <SelectItem key="admin">Admin</SelectItem>
                <SelectItem key="member">Member</SelectItem>
              </Select>
            </div>
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Users table"
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
              items={apiData.users}
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
