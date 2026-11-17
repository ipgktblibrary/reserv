// "use client";

// import { Accordion } from "@heroui/react";
// import {
//   CalendarDaysIcon,
//   ClockIcon,
//   PhoneIcon,
//   UserGroupIcon,
// } from "@heroicons/react/24/outline";

// import { useTodayReports } from "@/features/reservation/useReservationReports";
// import { FaWhatsapp } from "react-icons/fa";
// import Link from "next/link";

// export function TodayBooking() {
//   const { data, loading, formatTime } = useTodayReports();

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-6">
//         <div className="flex items-start gap-4">
//           <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
//             <CalendarDaysIcon className="size-5 text-primary" />
//           </div>

//           <div>
//             <h1 className="text-2xl font-semibold tracking-tight">
//               Today&apos;s Booking
//             </h1>

//             <p className="mt-1.5 text-sm text-default-500">
//               Confirmed room bookings for today
//             </p>
//           </div>
//         </div>

//         {!loading && (
//           <div className="shrink-0 rounded-full bg-default-100 px-3.5 py-1.5 text-sm font-medium text-default-600">
//             {data.length} {data.length === 1 ? "booking" : "bookings"}
//           </div>
//         )}
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="space-y-4">
//           {[1, 2, 3].map((item) => (
//             <div
//               key={item}
//               className="h-28 animate-pulse rounded-2xl bg-default-100"
//             />
//           ))}
//         </div>
//       )}

//       {/* Empty */}
//       {!loading && data.length === 0 && (
//         <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 px-6 text-center">
//           <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-default-100">
//             <CalendarDaysIcon className="size-6 text-default-400" />
//           </div>

//           <h2 className="font-medium">No bookings today</h2>

//           <p className="mt-1.5 max-w-sm text-sm leading-6 text-default-500">
//             There are no confirmed room bookings scheduled for today.
//           </p>
//         </div>
//       )}

//       {/* Booking list */}
//       {!loading && data.length > 0 && (
//         <Accordion className="w-full space-y-3">
//           {data.map((booking) => (
//             <Accordion.Item
//               key={booking.id}
//               className="overflow-hidden rounded-2xl border border-default-200 bg-background"
//             >
//               <Accordion.Heading>
//                 <Accordion.Trigger className="w-full px-4 py-4 sm:px-5 sm:py-5">
//                   <div className="flex w-full min-w-0 items-center gap-4 sm:gap-6">
//                     {/* Time */}
//                     <div className="flex w-55 shrink-0 items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary">
//                       <ClockIcon className="size-5 shrink-0" />

//                       <div className="flex items-center gap-2 whitespace-nowrap">
//                         <span className="text-sm font-semibold tabular-nums sm:text-base">
//                           {formatTime(booking.start_time)}
//                         </span>

//                         <span className="text-primary/50">—</span>

//                         <span className="text-sm font-semibold tabular-nums sm:text-base">
//                           {formatTime(booking.end_time)}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Booker + Room */}
//                     <div className="min-w-0 flex-1 text-left">
//                       <div className="flex flex-wrap items-center gap-2">
//                         <p className="truncate text-sm font-semibold sm:text-base">
//                           {booking.booker_name.toUpperCase()}
//                         </p>

//                         <span
//                           className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
//                             booking.user_role === "teacher"
//                               ? "bg-blue-100 text-blue-700"
//                               : booking.user_role === "student"
//                                 ? "bg-green-100 text-green-700"
//                                 : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {booking.user_role === "teacher"
//                             ? "Pensyarah"
//                             : booking.user_role === "student"
//                               ? "Pelajar"
//                               : "Admin"}
//                         </span>
//                       </div>

//                       <p className="mt-1 truncate text-sm text-default-500">
//                         {booking.room_name}
//                       </p>
//                     </div>

//                     {/* Capacity */}
//                     <div className="hidden shrink-0 items-center gap-2 rounded-xl bg-default-100 px-3 py-2 text-sm text-default-500 sm:flex">
//                       <UserGroupIcon className="size-4" />

//                       <span className="font-medium">{booking.capacity}</span>
//                     </div>

//                     {/* Accordion arrow */}
//                     <div className="flex shrink-0 items-center justify-center">
//                       <Accordion.Indicator />
//                     </div>
//                   </div>
//                 </Accordion.Trigger>
//               </Accordion.Heading>

//               <Accordion.Panel>
//                 <Accordion.Body className="px-4 pb-5 sm:px-5 sm:pb-6">
//                   <div className="border-t border-default-200 pt-5">
//                     <div className="grid gap-6 sm:grid-cols-3">
//                       {/* Booker */}

//                       <div className="space-y-2">
//                         <p className="text-xs font-medium uppercase tracking-wider text-default-400">
//                           Booker
//                         </p>

//                         <p className="text-sm font-medium leading-6">
//                           {booking.booker_name.toUpperCase()}
//                         </p>

//                         <span
//                           className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
//                             booking.user_role === "teacher"
//                               ? "bg-blue-100 text-blue-700"
//                               : booking.user_role === "student"
//                                 ? "bg-green-100 text-green-700"
//                                 : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {booking.user_role === "teacher"
//                             ? "Pensyarah"
//                             : booking.user_role === "student"
//                               ? "Pelajar"
//                               : "Admin"}
//                         </span>
//                       </div>

//                       {/* Phone */}
//                       <div className="space-y-2">
//                         <p className="text-xs font-medium uppercase tracking-wider text-default-400">
//                           Phone Number
//                         </p>

