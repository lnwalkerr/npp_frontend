"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Input,
  Select,
  SelectItem,
  Button,
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

interface JoinRequest {
  id: number;
  constituency: string;
  type: string;
  experience: string;
  remarks: string;
  status: string;
}

function Page() {
  const [filters, setFilters] = useState({
    type: "All Types",
    search: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<{
    requests: Array<JoinRequest>;
    totalPages: number;
    totalItems: number;
  }>({
    requests: [],
    totalPages: 1,
    totalItems: 0,
  });

  // Backend doesn't have join-requests API, so show empty data

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Backend doesn't have join-requests API, so show empty data
  const dummyData = [];

  const types = ["All Types", "Candidate", "Volunteer"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
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

  // Backend doesn't have join-requests API, so show empty data
  const fetchRequests = async (pageNum: number, currentFilters: any) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Since backend doesn't have join-requests API, show empty data
      setApiData({
        requests: [],
        totalPages: 1,
        totalItems: 0,
      });
    } catch (error) {
      console.error("Error fetching requests:", error);
      setApiData({
        requests: [],
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
    fetchRequests(newPage, filters);
  };

  // Handle filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchRequests(1, filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Initial data load
  useEffect(() => {
    fetchRequests(page, filters);
  }, []);

  const handleView = (request: JoinRequest) => {
    // Only open details if status is Pending
    if (request.status === "Pending") {
      setSelectedRequest(request);
      onOpen();
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedRequest) {
      // In real implementation, call API to update status
      // For demo, we'll just refetch
      fetchRequests(page, filters);
    }
  };

  const handleDelete = (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this request?");

    if (confirmed) {
      console.log("Deleted request with ID:", id);
      // In real implementation, call API and then refetch
      fetchRequests(page, filters);
    }
  };

  const columns = [
    { key: "constituency", label: "Constituency" },
    { key: "type", label: "Type" },
    { key: "experience", label: "Experience" },
    { key: "remarks", label: "Remarks" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = React.useCallback(
    (request: JoinRequest, columnKey: string) => {
      switch (columnKey) {
        case "status":
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
            >
              {request.status}
            </span>
          );
        case "actions":
          return (
            <div className="flex gap-3">
              <Eye
                className={`w-5 h-5 cursor-pointer hover:text-blue-700 ${
                  request.status === "Pending"
                    ? "text-blue-500"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => handleView(request)}
              />
              <Trash2
                className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => handleDelete(request.id)}
              />
            </div>
          );
        default:
          return getKeyValue(request, columnKey);
      }
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Join Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage candidate and volunteer applications
          </p>
        </div>
      </div>

      {/* Request Details Modal - Only shows for Pending status */}
      <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Request Details
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ID</p>
                        <p className="font-medium">{selectedRequest.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Constituency</p>
                        <p className="font-medium">
                          {selectedRequest.constituency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{selectedRequest.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">
                          {selectedRequest.experience}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Remarks</p>
                        <p className="font-medium">{selectedRequest.remarks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}
                        >
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleStatusChange("Accepted");
                    onClose();
                  }}
                >
                  Accept
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    handleStatusChange("Rejected");
                    onClose();
                  }}
                >
                  Reject
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Table */}
      <Card className="py-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Requests</h3>
        </CardHeader>

        <CardBody>
          {/* Search and Filters - preserved original style */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Input
                className="w-full"
                label="Search by constituency or remarks..."
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />

              <Select
                className="w-full"
                label="All Types"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                {types.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* HeroUI Table */}
          <Table
            aria-label="Join requests table"
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
              items={apiData.requests}
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
