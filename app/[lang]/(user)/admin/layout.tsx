import { Sidebar } from "@/components/custom/admin/sidebar";
import { Navbar } from "@/components/custom/admin/navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-dvh overflow-hidden grid ">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] grid overflow-hidden">
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;
