import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  CreditCard,
  Eye,
  DollarSign
} from "lucide-react";
import type { Package as PackageType, PaymentSubmission, User } from "@shared/schema";

export default function AdminPackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedPackageForUser, setSelectedPackageForUser] = useState<string>("");
  
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    taskLimit: "",
    skipLimit: "",
    durationDays: "",
    paymentPerTask: "",
    qrCodeImage: "",
  });

  // Fetch packages
  const { data: packages, isLoading: packagesLoading } = useQuery<PackageType[]>({
    queryKey: ["/api/admin/packages"],
  });

  // Fetch payment submissions
  const { data: paymentSubmissions, isLoading: paymentsLoading } = useQuery<PaymentSubmission[]>({
    queryKey: ["/api/admin/payment-submissions"],
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch user packages
  const { data: userPackages, isLoading: userPackagesLoading } = useQuery({
    queryKey: ["/api/admin/user-packages"],
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: any) => {
      const response = await apiRequest('POST', '/api/admin/packages', packageData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Package Created",
        description: "New package has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create package.",
        variant: "destructive",
      });
    },
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PUT', `/api/admin/packages/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Package Updated",
        description: "Package has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setEditingPackage(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update package.",
        variant: "destructive",
      });
    },
  });

  // Review payment submission
  const reviewPaymentMutation = useMutation({
    mutationFn: async ({ submissionId, action, reason }: { submissionId: string; action: 'approve' | 'reject'; reason?: string }) => {
      const response = await apiRequest('POST', `/api/admin/payment-submissions/${submissionId}/review`, {
        action,
        reason,
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? "Payment Approved" : "Payment Rejected",
        description: variables.action === 'approve' 
          ? "User package has been activated successfully." 
          : "Payment submission has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-packages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review payment submission.",
        variant: "destructive",
      });
    },
  });

  // Assign package to user
  const assignPackageMutation = useMutation({
    mutationFn: async ({ userId, packageId }: { userId: string; packageId: string }) => {
      const response = await apiRequest('POST', '/api/admin/assign-package', {
        userId,
        packageId,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Package Assigned",
        description: "Package has been assigned to user successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-packages"] });
      setSelectedUser("");
      setSelectedPackageForUser("");
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign package to user.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewPackage({
      name: "",
      description: "",
      price: "",
      taskLimit: "",
      skipLimit: "",
      durationDays: "",
      paymentPerTask: "",
      qrCodeImage: "",
    });
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    createPackageMutation.mutate({
      ...newPackage,
      price: parseFloat(newPackage.price),
      taskLimit: parseInt(newPackage.taskLimit),
      skipLimit: parseInt(newPackage.skipLimit),
      durationDays: parseInt(newPackage.durationDays),
      paymentPerTask: parseFloat(newPackage.paymentPerTask),
    });
  };

  const handleUpdatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    updatePackageMutation.mutate({
      id: editingPackage.id,
      ...newPackage,
      price: parseFloat(newPackage.price),
      taskLimit: parseInt(newPackage.taskLimit),
      skipLimit: parseInt(newPackage.skipLimit),
      durationDays: parseInt(newPackage.durationDays),
      paymentPerTask: parseFloat(newPackage.paymentPerTask),
    });
  };

  const startEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      taskLimit: pkg.taskLimit.toString(),
      skipLimit: pkg.skipLimit.toString(),
      durationDays: pkg.durationDays.toString(),
      paymentPerTask: (pkg.paymentPerTask || '5.00').toString(),
      qrCodeImage: pkg.qrCodeImage || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (packagesLoading || paymentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-packages-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Package Management
        </h1>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-create-package">
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
              <DialogDescription>
                {editingPackage ? 'Update package details' : 'Set up a new package with task and skip limits'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={editingPackage ? handleUpdatePackage : handleCreatePackage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                    required
                    data-testid="input-package-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, price: e.target.value }))}
                    required
                    data-testid="input-package-price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  required
                  data-testid="textarea-package-description"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskLimit">Task Limit</Label>
                  <Input
                    id="taskLimit"
                    type="number"
                    value={newPackage.taskLimit}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, taskLimit: e.target.value }))}
                    required
                    data-testid="input-task-limit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skipLimit">Skip Limit</Label>
                  <Input
                    id="skipLimit"
                    type="number"
                    value={newPackage.skipLimit}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, skipLimit: e.target.value }))}
                    required
                    data-testid="input-skip-limit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={newPackage.durationDays}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, durationDays: e.target.value }))}
                    required
                    data-testid="input-duration-days"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentPerTask">Payment Per Task (₹)</Label>
                  <Input
                    id="paymentPerTask"
                    type="number"
                    step="0.01"
                    value={newPackage.paymentPerTask}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, paymentPerTask: e.target.value }))}
                    required
                    data-testid="input-payment-per-task"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrCodeImage">QR Code Image URL</Label>
                <Input
                  id="qrCodeImage"
                  type="url"
                  value={newPackage.qrCodeImage}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, qrCodeImage: e.target.value }))}
                  placeholder="https://example.com/qr-code.png"
                  data-testid="input-qr-code-url"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit"
                  disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                  data-testid="btn-save-package"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="payments">Payment Reviews</TabsTrigger>
          <TabsTrigger value="user-packages">User Packages</TabsTrigger>
          <TabsTrigger value="assign">Assign Package</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <Card key={pkg.id} data-testid={`package-card-${pkg.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-primary">₹{pkg.price}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span className="font-semibold">{pkg.taskLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skips:</span>
                      <span className="font-semibold">{pkg.skipLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold">{pkg.durationDays} days</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 bg-green-50 -mx-4 px-4 py-2">
                      <span className="text-green-700 font-medium">Per Task:</span>
                      <span className="font-semibold text-green-700">₹{pkg.paymentPerTask || '5.00'}</span>
                    </div>
                  </div>

                  {pkg.qrCodeImage && (
                    <div className="text-center py-2">
                      <img 
                        src={pkg.qrCodeImage} 
                        alt="QR Code" 
                        className="w-16 h-16 mx-auto rounded"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        startEdit(pkg);
                        setCreateDialogOpen(true);
                      }}
                      data-testid={`btn-edit-package-${pkg.id}`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`btn-view-package-${pkg.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Submissions for Review</CardTitle>
              <CardDescription>Review and approve/reject user payment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSubmissions?.filter(sub => sub.status === 'pending').map((submission) => (
                  <div 
                    key={submission.id}
                    className="border rounded-lg p-4 space-y-4"
                    data-testid={`payment-submission-${submission.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{submission.package?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          User: {submission.user?.firstName} {submission.user?.lastName} ({submission.user?.email})
                        </p>
                        <p className="text-sm">
                          <strong>UTR:</strong> {submission.utrNumber}
                        </p>
                        <p className="text-sm">
                          <strong>Amount:</strong> ₹{submission.package?.price}
                        </p>
                      </div>
                      
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                    </div>

                    {submission.screenshotUrl && (
                      <div>
                        <p className="text-sm font-medium mb-2">Payment Screenshot:</p>
                        <img 
                          src={submission.screenshotUrl}
                          alt="Payment Screenshot"
                          className="max-w-xs rounded border"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => reviewPaymentMutation.mutate({
                          submissionId: submission.id,
                          action: 'approve'
                        })}
                        disabled={reviewPaymentMutation.isPending}
                        data-testid={`btn-approve-payment-${submission.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt("Enter rejection reason:");
                          if (reason) {
                            reviewPaymentMutation.mutate({
                              submissionId: submission.id,
                              action: 'reject',
                              reason
                            });
                          }
                        }}
                        disabled={reviewPaymentMutation.isPending}
                        data-testid={`btn-reject-payment-${submission.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                
                {!paymentSubmissions?.some(sub => sub.status === 'pending') && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending payment submissions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-packages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active User Packages</CardTitle>
              <CardDescription>Monitor all user package statuses and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPackages?.map((userPkg: any) => (
                  <div 
                    key={userPkg.id}
                    className="border rounded-lg p-4"
                    data-testid={`user-package-${userPkg.id}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">User</p>
                        <p className="font-semibold">
                          {userPkg.user?.firstName} {userPkg.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{userPkg.user?.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Package</p>
                        <p className="font-semibold">{userPkg.package?.name}</p>
                        <Badge className={getStatusColor(userPkg.status)}>
                          {userPkg.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Usage</p>
                        <p className="text-sm">
                          Tasks: {userPkg.tasksUsed}/{userPkg.package?.taskLimit}
                        </p>
                        <p className="text-sm">
                          Skips: {userPkg.skipsUsed}/{userPkg.package?.skipLimit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Expires</p>
                        <p className="text-sm">
                          {userPkg.expiresAt ? new Date(userPkg.expiresAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!userPackages?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active user packages
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Package to User</CardTitle>
              <CardDescription>Directly assign a package to a user without payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger data-testid="select-user">
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Package</Label>
                  <Select value={selectedPackageForUser} onValueChange={setSelectedPackageForUser}>
                    <SelectTrigger data-testid="select-package">
                      <SelectValue placeholder="Choose a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.filter(pkg => pkg.isActive).map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ₹{pkg.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={() => assignPackageMutation.mutate({
                  userId: selectedUser,
                  packageId: selectedPackageForUser
                })}
                disabled={!selectedUser || !selectedPackageForUser || assignPackageMutation.isPending}
                data-testid="btn-assign-package"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Assign Package
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}