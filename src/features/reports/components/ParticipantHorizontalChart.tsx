"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

export type HorizontalBarItem = {
  category: string;
  pelajar: number;
  pensyarah: number;
};

type Props = {
  data: HorizontalBarItem;
};

export default function ParticipantChart({ data }: Props) {
  const total = data.pelajar + data.pensyarah;
  return (
    <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Bilangan Peserta
        </h2>
        <p className="text-sm text-slate-500">
          Perbandingan jumlah peserta mengikut kategori.
        </p>
      </div>

      <div className="space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-slate-500">Jumlah Peserta</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-slate-500">Pelajar</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">
              {data.pelajar}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-slate-500">Pensyarah</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {data.pensyarah}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[data]}
              margin={{ left: 20, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="category" hide />

              <Bar
                dataKey="pelajar"
                stackId="a"
                fill="#4f46e5"
                radius={[8, 0, 0, 8]}
              >
                <LabelList
                  dataKey="pelajar"
                  position="center"
                  fill="#fff"
                  fontWeight={600}
                />
              </Bar>

              <Bar
                dataKey="pensyarah"
                stackId="a"
                fill="#10b981"
                radius={[0, 8, 8, 0]}
              >
                <LabelList
                  dataKey="pensyarah"
                  position="center"
                  fill="#fff"
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-600" />
            <span>Pelajar ({((data.pelajar / total) * 100).toFixed(1)}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>
              Pensyarah ({((data.pensyarah / total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
