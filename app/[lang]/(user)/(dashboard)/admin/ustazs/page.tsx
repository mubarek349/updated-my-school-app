import { requireAuthentication } from "@/actions/admin/authentication";
import UstazManagement from "@/components/custom/admin/ustaz-management";

export default async function UstazsPage() {
  await requireAuthentication();
  console.log("mubarek");
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Ustaz Management
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Manage ustazs who can respond to student questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              <UstazManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
