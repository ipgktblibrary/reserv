"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export type Props = {
  data: {
    name: "Pagi" | "Petang";
    value: number;
    color: string;
  }[];
};

export default function TimeSlotDonut({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="w-full max-w-7xl mx-auto rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Agihan Tempahan Mengikut Slot Masa
        </h2>
        <p className="text-sm text-slate-500">
          Peratusan tempahan mengikut slot masa operasi.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[320px_1fr]">
        {/* Donut */}
        <div className="relative h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-slate-900">{total}%</p>
            <p className="text-sm text-slate-500">Jumlah Agihan</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-5">
          {data.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="font-medium text-slate-800">
                    {item.name}
                  </span>
                </div>

                <span className="text-lg font-semibold text-slate-900">
                  {item.value}%
                </span>
              </div>

              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Kadar Penggunaan</span>

                <span className="font-medium text-slate-900">
                  {item.value}% daripada keseluruhan
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
