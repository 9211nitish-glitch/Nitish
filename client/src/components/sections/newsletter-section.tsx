import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GradientText from "@/components/ui/gradient-text";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeNewsletter = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been successfully subscribed to our newsletter.",
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe to newsletter",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeNewsletter.mutate(email);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-700" data-testid="newsletter-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="newsletter-title">
              Subscribe to Our Newsletter <GradientText>Don't Miss It.</GradientText>
            </h2>
            <p className="text-gray-400 mb-6">
              Get the latest creator tips, brand opportunities, and platform updates delivered to your inbox.
            </p>
          </div>
          
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4" data-testid="newsletter-form">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 focus:border-blue-500"
                required
                data-testid="newsletter-email-input"
              />
              <Button 
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold transition-all duration-300 transform hover:scale-105"
                disabled={subscribeNewsletter.isPending}
                data-testid="newsletter-subscribe-button"
              >
                {subscribeNewsletter.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
