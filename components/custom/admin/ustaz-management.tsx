"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getUstazs, 
  createUstaz, 
  updateUstaz, 
  toggleUstazPermission, 
  deleteUstaz,
  type Ustaz
} from "@/actions/admin/ustaz-management";

type FilterType = "all" | "active" | "suspended";
type SortType = "name" | "responses" | "recent";

export default function UstazManagement() {
  const [ustazs, setUstazs] = useState<Ustaz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUstaz, setEditingUstaz] = useState<Ustaz | null>(null);
  const [permissionUstaz, setPermissionUstaz] = useState<Ustaz | null>(null);
  const [deletingUstaz, setDeletingUstaz] = useState<Ustaz | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newUstaz, setNewUstaz] = useState({
    ustazname: "",
    phoneno: "",
    passcode: ""
  });

  const [editUstaz, setEditUstaz] = useState({
    ustazname: "",
    phoneno: "",
    passcode: ""
  });

  // Fetch ustazs
  const fetchUstazs = async () => {
    try {
      const result = await getUstazs();
      if (result.success && result.data) {
        setUstazs(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch ustazs');
      }
    } catch (error) {
      console.error('Error fetching ustazs:', error);
      toast.error('Failed to fetch ustazs');
    } finally {
      setLoading(false);
    }
  };

  // Create ustaz
  const handleCreateUstaz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createUstaz({
        ustazname: newUstaz.ustazname,
        phoneno: newUstaz.phoneno,
        passcode: newUstaz.passcode || undefined
      });

      if (result.success && result.data) {
        setUstazs(prev => [...prev, result.data!]);
        setNewUstaz({ ustazname: "", phoneno: "", passcode: "" });
        setShowCreateForm(false);
        setShowPassword(false);
        toast.success('Ustaz created successfully!');
      } else {
        toast.error(result.error || 'Failed to create ustaz');
      }
    } catch (error) {
      console.error('Error creating ustaz:', error);
      toast.error('Failed to create ustaz');
    }
  };

  // Update ustaz
  const handleUpdateUstaz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUstaz) return;

    setIsUpdating(true);
    try {
      const result = await updateUstaz(editingUstaz.id, {
        ustazname: editUstaz.ustazname,
        phoneno: editUstaz.phoneno,
        passcode: editUstaz.passcode
      });

      if (result.success && result.data) {
        setUstazs(prev => prev.map(u => u.id === editingUstaz.id ? result.data! : u));
        setEditingUstaz(null);
        setEditUstaz({ ustazname: "", phoneno: "", passcode: "" });
        toast.success('Ustaz updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update ustaz');
      }
    } catch (error) {
      console.error('Error updating ustaz:', error);
      toast.error('Failed to update ustaz');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle permission
  const handleTogglePermission = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleUstazPermission(id, !currentStatus);
      
      if (result.success && result.data) {
        setUstazs(prev => prev.map(u => u.id === result.data!.id ? result.data! : u));
        toast.success(`Ustaz ${!currentStatus ? 'activated' : 'suspended'} successfully!`);
      } else {
        toast.error(result.error || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Failed to update permission');
    }
  };

  // Delete ustaz
  const handleDeleteUstaz = async (ustaz: Ustaz) => {
    try {
      const result = await deleteUstaz(ustaz.id);
      
      if (result.success) {
        setUstazs(prev => prev.filter(u => u.id !== ustaz.id));
        setDeletingUstaz(null);
        toast.success('Ustaz deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete ustaz');
      }
    } catch (error) {
      console.error('Error deleting ustaz:', error);
      toast.error('Failed to delete ustaz');
    }
  };

  // Generate random passcode
  const generatePasscode = () => {
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    setNewUstaz(prev => ({ ...prev, passcode }));
  };

  useEffect(() => {
    fetchUstazs();
  }, []);

  // Filter and sort ustazs
  const filteredAndSortedUstazs: Ustaz[] = ustazs
    .filter(ustaz => {
      const matchesSearch = ustaz.ustazname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ustaz.phoneno.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === "all" || 
                           (filterType === "active" && ustaz.permissioned) ||
                           (filterType === "suspended" && !ustaz.permissioned);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortType) {
        case "name":
          return a.ustazname.localeCompare(b.ustazname);
        case "responses":
          return (b._count?.qandAResponse || 0) - (a._count?.qandAResponse || 0);
        case "recent":
          return b.id - a.id;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: ustazs.length,
    active: ustazs.filter(u => u.permissioned).length,
    suspended: ustazs.filter(u => !u.permissioned).length
  };

  const cancelEdit = () => {
    setEditingUstaz(null);
    setEditUstaz({ ustazname: "", phoneno: "", passcode: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading ustazs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen overflow-y-auto">
        <div className="container mx-auto px-4 py-6 space-y-8 pb-20">
          {/* Header with Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Ustazs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-full mr-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.suspended}</p>
                    <p className="text-sm text-gray-600">Suspended</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Ustazs</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="responses">Sort by Responses</option>
                    <option value="recent">Sort by Recent</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Form */}
          {showCreateForm && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Create New Ustaz
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowPassword(false);
                      setNewUstaz({ ustazname: "", phoneno: "", passcode: "" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Add a new ustaz who can respond to student questions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUstaz} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ustaz Name *
                      </label>
                      <Input
                        value={newUstaz.ustazname}
                        onChange={(e) => setNewUstaz(prev => ({ ...prev, ustazname: e.target.value }))}
                        placeholder="Enter ustaz name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        value={newUstaz.phoneno}
                        onChange={(e) => setNewUstaz(prev => ({ ...prev, phoneno: e.target.value }))}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passcode (optional - will be auto-generated if empty)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={newUstaz.passcode}
                        onChange={(e) => setNewUstaz(prev => ({ ...prev, passcode: e.target.value }))}
                        placeholder="Enter passcode or leave empty for auto-generation"
                        type={showPassword ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePasscode}
                        className="px-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ustaz
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setShowPassword(false);
                        setNewUstaz({ ustazname: "", phoneno: "", passcode: "" });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Edit Modal */}
          {editingUstaz && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md bg-white shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Edit Ustaz</CardTitle>
                    <CardDescription>Update ustaz information</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateUstaz} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ustaz Name
                      </label>
                      <Input
                        value={editUstaz.ustazname}
                        onChange={(e) => setEditUstaz(prev => ({ ...prev, ustazname: e.target.value }))}
                        placeholder="Enter ustaz name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        value={editUstaz.phoneno}
                        onChange={(e) => setEditUstaz(prev => ({ ...prev, phoneno: e.target.value }))}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passcode
                      </label>
                      <Input
                        value={editUstaz.passcode}
                        onChange={(e) => setEditUstaz(prev => ({ ...prev, passcode: e.target.value }))}
                        placeholder="Enter passcode"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Ustaz"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={cancelEdit} 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ustazs List */}
          <div className="space-y-4 pb-32">
            {!showCreateForm && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ustazs ({filteredAndSortedUstazs.length})
                </h2>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Ustaz
                </Button>
              </div>
            )}

            {filteredAndSortedUstazs.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ustazs found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterType !== "all" 
                        ? "Try adjusting your search or filter criteria" 
                        : "Get started by adding your first ustaz"}
                    </p>
                    {!searchTerm && filterType === "all" && (
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Ustaz
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 pb-12">
                {filteredAndSortedUstazs.map((ustaz: Ustaz) => (
                  <Card key={ustaz.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{ustaz.ustazname}</h3>
                            <Badge 
                              variant={ustaz.permissioned ? "default" : "secondary"}
                              className={ustaz.permissioned ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {ustaz.permissioned ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Suspended
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2 font-medium">{ustaz.phoneno}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {ustaz._count?.qandAResponse || 0} responses
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              ID: {ustaz.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUstaz(ustaz);
                              setEditUstaz({
                                ustazname: ustaz.ustazname,
                                phoneno: ustaz.phoneno,
                                passcode: ""
                              });
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPermissionUstaz(ustaz)}
                            className={ustaz.permissioned ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                          >
                            {ustaz.permissioned ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingUstaz(ustaz)}
                            disabled={(ustaz._count?.qandAResponse || 0) > 0}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Toggle Confirmation Dialog */}
      <AlertDialog open={!!permissionUstaz} onOpenChange={() => setPermissionUstaz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Permission Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {permissionUstaz?.permissioned ? 'suspend' : 'activate'} {permissionUstaz?.ustazname}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (permissionUstaz) {
                handleTogglePermission(permissionUstaz.id, permissionUstaz.permissioned);
                setPermissionUstaz(null);
              }
            }}>
              {permissionUstaz?.permissioned ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUstaz} onOpenChange={() => setDeletingUstaz(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ustaz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUstaz?.ustazname}</strong>? 
              This action cannot be undone.
              {(deletingUstaz?._count?.qandAResponse || 0) > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  This ustaz has {deletingUstaz?._count?.qandAResponse} responses and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUstaz && handleDeleteUstaz(deletingUstaz)}
              className="bg-red-600 hover:bg-red-700"
              disabled={(deletingUstaz?._count?.qandAResponse || 0) > 0}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}