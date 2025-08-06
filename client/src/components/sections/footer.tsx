import { Star, MapPin, Phone, Mail, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GradientText from "@/components/ui/gradient-text";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Footer() {
  const [footerEmail, setFooterEmail] = useState("");
  const { toast } = useToast();

  const footerNewsletterSubscription = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setFooterEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe",
        variant: "destructive",
      });
    },
  });

  const handleFooterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerEmail) {
      footerNewsletterSubscription.mutate(footerEmail);
    }
  };

  const companyLinks = [
    { href: "#", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#blog", label: "Blog" },
    { href: "#contact", label: "Contact" },
    { href: "#packages", label: "Packages" },
  ];

  const knowledgeBaseLinks = [
    { href: "#", label: "Security & Trust Policy" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms & Conditions" },
    { href: "#", label: "Refund Policy" },
    { href: "#", label: "Support Center" },
  ];

  return (
    <footer className="bg-gray-900 py-16 border-t border-gray-800" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="text-white text-xl" />
              </div>
              <GradientText className="text-xl font-bold">Stars Flock</GradientText>
            </div>
            <p className="text-gray-400 mb-6">Every creator finds opportunity, and every brand finds the perfect voice</p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-400" data-testid="footer-address">
                <MapPin className="w-5 mr-3 flex-shrink-0" />
                <span className="text-sm">H-81, 2nd Floor, Sector-63, Noida, U.P., India-201301</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-5 mr-3" />
                <a href="tel:+918745818818" className="text-sm hover:text-blue-400" data-testid="footer-phone">
                  +91-8745-818-818
                </a>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="w-5 mr-3" />
                <a href="mailto:contact@starsflock.com" className="text-sm hover:text-blue-400" data-testid="footer-email">
                  contact@starsflock.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    data-testid={`footer-company-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Knowledge Base */}
          <div>
            <h4 className="text-lg font-bold mb-6">Knowledge Base</h4>
            <ul className="space-y-3">
              {knowledgeBaseLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    data-testid={`footer-knowledge-${link.label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6">Stay Updated</h4>
            <p className="text-gray-400 mb-4">Get creator tips and brand opportunities in your inbox.</p>
            <form onSubmit={handleFooterSubmit} className="space-y-3" data-testid="footer-newsletter-form">
              <Input
                type="email"
                placeholder="Your email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 focus:border-blue-500 text-sm"
                data-testid="footer-newsletter-input"
              />
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-semibold transition-all duration-300"
                disabled={footerNewsletterSubscription.isPending}
                data-testid="footer-newsletter-submit"
              >
                {footerNewsletterSubscription.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors"
                data-testid="footer-social-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                data-testid="footer-social-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
                data-testid="footer-social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                data-testid="footer-social-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm" data-testid="footer-copyright">
              © Copyright 2025 by Stars Flock. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-privacy">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-terms">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-cookies">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
