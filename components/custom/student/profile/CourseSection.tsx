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
  badgeColor ,
}: CourseSectionProps) {
  
  return (
    <>
      <h2 className="text-xl ml-3 font-semibold text-gray-900">
        {title}{" "}
        <span
          className={`text-sm ${badgeColor} border rounded-full px-2 py-1`}
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
