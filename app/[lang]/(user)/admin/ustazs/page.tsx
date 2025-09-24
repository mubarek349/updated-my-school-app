import { requireAuthentication } from "@/actions/admin/authentication";
import UstazManagement from "@/components/custom/admin/ustaz-management";

export default async function UstazsPage() {
  await requireAuthentication();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ustaz Management</h1>
        <p className="text-gray-600 mt-2">
          Manage ustazs who can respond to student questions
        </p>
      </div>
      
      <UstazManagement />
    </div>
  );
}