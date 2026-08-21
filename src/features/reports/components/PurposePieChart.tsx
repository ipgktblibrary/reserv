"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export type PieChartItem = {
  name: string;
  value: number;
};

type Props = {
  data: PieChartItem[];
};

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function PurposePieChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Kekerapan Tujuan Penggunaan Bilik
        </h2>
        <p className="text-sm text-slate-500">
          Taburan tempahan mengikut tujuan penggunaan bilik/ruang.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
        {/* Pie Chart */}
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                outerRadius={135}
                innerRadius={70}
                paddingAngle={3}
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Always Visible Summary */}
        <div className="space-y-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-slate-500">Jumlah Tempahan</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>Tujuan Penggunaan</span>
              <span>Bilangan</span>
            </div>

            {data.map((item, index) => (
              <div
                key={item.name}
                className="grid grid-cols-[1fr_auto] items-center border-t px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="font-medium text-slate-800">
                    {item.name}
                  </span>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">
                    {((item.value / total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
