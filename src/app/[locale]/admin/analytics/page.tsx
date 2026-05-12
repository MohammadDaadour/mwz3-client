"use client";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FetchAnalytics } from "@/libs/actions";

// --- Helpers ---
function parseDevice(userAgent: string) {
  if (!userAgent) return "غير معروف";

  const ua = userAgent.toLowerCase();

  if (ua.includes("mobile") && !ua.includes("ipad")) return "موبايل";
  if (ua.includes("tablet") || ua.includes("ipad")) return "تابلت";
  if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux"))
    return "كمبيوتر";

  return "أخرى";
}

function aggregateDevices(data: { userAgent: string; count: string }[]) {
  const result: Record<string, number> = {};

  data.forEach((d) => {
    const device = parseDevice(d.userAgent);
    const count = Number(d.count) || 0;
    result[device] = (result[device] || 0) + count;
  });

  return Object.entries(result).map(([device, count]) => ({ device, count }));
}

// --- Component ---
export default function AnalyticsDashboard() {
  const [visitors, setVisitors] = useState(0);
  const [viewsPeriod, setViewsPeriod] = useState({ day: 0, week: 0, month: 0 });
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [uniqueVisitorsPeriod, setUniqueVisitorsPeriod] = useState({
    day: 0,
    week: 0,
    month: 0,
  });
  const [pageViews, setPageViews] = useState(0);
  const [devices, setDevices] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      const result = await FetchAnalytics();

      if (result.error) {
        console.error("Analytics fetch error:", result.error);
        return;
      }

      setVisitors(result.visitors);
      setViewsPeriod(result.viewsPeriod);
      setUniqueVisitors(result.uniqueVisitors);
      setUniqueVisitorsPeriod(result.uniqueVisitorsByPeriod);
      setPageViews(result.pageViews?.total || 0);
      setDevices(aggregateDevices(result.devices));
      setTopPages(result.topPages);
    }

    fetchAnalytics();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="إجمالي الزيارات" value={visitors} />
        <Card title="إجمالي الوصول" value={uniqueVisitors} />
        {/* <Card title="مشاهدات الصفحة" value={pageViews} /> */}
        <Card title="زيارات آخر يوم" value={viewsPeriod.day} />
      </div>

      {/* Period Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PeriodCard title="زيارات" period={viewsPeriod} />
        <PeriodCard title="الوصول" period={uniqueVisitorsPeriod} />
      </div>

      {/* Devices Chart */}
      <div className="border rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">الأجهزة</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={devices}
                dataKey="count"
                nameKey="device"
                outerRadius={100}
                label={({ count }) => count}
              >
                {devices.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              ></span>
              <span className="text-sm">
                {d.device}: <span className="font-bold">{d.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---
function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="border rounded-lg p-4 shadow flex flex-col items-center justify-center">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value || "_"}</p>
    </div>
  );
}

function PeriodCard({
  title,
  period,
}: {
  title: string;
  period: { day: number; week: number; month: number };
}) {
  return (
    <div className="border rounded-lg p-4 shadow ">
      <h3 className="text-lg font-semibold mb-2">{title} حسب الفترة</h3>
      <div className="space-y-1">
        <p className="text-sm">آخر يوم: <span className="font-bold">{period.day}</span></p>
        <p className="text-sm">آخر أسبوع: <span className="font-bold">{period.week}</span></p>
        <p className="text-sm">آخر شهر: <span className="font-bold">{period.month}</span></p>
      </div>
    </div>
  );
}
