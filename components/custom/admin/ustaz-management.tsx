"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Trash2, Plus, Search, Users, Edit, X, Filter, 
  Eye, EyeOff, AlertTriangle, CheckCircle, Loader2, 
  RefreshCw, Clock, MoreHorizontal 
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ustaz {
  id: number;
  ustazname: string;
  phoneno: string;
  permissioned: boolean;
  chat_id: string;
  _count?: {
    qandAResponse: number;
  };
}

type FilterType = "all" | "active" | "suspended";
type SortType = "name" | "responses" | "recent";

export default function UstazManagement() {
  const [ustazs, setUstazs] = useState<Ustaz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUstaz, setEditingUstaz] = useState<Ustaz | null>(null);
  const [deletingUstaz, setDeletingUstaz] = useState<Ustaz | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newUstaz, setNewUstaz] = useState({
    ustazname: "",
    phoneno: "",
    passcode: ""
  });
  const [editForm, setEditForm] = useState({
    ustazname: "",
    phoneno: "",
    passcode: ""
  });

  // Fetch ustazs
  const fetchUstazs = async () => {
    try {
      console.log("Fetching ustazs...");
      const response = await fetch("/api/admin/ustazs");
      console.log("Ustazs API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Ustazs data:", data);
        setUstazs(data);
      } else {
        const errorData = await response.text();
        console.error("Ustazs API error:", response.status, errorData);
        toast.error("Failed to fetch ustazs");
      }
    } catch (error) {
      console.error("Error fetching ustazs:", error);
      toast.error("Error fetching ustazs");
    } finally {
      setLoading(false);
    }
  };

  // Create new ustaz
  const createUstaz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUstaz.ustazname || !newUstaz.phoneno || !newUstaz.passcode) {
      toast.error("All fields are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/ustazs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUstaz)
      });

      if (response.ok) {
        toast.success("Ustaz created successfully");
        setNewUstaz({ ustazname: "", phoneno: "", passcode: "" });
        setShowCreateForm(false);
        setShowPassword(false);
        fetchUstazs();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create ustaz");
      }
    } catch (error) {
      toast.error("Error creating ustaz");
    } finally {
      setIsCreating(false);
    }
  };

  // Start editing ustaz
  const startEdit = (ustaz: Ustaz) => {
    setEditingUstaz(ustaz);
    setEditForm({
      ustazname: ustaz.ustazname,
      phoneno: ustaz.phoneno,
      passcode: ""
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingUstaz(null);
    setEditForm({
      ustazname: "",
      phoneno: "",
      passcode: ""
    });
    setShowEditPassword(false);
  };

  // Update ustaz
  const updateUstaz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUstaz || !editForm.ustazname || !editForm.phoneno || !editForm.passcode) {
      toast.error("All fields are required");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/ustazs/${editingUstaz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success("Ustaz updated successfully");
        cancelEdit();
        fetchUstazs();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update ustaz");
      }
    } catch (error) {
      toast.error("Error updating ustaz");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle ustaz permission
  const togglePermission = async (ustazId: string, currentPermission: boolean) => {
    try {
      const response = await fetch(`/api/admin/ustazs/${ustazId}/permission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissioned: !currentPermission })
      });

      if (response.ok) {
        toast.success(`Ustaz ${!currentPermission ? 'activated' : 'suspended'} successfully`);
        fetchUstazs();
      } else {
        toast.error("Failed to update permission");
      }
    } catch (error) {
      toast.error("Error updating permission");
    }
  };

  // Delete ustaz
  const deleteUstaz = async (ustaz: Ustaz) => {
    if ((ustaz._count?.qandAResponse || 0) > 0) {
      toast.error("Cannot delete ustaz with existing responses");
      return;
    }

    try {
      const response = await fetch(`/api/admin/ustazs/${ustaz.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Ustaz deleted successfully");
        fetchUstazs();
      } else {
        toast.error("Failed to delete ustaz");
      }
    } catch (error) {
      toast.error("Error deleting ustaz");
    }
  };

  useEffect(() => {
    fetchUstazs();
  }, []);

  // Filter and sort ustazs
  const filteredAndSortedUstazs = ustazs
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

  const stats = {
    total: ustazs.length,
    active: ustazs.filter(u => u.permissioned).length,
    suspended: ustazs.filter(u => !u.permissioned).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading ustazs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-h-screen overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-4 py-6 space-y-8 pb-20">
          {/* Enhanced Header with Stats */}
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

      {/* Enhanced Controls */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search ustazs by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Filter */}
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="w-[140px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="suspended">Suspended Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
                <SelectTrigger className="w-[140px] h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="responses">Sort by Responses</SelectItem>
                  <SelectItem value="recent">Sort by Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchUstazs}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Ustaz
              </Button>
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
            <form onSubmit={createUstaz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ustaz Name *</Label>
                  <Input
                    id="name"
                    value={newUstaz.ustazname}
                    onChange={(e) => setNewUstaz({...newUstaz, ustazname: e.target.value})}
                    placeholder="Enter ustaz name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneno">Phone Number *</Label>
                  <Input
                    id="phoneno"
                    type="tel"
                    value={newUstaz.phoneno}
                    onChange={(e) => setNewUstaz({...newUstaz, phoneno: e.target.value})}
                    placeholder="Enter phone number"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Passcode *</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUstaz.passcode}
                    onChange={(e) => setNewUstaz({...newUstaz, passcode: e.target.value})}
                    placeholder="Enter passcode"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Ustaz"
                  )}
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
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateUstaz} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Ustaz Name *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.ustazname}
                    onChange={(e) => setEditForm({...editForm, ustazname: e.target.value})}
                    placeholder="Enter ustaz name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phoneno">Phone Number *</Label>
                  <Input
                    id="edit-phoneno"
                    type="tel"
                    value={editForm.phoneno}
                    onChange={(e) => setEditForm({...editForm, phoneno: e.target.value})}
                    placeholder="Enter phone number"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">New Passcode *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      value={editForm.passcode}
                      onChange={(e) => setEditForm({...editForm, passcode: e.target.value})}
                      placeholder="Enter new passcode"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a new passcode to update the current one
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
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
          <div className="relative">
            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
              {filteredAndSortedUstazs.length > 5 && (
                <div className="absolute top-0 right-0 z-10 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-md">
                  Scroll for more
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
          filteredAndSortedUstazs.map((ustaz: Ustaz) => (
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
                  
                  <div className="flex items-center gap-3">
                    {/* Permission Toggle */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`permission-${ustaz.id}`} className="text-sm font-medium">
                        {ustaz.permissioned ? "Active" : "Suspended"}
                      </Label>
                      <Switch
                        id={`permission-${ustaz.id}`}
                        checked={ustaz.permissioned}
                        onCheckedChange={() => togglePermission(ustaz.id.toString(), ustaz.permissioned)}
                      />
                    </div>
                    
                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(ustaz)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(ustaz._count?.qandAResponse || 0) > 0}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Ustaz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{ustaz.ustazname}</strong>? 
                            This action cannot be undone.
                            {(ustaz._count?.qandAResponse || 0) > 0 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                This ustaz has {ustaz._count?.qandAResponse} responses and cannot be deleted.
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUstaz(ustaz)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={(ustaz._count?.qandAResponse || 0) > 0}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
