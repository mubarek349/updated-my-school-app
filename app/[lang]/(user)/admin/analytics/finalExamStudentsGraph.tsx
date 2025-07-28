"use client";
import { getFinalExamOfPackageAnalytics, getPackageAnalytics } from "@/actions/admin/analysis";
import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function FinalExamStudentsGraph() {
  const [data, setData] = React.useState<
    {
      name: string;
      notStarted: number;
      inProgress: number;
      failed: number;
      passed: number;
      total: number;
    }[]
  >([]);
  const [maxTotal, setMaxTotal] = React.useState(0);

  useEffect(() => {
    async function fetchData() {
      const studentsData = await getFinalExamOfPackageAnalytics();
      // Map API data to expected chart data shape
      const chartData = (
        studentsData as Array<
          | {
              id: string;
              packageName: string;
              totalStudents: number;
              notStartedCount: number;
              inProgressCount: number;
              failedCount: number;
              passedCount: number;
            }
          | undefined
        >
      )
        .filter((item): item is NonNullable<typeof item> => !!item)
        .map((item) => ({
          name: item.packageName,
          notStarted: item.notStartedCount,
          inProgress: item.inProgressCount,
          failed: item.failedCount,
          passed: item.passedCount,
          total: item.totalStudents,
        }));
      setData(chartData);
      setMaxTotal(Math.max(...chartData.map((item) => item.total), 0));
    }
    fetchData();
  }, []);

  return (
    <ResponsiveContainer height={350} width="100%">
      <BarChart
        data={data}
        className="[&_.recharts-tooltip-cursor]:fill-white/10 dark:[&_.recharts-tooltip-cursor]:bg-black/5"
      >
        <Tooltip wrapperClassName="dark:!bg-black rounded-md dark:!border-border " />
        <Legend
          iconType="circle"
          formatter={(value) => {
            if (value === "notStarted") {
              return <div>Students Not Started</div>;
            } else if (value === "inProgress") {
              return <div>Students In Progress</div>;
            } else if (value === "failed") {
              return <div>Students Failed</div>;
            }
             else if (value === "passed") {
              return <div>Students Passed</div>;
            }
          }}
        />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} domain={[0, maxTotal]} />
        <Bar dataKey="notStarted" stackId={1} fill="#f87171" />
        <Bar dataKey="inProgress" stackId={1} fill="#34d399" />
        <Bar dataKey="failed" stackId={1} fill="#d33473ff" />
        <Bar
          dataKey="passed"
          stackId={1}
          fill="#60a5fa"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
