import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentHeaderProps {
  name: string;
  phone: string;
  id: number;
}

export default function StudentHeader({ name, phone, id }: StudentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
      <Avatar className="w-16 h-16 bg-blue-500 text-black">
        <AvatarFallback className="text-xl font-bold bg-blue-100">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          {name}
        </h1>
        <p className="text-sm text-muted-foreground">{phone}</p>
        <p className="text-sm text-muted-foreground">ID: {id}</p>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}
