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
import type { InsertTask } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [newTask, setNewTask] = useState<InsertTask>({
    title: "",
    description: "",
    taskImage: "",
    compensation: "",
    timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxAssignees: 10,
    createdBy: "",
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [taskImageFiles, setTaskImageFiles] = useState<string[]>([]);

  // Queries
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/admin/tasks'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: taskAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/admin/task-assignments'],
  });

  const { data: withdrawalRequests, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/admin/withdrawal-requests'],
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask & { assignedUserIds?: string[] }) => {
      const response = await apiRequest('POST', '/api/admin/tasks', taskData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/task-assignments'] });
      setNewTask({
        title: "",
        description: "",
        taskImage: "",
        compensation: "",
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAssignees: 10,
        createdBy: "",
      });
      setSelectedUsers([]);
      setTaskImageFiles([]);
    },
  });

  const approveTaskMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest('PUT', `/api/admin/task-assignments/${assignmentId}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/task-assignments'] });
    },
  });

  const rejectTaskMutation = useMutation({
    mutationFn: async ({ assignmentId, comments }: { assignmentId: string; comments: string }) => {
      const response = await apiRequest('PUT', `/api/admin/task-assignments/${assignmentId}/reject`, { comments });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/task-assignments'] });
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ requestId, approved, notes }: { requestId: string; approved: boolean; notes?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/withdrawal-requests/${requestId}/process`, { approved, notes });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawal-requests'] });
    },
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || !newTask.compensation) return;

    await createTaskMutation.mutateAsync({
      ...newTask,
      taskImage: taskImageFiles[0] || null,
      assignedUserIds: selectedUsers,
    });
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
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.firstName}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Access Navigation */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campaign Analytics & Creator Matching
              </CardTitle>
              <CardDescription>Access advanced campaign tracking and AI-powered creator matching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 gap-2"
                  onClick={() => window.open('/live-performance', '_blank')}
                  data-testid="btn-live-performance"
                >
                  <Activity className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">Live Performance</div>
                    <div className="text-xs text-muted-foreground">Real-time campaign metrics</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 gap-2"
                  onClick={() => window.open('/campaign/campaign1/analytics', '_blank')}
                  data-testid="btn-campaign-analytics"
                >
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Campaign Analytics</div>
                    <div className="text-xs text-muted-foreground">Detailed performance analysis</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 gap-2"
                  onClick={() => window.open('/campaign/campaign1/matching', '_blank')}
                  data-testid="btn-creator-matching"
                >
                  <Target className="w-6 h-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">Creator Matching</div>
                    <div className="text-xs text-muted-foreground">AI-powered recommendations</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create-task" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create-task" data-testid="tab-create-task">Create Task</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
            <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="create-task">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>
                  Create tasks and assign them to users. Files can be up to 1GB each.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        required
                        data-testid="input-task-title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="compensation">Compensation (₹)</Label>
                      <Input
                        id="compensation"
                        type="number"
                        step="0.01"
                        value={newTask.compensation}
                        onChange={(e) => setNewTask(prev => ({ ...prev, compensation: e.target.value }))}
                        required
                        data-testid="input-compensation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxAssignees">Max Assignees</Label>
                      <Input
                        id="maxAssignees"
                        type="number"
                        value={newTask.maxAssignees}
                        onChange={(e) => setNewTask(prev => ({ ...prev, maxAssignees: parseInt(e.target.value) }))}
                        data-testid="input-max-assignees"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit</Label>
                      <Input
                        id="timeLimit"
                        type="datetime-local"
                        value={format(newTask.timeLimit, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setNewTask(prev => ({ ...prev, timeLimit: new Date(e.target.value) }))}
                        data-testid="input-time-limit"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Submission Deadline</Label>
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={format(newTask.submissionDeadline, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setNewTask(prev => ({ ...prev, submissionDeadline: new Date(e.target.value) }))}
                        data-testid="input-deadline"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Task Image/Video (Optional)</Label>
                    <TaskFileUploader
                      maxNumberOfFiles={1}
                      onComplete={setTaskImageFiles}
                      buttonClassName="w-full"
                    >
                      Upload Task Media (Up to 1GB)
                    </TaskFileUploader>
                    {taskImageFiles.length > 0 && (
                      <p className="text-sm text-green-600" data-testid="text-uploaded-files">
                        {taskImageFiles.length} file(s) uploaded
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Assign to Users (Optional)</Label>
                    <Select onValueChange={(value) => {
                      if (!selectedUsers.includes(value)) {
                        setSelectedUsers(prev => [...prev, value]);
                      }
                    }}>
                      <SelectTrigger data-testid="select-users">
                        <SelectValue placeholder="Select users to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUsers.map(userId => {
                          const user = users?.find((u: any) => u.id === userId);
                          return (
                            <Badge key={userId} variant="secondary">
                              {user?.firstName} {user?.lastName}
                              <button
                                onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                                className="ml-2 text-xs"
                                data-testid={`button-remove-user-${userId}`}
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                    className="w-full"
                    data-testid="button-create-task"
                  >
                    {createTaskMutation.isPending ? "Creating Task..." : "Create Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Manage and monitor all created tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-tasks">Loading tasks...</div>
                ) : (
                  <div className="space-y-4">
                    {tasks?.map((task: any) => (
                      <div key={task.id} className="border rounded-lg p-4" data-testid={`card-task-${task.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Compensation: ₹{task.compensation}</span>
                              <span>Max Assignees: {task.maxAssignees}</span>
                              <span>Current: {task.currentAssignees}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Task Submissions</CardTitle>
                <CardDescription>Review and approve user submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-submissions">Loading submissions...</div>
                ) : (
                  <div className="space-y-4">
                    {taskAssignments?.filter((assignment: any) => assignment.status === 'submitted').map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4" data-testid={`card-submission-${assignment.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{assignment.task.title}</h3>
                            <p className="text-sm text-gray-600">
                              Submitted by: {assignment.user.firstName} {assignment.user.lastName}
                            </p>
                            {assignment.submissionNotes && (
                              <p className="text-sm mt-2">Notes: {assignment.submissionNotes}</p>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => approveTaskMutation.mutate(assignment.id)}
                                disabled={approveTaskMutation.isPending}
                                data-testid={`button-approve-${assignment.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const comments = prompt("Enter rejection reason:");
                                  if (comments) {
                                    rejectTaskMutation.mutate({ assignmentId: assignment.id, comments });
                                  }
                                }}
                                disabled={rejectTaskMutation.isPending}
                                data-testid={`button-reject-${assignment.id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(assignment.status)}>
                            {assignment.status}
                          </Badge>
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
                <CardDescription>Manage user withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="text-center py-4" data-testid="text-loading-withdrawals">Loading withdrawal requests...</div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests?.filter((request: any) => request.status === 'pending').map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4" data-testid={`card-withdrawal-${request.id}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">₹{request.amount}</h3>
                            <p className="text-sm text-gray-600">
                              User ID: {request.userId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Payment Method: {request.paymentMethod}
                            </p>
                            <p className="text-sm text-gray-600">
                              Details: {request.paymentDetails}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => processWithdrawalMutation.mutate({ 
                                  requestId: request.id, 
                                  approved: true 
                                })}
                                disabled={processWithdrawalMutation.isPending}
                                data-testid={`button-approve-withdrawal-${request.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const notes = prompt("Enter rejection reason:");
                                  processWithdrawalMutation.mutate({ 
                                    requestId: request.id, 
                                    approved: false, 
                                    notes 
                                  });
                                }}
                                disabled={processWithdrawalMutation.isPending}
                                data-testid={`button-reject-withdrawal-${request.id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                          <Badge variant="secondary">{request.status}</Badge>
                        </div>
                      </div>
                    ))}
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