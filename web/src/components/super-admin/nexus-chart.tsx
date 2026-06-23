"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface NexusChartProps {
  data: any[];
  dataKey: string;
  category: string;
  color?: string;
}

export function NexusChart({ data, dataKey, category, color = "#6366f1" }: NexusChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"} />
          <XAxis 
            dataKey={category} 
            stroke={isDark ? "#475569" : "#94a3b8"} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke={isDark ? "#475569" : "#94a3b8"} 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#0f172a" : "#ffffff", 
              border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0", 
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: "bold",
              color: isDark ? "#ffffff" : "#0f172a",
              boxShadow: isDark ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            itemStyle={{ color: isDark ? "#ffffff" : "#0f172a" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
