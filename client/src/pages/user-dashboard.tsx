import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskFileUploader } from "@/components/TaskFileUploader";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [submissionFiles, setSubmissionFiles] = useState<{[key: string]: string[]}>({});
  const [submissionNotes, setSubmissionNotes] = useState<{[key: string]: string}>({});
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    paymentMethod: "",
    paymentDetails: "",
  });

  // Queries
  const { data: userTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/user/tasks'],
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/user/wallet'],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/user/wallet/transactions'],
  });

  const { data: withdrawalRequests, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/user/withdrawal-requests'],
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['/api/user/referrals'],
  });

  // Mutations
  const acceptTaskMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest('PUT', `/api/user/task-assignments/${assignmentId}/accept`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/tasks'] });
    },
  });

  const declineTaskMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest('PUT', `/api/user/task-assignments/${assignmentId}/decline`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/tasks'] });
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ assignmentId, files, notes }: { assignmentId: string; files: string[]; notes?: string }) => {
      const response = await apiRequest('PUT', `/api/user/task-assignments/${assignmentId}/submit`, { files, notes });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/tasks'] });
      setSubmissionFiles({});
      setSubmissionNotes({});
    },
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: typeof withdrawalForm) => {
      const response = await apiRequest('POST', '/api/user/withdrawal-requests', withdrawalData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/withdrawal-requests'] });
      setWithdrawalForm({ amount: "", paymentMethod: "", paymentDetails: "" });
    },
  });

  const handleTaskAction = async (assignmentId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      await acceptTaskMutation.mutateAsync(assignmentId);
    } else {
      await declineTaskMutation.mutateAsync(assignmentId);
    }
  };

  const handleSubmitTask = async (assignmentId: string) => {
    const files = submissionFiles[assignmentId] || [];
    const notes = submissionNotes[assignmentId] || "";
    
    if (files.length === 0) {
      alert("Please upload at least one file for submission");
      return;
    }

    await submitTaskMutation.mutateAsync({ assignmentId, files, notes });
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || parseFloat(withdrawalForm.amount) > parseFloat(wallet.balance)) {
      alert("Insufficient balance");
      return;
    }
    await createWithdrawalMutation.mutateAsync(withdrawalForm);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'submitted': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'declined': return 'secondary';
      default: return 'secondary';
    }
  };

  const getReferralCommission = (level: number) => {
    const rates = [10, 5, 4, 3, 2];
    return rates[level - 1] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.firstName}!</p>
              {user?.referralCode && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your referral code: <span className="font-mono font-bold">{user.referralCode}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {wallet && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Balance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-wallet-balance">
                    ₹{wallet.balance}
                  </p>
                </div>
              )}
              <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" data-testid="tab-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="wallet" data-testid="tab-wallet">Wallet</TabsTrigger>
            <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="referrals" data-testid="tab-referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>View and manage your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-tasks">Loading tasks...</div>
                ) : (
                  <div className="space-y-4">
                    {userTasks?.map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4" data-testid={`card-task-${assignment.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{assignment.task.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{assignment.task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Compensation: ₹{assignment.task.compensation}</span>
                              <span>Deadline: {format(new Date(assignment.task.submissionDeadline), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(assignment.status)}>
                            {assignment.status}
                          </Badge>
                        </div>

                        {assignment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleTaskAction(assignment.id, 'accept')}
                              disabled={acceptTaskMutation.isPending}
                              data-testid={`button-accept-${assignment.id}`}
                            >
                              Accept Task
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskAction(assignment.id, 'decline')}
                              disabled={declineTaskMutation.isPending}
                              data-testid={`button-decline-${assignment.id}`}
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {assignment.status === 'accepted' && (
                          <div className="space-y-4">
                            <div>
                              <Label>Upload Your Work (Up to 1GB per file)</Label>
                              <TaskFileUploader
                                maxNumberOfFiles={5}
                                onComplete={(files) => {
                                  setSubmissionFiles(prev => ({ ...prev, [assignment.id]: files }));
                                }}
                                buttonClassName="w-full mt-2"
                              >
                                Upload Files (Max 5 files, 1GB each)
                              </TaskFileUploader>
                              {submissionFiles[assignment.id]?.length > 0 && (
                                <p className="text-sm text-green-600 mt-2" data-testid={`text-uploaded-files-${assignment.id}`}>
                                  {submissionFiles[assignment.id].length} file(s) uploaded
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor={`notes-${assignment.id}`}>Submission Notes (Optional)</Label>
                              <Textarea
                                id={`notes-${assignment.id}`}
                                value={submissionNotes[assignment.id] || ""}
                                onChange={(e) => setSubmissionNotes(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                                placeholder="Add any notes about your submission..."
                                rows={3}
                                data-testid={`textarea-notes-${assignment.id}`}
                              />
                            </div>
                            
                            <Button
                              onClick={() => handleSubmitTask(assignment.id)}
                              disabled={submitTaskMutation.isPending || !submissionFiles[assignment.id]?.length}
                              data-testid={`button-submit-${assignment.id}`}
                            >
                              Submit Task
                            </Button>
                          </div>
                        )}

                        {assignment.status === 'rejected' && assignment.adminComments && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              <strong>Rejection Reason:</strong> {assignment.adminComments}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {walletLoading ? (
                    <div className="text-center py-4" data-testid="text-loading-wallet">Loading wallet...</div>
                  ) : wallet ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ₹{wallet.balance}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">Current Balance</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold" data-testid="text-total-earned">₹{wallet.totalEarned}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Earned</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold" data-testid="text-total-withdrawn">₹{wallet.totalWithdrawn}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Withdrawn</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Request Withdrawal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                        max={wallet?.balance || 0}
                        required
                        data-testid="input-withdrawal-amount"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select 
                        value={withdrawalForm.paymentMethod}
                        onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="paytm">Paytm</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentDetails">Payment Details</Label>
                      <Textarea
                        id="paymentDetails"
                        value={withdrawalForm.paymentDetails}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, paymentDetails: e.target.value }))}
                        placeholder="Enter account details, UPI ID, etc."
                        required
                        data-testid="textarea-payment-details"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createWithdrawalMutation.isPending || !wallet || parseFloat(withdrawalForm.amount) > parseFloat(wallet.balance)}
                      data-testid="button-request-withdrawal"
                    >
                      {createWithdrawalMutation.isPending ? "Processing..." : "Request Withdrawal"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-transactions">Loading transactions...</div>
                ) : (
                  <div className="space-y-2">
                    {transactions?.map((transaction: any) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2 border-b" data-testid={`transaction-${transaction.id}`}>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className={`font-semibold ${transaction.type === 'credit' || transaction.type === 'task_payment' || transaction.type === 'referral_bonus' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' || transaction.type === 'task_payment' || transaction.type === 'referral_bonus' ? '+' : '-'}₹{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Track your withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-withdrawals">Loading withdrawals...</div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests?.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4" data-testid={`card-withdrawal-${request.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">₹{request.amount}</h3>
                            <p className="text-sm text-gray-600">
                              Payment Method: {request.paymentMethod}
                            </p>
                            <p className="text-sm text-gray-600">
                              Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                            </p>
                            {request.adminNotes && (
                              <p className="text-sm text-gray-600 mt-2">
                                Admin Notes: {request.adminNotes}
                              </p>
                            )}
                          </div>
                          <Badge variant={request.status === 'processed' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referral System</CardTitle>
                <CardDescription>
                  Earn commission from referrals: Level 1 (10%), Level 2 (5%), Level 3 (4%), Level 4 (3%), Level 5 (2%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Your Referral Code</h3>
                  <div className="flex items-center gap-2">
                    <code className="bg-white dark:bg-gray-800 px-3 py-1 rounded font-mono text-lg" data-testid="text-referral-code">
                      {user?.referralCode}
                    </code>
                    <Button 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(user?.referralCode || "")}
                      data-testid="button-copy-referral"
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Share this code with friends to earn commission when they complete tasks!
                  </p>
                </div>

                {referralsLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-referrals">Loading referrals...</div>
                ) : (
                  <div className="space-y-4">
                    {referrals?.map((referral: any) => (
                      <div key={referral.id} className="border rounded-lg p-4" data-testid={`card-referral-${referral.id}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Level {referral.level} Referral</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Commission Rate: {getReferralCommission(referral.level)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              ₹{referral.totalEarned}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Total Earned</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!referrals || referrals.length === 0) && (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-300" data-testid="text-no-referrals">
                        No referrals yet. Share your referral code to start earning!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}