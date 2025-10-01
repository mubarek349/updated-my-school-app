import { requireAuthentication } from "@/actions/admin/authentication";
import UstazManagement from "@/components/custom/admin/ustaz-management";
import { UserCheck, Shield, MessageSquare } from "lucide-react";

export default async function UstazsPage() {
  await requireAuthentication();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ustazs</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Responses</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Ustaz Management
          </h2>
          <p className="text-gray-600 mt-1">
            Add, edit, and manage ustaz permissions and settings
          </p>
        </div>
        <UstazManagement />
      </div>
    </div>
  );
}
