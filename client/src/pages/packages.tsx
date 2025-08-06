import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Crown, 
  Star, 
  Clock, 
  CheckCircle, 
  Upload,
  CreditCard,
  Calendar,
  Target,
  SkipForward
} from "lucide-react";
import type { Package as PackageType, PaymentSubmission } from "@shared/schema";

export default function Packages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");

  // Fetch available packages
  const { data: packages, isLoading: packagesLoading } = useQuery<PackageType[]>({
    queryKey: ["/api/packages"],
  });

  // Fetch user's current package
  const { data: userPackage, isLoading: userPackageLoading } = useQuery({
    queryKey: ["/api/user/current-package"],
  });

  // Fetch user's payment submissions
  const { data: paymentSubmissions, isLoading: paymentsLoading } = useQuery<PaymentSubmission[]>({
    queryKey: ["/api/user/payment-submissions"],
  });

  // Payment submission mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: { packageId: string; screenshotUrl: string; utrNumber: string }) => {
      const response = await apiRequest('POST', '/api/user/submit-payment', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted",
        description: "Your payment proof has been submitted for review. You'll be notified once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/payment-submissions"] });
      setPaymentDialogOpen(false);
      setScreenshot(null);
      setUtrNumber("");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment proof. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setScreenshot(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPackage || !screenshot || !utrNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload payment screenshot and enter UTR number.",
        variant: "destructive",
      });
      return;
    }

    // Upload screenshot first
    const formData = new FormData();
    formData.append('file', screenshot);
    
    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload screenshot');
      }
      
      const { url: screenshotUrl } = await uploadResponse.json();
      
      submitPaymentMutation.mutate({
        packageId: selectedPackage.id,
        screenshotUrl,
        utrNumber: utrNumber.trim(),
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload screenshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0: return <Package className="w-8 h-8 text-blue-600" />;
      case 1: return <Star className="w-8 h-8 text-purple-600" />;
      case 2: return <Crown className="w-8 h-8 text-yellow-600" />;
      default: return <Package className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (packagesLoading || userPackageLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="packages-page">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Choose Your Package
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a package that fits your needs. Complete tasks, earn rewards, and grow your income with our flexible plans.
        </p>
      </div>

      {/* Current Package Status */}
      {userPackage && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Your Current Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-semibold">{userPackage.package?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tasks Remaining</p>
                <p className="font-semibold text-blue-600">
                  {(userPackage.package?.taskLimit || 0) - (userPackage.tasksUsed || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Skips Remaining</p>
                <p className="font-semibold text-orange-600">
                  {(userPackage.package?.skipLimit || 0) - (userPackage.skipsUsed || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-semibold">
                  {userPackage.expiresAt ? new Date(userPackage.expiresAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Packages</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Available Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages?.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  userPackage?.packageId === pkg.id ? 'ring-2 ring-primary' : ''
                }`}
                data-testid={`package-card-${pkg.id}`}
              >
                {userPackage?.packageId === pkg.id && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600">Current</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  {getPackageIcon(index)}
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription className="mt-2">{pkg.description}</CardDescription>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ₹{pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{pkg.durationDays} days
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Tasks</span>
                      </div>
                      <Badge variant="outline">{pkg.taskLimit} tasks</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SkipForward className="w-4 h-4 text-orange-600" />
                        <span className="text-sm">Skips</span>
                      </div>
                      <Badge variant="outline">{pkg.skipLimit} skips</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <Badge variant="outline">{pkg.durationDays} days</Badge>
                    </div>
                  </div>

                  {/* QR Code Display */}
                  {pkg.qrCodeImage && (
                    <div className="text-center py-4 border rounded-lg bg-gray-50">
                      <img 
                        src={pkg.qrCodeImage} 
                        alt="Payment QR Code"
                        className="w-24 h-24 mx-auto"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Scan to pay ₹{pkg.price}
                      </p>
                    </div>
                  )}

                  <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedPackage(pkg)}
                        disabled={userPackage?.packageId === pkg.id || !pkg.isActive}
                        data-testid={`btn-select-package-${pkg.id}`}
                      >
                        {userPackage?.packageId === pkg.id ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-2" />
                        )}
                        {userPackage?.packageId === pkg.id ? 'Current Package' : 'Select Package'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                        <DialogDescription>
                          Upload your payment screenshot and UTR number for {selectedPackage?.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {selectedPackage?.qrCodeImage && (
                          <div className="text-center p-4 border rounded-lg bg-gray-50">
                            <img 
                              src={selectedPackage.qrCodeImage} 
                              alt="Payment QR Code"
                              className="w-32 h-32 mx-auto"
                            />
                            <p className="text-sm font-semibold mt-2">
                              Amount: ₹{selectedPackage.price}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="screenshot">Payment Screenshot</Label>
                          <Input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            data-testid="input-payment-screenshot"
                          />
                          {screenshot && (
                            <p className="text-sm text-green-600">
                              ✓ {screenshot.name} selected
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="utr">UTR Number</Label>
                          <Input
                            id="utr"
                            placeholder="Enter UTR/Transaction ID"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            data-testid="input-utr-number"
                          />
                        </div>

                        <Button 
                          onClick={handlePaymentSubmit}
                          disabled={submitPaymentMutation.isPending || !screenshot || !utrNumber.trim()}
                          className="w-full"
                          data-testid="btn-submit-payment"
                        >
                          {submitPaymentMutation.isPending ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Payment Proof
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your package purchase submissions and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">Loading payment history...</div>
              ) : paymentSubmissions && paymentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {paymentSubmissions.map((submission) => (
                    <div 
                      key={submission.id} 
                      className="flex justify-between items-center p-4 border rounded-lg"
                      data-testid={`payment-submission-${submission.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">{submission.package?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          UTR: {submission.utrNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        <p className="text-sm font-semibold">₹{submission.package?.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment submissions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}