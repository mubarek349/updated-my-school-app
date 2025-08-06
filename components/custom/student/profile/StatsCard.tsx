import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="py-4 space-y-4">
        <div className="flex gap-3">
          {icon}
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{value}</h2>
      </CardContent>
    </Card>
  );
}
