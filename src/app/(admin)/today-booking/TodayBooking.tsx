"use client";

import { Accordion } from "@heroui/react";
import {
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { useTodayReports } from "@/features/reservation/useReservationReports";

export function TodayBooking() {
  const { data, loading, formatTime } = useTodayReports();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarDaysIcon className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Today&apos;s Booking
            </h1>

            <p className="mt-1.5 text-sm text-default-500">
              Confirmed room bookings for today
            </p>
          </div>
        </div>

        {!loading && (
          <div className="shrink-0 rounded-full bg-default-100 px-3.5 py-1.5 text-sm font-medium text-default-600">
            {data.length} {data.length === 1 ? "booking" : "bookings"}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-default-100"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-default-100">
            <CalendarDaysIcon className="size-6 text-default-400" />
          </div>

          <h2 className="font-medium">No bookings today</h2>

          <p className="mt-1.5 max-w-sm text-sm leading-6 text-default-500">
            There are no confirmed room bookings scheduled for today.
          </p>
        </div>
      )}

      {/* Booking list */}
      {!loading && data.length > 0 && (
        <Accordion className="w-full space-y-3">
          {data.map((booking) => (
            <Accordion.Item
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-default-200 bg-background"
            >
              <Accordion.Heading>
                <Accordion.Trigger className="w-full px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex w-full min-w-0 items-center gap-4 sm:gap-6">
                    {/* Time */}
                    <div className="flex w-[220px] shrink-0 items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary">
                      <ClockIcon className="size-5 shrink-0" />

                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-sm font-semibold tabular-nums sm:text-base">
                          {formatTime(booking.start_time)}
                        </span>

                        <span className="text-primary/50">—</span>

                        <span className="text-sm font-semibold tabular-nums sm:text-base">
                          {formatTime(booking.end_time)}
                        </span>
                      </div>
                    </div>

                    {/* Booker + Room */}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold sm:text-base">
                        {booking.booker_name.toUpperCase()}
                      </p>

                      <p className="mt-1 truncate text-sm text-default-500">
                        {booking.room_name}
                      </p>
                    </div>

                    {/* Capacity */}
                    <div className="hidden shrink-0 items-center gap-2 rounded-xl bg-default-100 px-3 py-2 text-sm text-default-500 sm:flex">
                      <UserGroupIcon className="size-4" />

                      <span className="font-medium">{booking.capacity}</span>
                    </div>

                    {/* Accordion arrow */}
                    <div className="flex shrink-0 items-center justify-center">
                      <Accordion.Indicator />
                    </div>
                  </div>
                </Accordion.Trigger>
              </Accordion.Heading>

              <Accordion.Panel>
                <Accordion.Body className="px-4 pb-5 sm:px-5 sm:pb-6">
                  <div className="border-t border-default-200 pt-5">
                    <div className="grid gap-6 sm:grid-cols-3">
                      {/* Booker */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-default-400">
                          Booker
                        </p>

                        <p className="text-sm font-medium leading-6">
                          {booking.booker_name.toUpperCase()}
                        </p>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-default-400">
                          Phone Number
                        </p>

                        <div className="flex items-center gap-2">
                          <PhoneIcon className="size-4 shrink-0 text-default-400" />

                          <span className="text-sm font-medium">
                            {booking.booker_phone ?? "—"}
                          </span>
                        </div>
                      </div>

                      {/* Room */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-default-400">
                          Room
                        </p>

                        <p className="text-sm font-medium leading-6">
                          {booking.room_name}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <UserGroupIcon className="size-4 shrink-0" />

                          <span>{booking.capacity} people</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}
