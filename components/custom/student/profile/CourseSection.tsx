interface CourseSectionProps {
  title: string;
  badge: string;
  children: React.ReactNode;
  badgeColor?: string;
}

export default function CourseSection({
  title,
  badge,
  children,
  badgeColor = "blue",
}: CourseSectionProps) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 border-blue-100",
    green: "text-green-600 bg-green-100 border-green-100",
  };

  return (
    <>
      <h2 className="text-xl ml-3 font-semibold text-gray-900">
        {title}{" "}
        <span
          className={`text-sm ${colorMap.blue} border rounded-full px-2 py-1`}
        >
          {badge}
        </span>
      </h2>
      <section className="grid grid-cols-1 sm:grid-cols-2 space-y-4 mb-8">
        {children}
      </section>
    </>
  );
}
