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
  _id: string;
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

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      });

      // Add filters
      if (currentFilters.search) {
        queryParams.append("search", currentFilters.search);
      }
      if (currentFilters.type && currentFilters.type !== "All Types") {
        queryParams.append("type", currentFilters.type);
      }
      if (currentFilters.status && currentFilters.status !== "All Statuses") {
        queryParams.append("status", currentFilters.status);
      }

      const response = await fetch(`/api/admin/join-requests?${queryParams}`);
      const data = await response.json();

      if (data.status_code === 200) {
        setApiData({
          requests: data.data || [],
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
        });
      } else {
        console.error("Error fetching join requests:", data.message);
        setApiData({
          requests: [],
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
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
    // Open details for all requests (not just pending)
    setSelectedRequest(request);
    onOpen();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRequest) return;

    try {
      const endpoint = newStatus.toLowerCase() === 'approved' ? 'approve' : 'reject';
      const response = await fetch(`/api/admin/join-requests/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedRequest._id }),
      });

      const data = await response.json();

      if (data.status_code === 200) {
        // Refresh the requests list
        fetchRequests(page, filters);
      } else {
        alert(`Failed to ${newStatus.toLowerCase()} request: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert(`Failed to ${newStatus.toLowerCase()} request`);
    }
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = confirm("Are you sure you want to delete this request?");

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/join-requests/delete?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.status_code === 200) {
          // Refresh the requests list
          fetchRequests(page, filters);
        } else {
          alert(`Failed to delete request: ${data.message}`);
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request');
      }
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
                onClick={() => handleDelete(request._id)}
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
                        <p className="font-medium">{selectedRequest._id}</p>
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
                    handleStatusChange("approved");
                    onClose();
                  }}
                >
                  Accept
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    handleStatusChange("rejected");
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
              items={apiData.requests || []}
              loadingContent={<Spinner />}
              loadingState={isLoading ? "loading" : "idle"}
            >
              {(item: JoinRequest) => (
                <TableRow key={item._id}>
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
