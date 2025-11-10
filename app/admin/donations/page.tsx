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
import { DateValue } from "@internationalized/date";

function Page() {
  const [filters, setFilters] = useState({
    search: "",
    type: "All Types",
    minAmount: "",
    maxAmount: "",
    startDate: null as DateValue | null,
    endDate: null as DateValue | null,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<{
    donations: Array<{
      id: string;
      title: string;
      type: string;
      goal: number;
      description: string;
      status: string;
      createdAt: string;
      createdBy: string;
    }>;
    totalPages: number;
    totalItems: number;
  }>({
    donations: [],
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch data from API instead of dummy data

  const donationTypes = ["All Types", "One-time", "Monthly", "Annual"];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Fetch donations from API
  const fetchDonations = async (pageNum: number, currentFilters: any) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "5",
      });

      if (currentFilters.search) {
        params.append("search", currentFilters.search);
      }

      const response = await fetch(`/api/admin/donations?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setApiData({
          donations: data.donations,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
        });
      } else {
        console.error("Error fetching donations:", data.message);
        setApiData({
          donations: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setApiData({
        donations: [],
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
    fetchDonations(newPage, filters);
  };

  // Handle filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchDonations(1, filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Initial data load
  useEffect(() => {
    fetchDonations(page, filters);
  }, []);

  const totalGoals = apiData.donations.reduce(
    (sum, donation) => sum + donation.goal,
    0,
  );

  const columns = [
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "goal", label: "Goal Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created Date" },
    { key: "createdBy", label: "Created By" },
  ];

  const renderCell = React.useCallback(
    (
      donation: {
        id: string;
        title: string;
        type: string;
        goal: number;
        description: string;
        status: string;
        createdAt: string;
        createdBy: string;
      },
      columnKey: string,
    ) => {
      switch (columnKey) {
        case "goal":
          return (
            <span className="font-semibold text-green-600">
              ₹{donation.goal.toLocaleString()}
            </span>
          );
        case "status":
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                donation.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {donation.status}
            </span>
          );
        default:
          return getKeyValue(donation, columnKey);
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
            Donation Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage donations
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-green-600">
            Total Goals: ₹{totalGoals.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Donation Campaigns</h3>
        </CardHeader>

        <CardBody>
          {/* Search */}
          <div className="flex w-full max-w-md gap-4 mb-6">
            <Input
              className="w-full"
              placeholder="Search campaigns..."
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Donations table"
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
              items={apiData.donations}
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