//                         <div className="flex items-center gap-2">
//                           <PhoneIcon className="size-4 shrink-0 text-default-400" />

//                           <span className="text-sm font-medium">
//                             {booking.booker_phone ?? "—"}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <p className="text-xs font-medium uppercase tracking-wider text-default-400">
//                           Whatsapp
//                         </p>

//                         <div className="flex items-center gap-2">
//                           <FaWhatsapp />

//                           <Link
//                             href={`https://wa.me/${booking.booker_phone?.replace(/^0/, "60")}`}
//                             target="_blank"
//                           >
//                             <span className="text-sm font-medium">
//                               {booking.booker_phone ?? "—"}
//                             </span>
//                           </Link>
//                         </div>
//                       </div>

//                       {/* Room */}
//                       <div className="space-y-2">
//                         <p className="text-xs font-medium uppercase tracking-wider text-default-400">
//                           Room
//                         </p>

//                         <p className="text-sm font-medium leading-6">
//                           {booking.room_name}
//                         </p>

//                         <div className="flex items-center gap-2 text-sm text-default-500">
//                           <UserGroupIcon className="size-4 shrink-0" />

//                           <span>{booking.capacity} people</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Accordion.Body>
//               </Accordion.Panel>
//             </Accordion.Item>
//           ))}
//         </Accordion>
//       )}
//     </div>
//   );
// }

"use client";

import { Accordion } from "@heroui/react";

import { useTodayReports } from "@/features/reservation/useReservationReports";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

function roleLabel(role: string) {
  return role === "teacher"
    ? "Pensyarah"
    : role === "student"
      ? "Pelajar"
      : "Admin";
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 py-2 text-sm">
      <dt className="text-default-500">{label}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </div>
  );
}

function roleColor(role: string) {
  return role === "teacher"
    ? "text-blue-600 dark:text-blue-400"
    : role === "student"
      ? "text-success"
      : "text-warning";
}

export function TodayBooking() {
  const { data, loading, formatTime } = useTodayReports();

  return (
    <div className="w-full space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Today&apos;s Booking
          </h1>

          <p className="mt-2 text-default-500">
            Confirmed room bookings for today
          </p>
        </div>

        {!loading && (
          <div className="shrink-0 text-right leading-none">
            <p className="text-4xl font-light tabular-nums">{data.length}</p>
            <p className="mt-1.5 text-sm text-default-500">
              {data.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="border-t border-default-200">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-4 border-b border-default-200 px-3 py-5"
            >
              <div className="w-24 space-y-2 sm:w-32">
                <div className="h-5 w-14 animate-pulse rounded bg-default-100" />
                <div className="h-4 w-10 animate-pulse rounded bg-default-100" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/5 animate-pulse rounded bg-default-100" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-default-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="border-y border-default-200 py-14">
          <h2 className="text-lg font-semibold">No bookings today</h2>

          <p className="mt-1 text-default-500">
            There are no confirmed room bookings scheduled for today.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <Accordion className="w-full border-t border-default-200">
          {data.map((booking) => (
            <Accordion.Item
              key={booking.id}
              className="border-b border-default-200"
            >
              <Accordion.Heading>
                <Accordion.Trigger className="w-full px-3 py-5 transition-colors hover:bg-default-100/60">
                  <div className="flex w-full min-w-0 items-start gap-4">
                    <div className="w-24 shrink-0 text-left sm:w-32">
                      <p className="text-lg font-semibold leading-none tabular-nums text-primary">
                        {formatTime(booking.start_time)}
                      </p>

                      <p className="mt-2 text-sm leading-none tabular-nums text-default-500">
                        to {formatTime(booking.end_time)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-base font-semibold leading-none">
                        {booking.booker_name.toUpperCase()}
                      </p>

                      <p className="mt-2 truncate text-sm leading-none text-default-500">
                        {booking.room_name}
                      </p>
                    </div>

                    <div className="hidden shrink-0 text-right text-sm leading-none sm:block">
                      <p
                        className={`font-medium ${roleColor(booking.user_role)}`}
                      >
                        {roleLabel(booking.user_role)}
                      </p>
                      <p className="mt-2 tabular-nums text-default-500">
                        {booking.capacity} orang
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center self-center text-default-400">
                      <Accordion.Indicator />
                    </div>
                  </div>
                </Accordion.Trigger>
              </Accordion.Heading>

              <Accordion.Panel>
                <Accordion.Body className="px-3 pb-5">
                  <dl className="divide-y divide-default-100 pl-28 sm:pl-36">
                    <Row label="Booker">
                      {booking.booker_name.toUpperCase()}
                    </Row>

                    <Row label="Role">
                      <span className={roleColor(booking.user_role)}>
                        {roleLabel(booking.user_role)}
                      </span>
                    </Row>

                    <Row label="Room">
                      <span className="font-normal text-default-500">
                        {booking.capacity} orang
                      </span>
                    </Row>

                    <Row label="Phone Number">
                      <span className="tabular-nums">
                        {booking.booker_phone ?? "—"}
                      </span>
                    </Row>

                    <Row label="Whatsapp">
                      <Link
                        href={`https://wa.me/${booking.booker_phone?.replace(/^0/, "60")}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-success underline-offset-4 hover:underline"
                      >
                        <FaWhatsapp className="size-4" />
                        <span className="tabular-nums">
                          {booking.booker_phone ?? "—"}
                        </span>
                      </Link>
                    </Row>
                  </dl>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}
