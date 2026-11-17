"use client";

import { exportReservationReportCSV } from "@/features/dashboard/reservation-report-csv";
import { useDashboard } from "./useDashboard";
import { Button, Card, Input, Pagination, Table } from "@heroui/react";
import { formatDate } from "@/lib/date";

export function DashboardClient() {
  const {
    month,
    setMonth,

    filtered,
    summary,

    searchPhone,
    setSearchPhone,

    paginatedReservations,

    currentPage,
    setCurrentPage,

    totalPages,

    sortDescriptor,
    setSortDescriptor,
  } = useDashboard();

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Monthly Report</h1>
          <p className="text-sm">Filter bookings by month</p>
        </div>

        {/* MONTH PICKER */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="min-w-0 flex-1 sm:flex-none"
          ></Input>

          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => exportReservationReportCSV(filtered)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <DashboardKpi
          label="Total Bookings"
          value={summary.total}
          className={"text-blue-600"}
        />
        <DashboardKpi
          label="Active Rooms"
          value={summary.rooms}
          className={"text-blue-600"}
        />
        <DashboardKpi
          label="Confirmed"
          value={summary.confirmed}
          className={"text-green-600"}
        />
        <DashboardKpi
          label="Cancelled"
          value={summary.cancelled}
          className={"text-red-600"}
        />
      </div>

      <Input
        type="text"
        variant="primary"
        placeholder="Search by phone number"
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
        aria-label="Name"
        className="w-full sm:w-64"
      />

      {/*
        No ScrollContainer and no fixed pixel widths:
        table-fixed + percentage widths make the table always
        fill exactly the available width (no horizontal scroll).
        Text columns truncate, Time Slot never wraps.
      */}
      <Table>
        <Table.Content
          aria-label="Team members"
          className="w-full table-fixed text-xs lg:text-sm"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            <Table.Column className="w-[17%] px-2 lg:px-3" isRowHeader>
              Name
            </Table.Column>
            <Table.Column className="hidden w-[10%] px-2 md:table-cell lg:px-3">
              User Type
            </Table.Column>
            <Table.Column className="w-[14%] px-2 lg:px-3">Phone</Table.Column>
            <Table.Column className="w-[15%] px-2 lg:px-3">Room</Table.Column>
            <Table.Column
              className="w-[12%] px-2 lg:px-3"
              allowsSorting
              id="booking_date"
            >
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Date
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column className="w-[10%] px-2 lg:px-3">Status</Table.Column>
            <Table.Column className="hidden w-[8%] px-2 md:table-cell lg:px-3">
              Pax
            </Table.Column>
            <Table.Column className="w-[22%] px-2 lg:px-3">
              Time Slot
            </Table.Column>
          </Table.Header>

          <Table.Body>
            {paginatedReservations.map((reservation) => (
              <Table.Row key={reservation.id}>
                <Table.Cell className="px-2 py-2 lg:px-3">
                  <span className="block truncate">
                    {reservation.booker_name?.toUpperCase() ?? "Anonymous"}
                  </span>
                </Table.Cell>

                <Table.Cell className="hidden px-2 py-2 md:table-cell lg:px-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium lg:px-2.5 lg:py-1 lg:text-xs ${
                      reservation.user_role === "teacher"
                        ? "bg-blue-100 text-blue-700"
                        : reservation.user_role === "student"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {reservation.user_role === "teacher"
                      ? "Pensyarah"
                      : reservation.user_role === "student"
                        ? "Pelajar"
                        : "Admin"}
                  </span>
                </Table.Cell>

                <Table.Cell className="px-2 py-2 lg:px-3">
                  <span className="block truncate">
                    {reservation.booker_phone}
                  </span>
                </Table.Cell>
                <Table.Cell className="px-2 py-2 lg:px-3">
                  <span className="block truncate">
                    {reservation.room_name}
                  </span>
                </Table.Cell>
                <Table.Cell className="px-2 py-2 lg:px-3">
                  <span className="block truncate">
                    {formatDate(reservation.booking_date)}
                  </span>
                </Table.Cell>
                <Table.Cell className="px-2 py-2 lg:px-3">
                  <span
                    className={
                      reservation.status === "cancelled"
                        ? "text-red-500"
                        : "text-green-600"
                    }
                  >
                    {reservation.status}
                  </span>
                </Table.Cell>
                <Table.Cell className="hidden px-2 py-2 md:table-cell lg:px-3">
                  {reservation.capacity}
                </Table.Cell>
                <Table.Cell className="px-2 py-2 lg:px-3">
                  {/* whitespace-nowrap keeps the time slot on ONE horizontal line */}
                  <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-md bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent lg:px-3 lg:py-1.5 lg:text-sm">
                    {reservation.time_slot}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>

      <Pagination className="mt-4 flex-wrap gap-2">
        <Pagination.Summary>
          Page {currentPage} of {Math.max(totalPages, 1)}
        </Pagination.Summary>

        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={currentPage === 1}
              onPress={() => setCurrentPage((p) => p - 1)}
            >
              <Pagination.PreviousIcon />
              <span>Previous</span>
            </Pagination.Previous>
          </Pagination.Item>

          <Pagination.Item>
            <Pagination.Next
              isDisabled={currentPage >= totalPages}
              onPress={() => setCurrentPage((p) => p + 1)}
            >
              <span>Next</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

function DashboardKpi({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title className={`text-sm sm:text-base ${className}`}>
          {label}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-2xl font-bold sm:text-3xl">{value}</p>
      </Card.Content>
    </Card>
  );
}
