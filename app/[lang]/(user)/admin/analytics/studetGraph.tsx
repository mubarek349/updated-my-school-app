"use client";
import {
  getPackageAnalytics,
} from "@/actions/admin/analysis";
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

export default function StudentGraph() {
  const [data, setData] = React.useState([
    { name: "", notStarted: 0, onprogress: 0, completed: 0 },
  ]);
  // This is a mock data set. Replace it with the actual data fetching logic.
  // You can fetch the data from your API or any other source and set it using setData
  // For example, you can use the getStudentsData function to fetch the data
  // and then set it in the state using setData(data) after the data is fetched.

  useEffect(() => {
    async function fetchData() {
      const studentsData = await getPackageAnalytics();
      // Map API data to expected chart data shape
      const chartData = studentsData.map(
        (item: {
          packageName: string;
          completeStudent: number;
          enrollStudent: number;
          notStartStudent: number;
        }) => ({
          name: item.packageName,
          notStarted: item.notStartStudent, // Set to 0 or fetch actual not started count if available
          onprogress: item.enrollStudent,
          completed: item.completeStudent, // Set to 0 or fetch actual completed count if available
        })
      );
      setData(chartData);
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
            } else if (value === "enrolled") {
              return <div>Students Enrolled</div>;
            } else if (value === "completed") {
              return <div>Students Completed</div>;
            }
          }}
        />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
        <Bar dataKey="notStarted" stackId={1} fill="#f87171" />
        <Bar dataKey="enrolled" stackId={1} fill="#34d399" />
        <Bar
          dataKey="completed"
          stackId={1}
          fill="#60a5fa"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
