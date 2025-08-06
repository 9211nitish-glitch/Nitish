import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/ui/navigation";
import GradientText from "@/components/ui/gradient-text";
import FloatingParticles from "@/components/3d/floating-particles";

export default function CreatorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    platform: "",
    followerCount: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  const registerUser = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your account has been created successfully. Welcome to Stars Flock!",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      platform: formData.platform,
      followerCount: parseInt(formData.followerCount) || 0,
      bio: formData.bio,
    };

    registerUser.mutate(userData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 bg-stars">
        <FloatingParticles />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="registration-title">
                Join <GradientText>Stars Flock</GradientText> Today
              </h1>
              <p className="text-gray-400 text-lg">
                Start your creator journey and connect with top brands
              </p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm" data-testid="registration-form-card">
              <CardHeader>
                <CardTitle className="text-xl text-center">Create Your Creator Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="registration-form">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        type="text"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-blue-500"
                        required
                        data-testid="first-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        type="text"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-blue-500"
                        required
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <Input
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="bg-gray-700 border-gray-600 focus:border-blue-500"
                      required
                      data-testid="username-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-gray-700 border-gray-600 focus:border-blue-500"
                      required
                      data-testid="email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-gray-700 border-gray-600 focus:border-blue-500"
                      data-testid="phone-input"
                    />
                  </div>

                  {/* Creator Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Platform</label>
                      <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500" data-testid="platform-select">
                          <SelectValue placeholder="Select your main platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="multiple">Multiple Platforms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Follower Count</label>
                      <Input
                        type="number"
                        placeholder="Enter your follower count"
                        value={formData.followerCount}
                        onChange={(e) => handleInputChange("followerCount", e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-blue-500"
                        data-testid="follower-count-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea
                      placeholder="Tell us about yourself and your content style"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="bg-gray-700 border-gray-600 focus:border-blue-500"
                      rows={3}
                      data-testid="bio-input"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-blue-500"
                        required
                        data-testid="password-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="bg-gray-700 border-gray-600 focus:border-blue-500"
                        required
                        data-testid="confirm-password-input"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                    disabled={registerUser.isPending}
                    data-testid="register-button"
                  >
                    {registerUser.isPending ? "Creating Account..." : "Start My Creator Journey"}
                  </Button>

                  <p className="text-gray-400 text-sm text-center">
                    By registering, you agree to our{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
