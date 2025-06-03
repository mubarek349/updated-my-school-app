"use client";
import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Math", enrolled: 120, completed: 80 },
  { name: "Science", enrolled: 150, completed: 100 },
  { name: "History", enrolled: 90, completed: 70 },
  { name: "English", enrolled: 110, completed: 85 },
  { name: "Art", enrolled: 60, completed: 50 },
  { name: "Music", enrolled: 75, completed: 65 },
  { name: "Physics", enrolled: 130, completed: 95 },
  { name: "Chemistry", enrolled: 140, completed: 105 },
  { name: "Biology", enrolled: 100, completed: 80 },
  { name: "Economics", enrolled: 85, completed: 60 },
];

export default function StudentGraph() {
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
            if (value === "enrolled") {
              return <div>Students Enrolled</div>;
            } else if (value === "completed") {
              return <div>Students Completed</div>;
            }
          }}
        />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} />
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
