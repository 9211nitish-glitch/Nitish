import { Star, MapPin, Phone, Mail, Instagram, Youtube, Twitter, Linkedin, ExternalLink } from "lucide-react";
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
    { href: "/blog", label: "Blog" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "#contact", label: "Contact" },
  ];

  const knowledgeBaseLinks = [
    { href: "#", label: "Security & Trust Policy" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms & Conditions" },
    { href: "#", label: "Refund Policy" },
    { href: "#", label: "Creator Guidelines" },
    { href: "#", label: "Support Center" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-400" },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-400" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
  ];

  return (
    <footer className="bg-gray-900 py-16 border-t border-gray-800 relative overflow-hidden" data-testid="footer">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="text-white text-xl" />
              </div>
              <GradientText className="text-xl font-bold">Stars Flock</GradientText>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Every creator finds opportunity, and every brand finds the perfect voice. Join India's fastest-growing creator economy platform.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start text-gray-400 group hover:text-blue-400 transition-colors" data-testid="footer-address">
                <MapPin className="w-5 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  H-81, 2nd Floor, Sector-63<br />
                  Noida, U.P., India-201301
                </span>
              </div>
              <div className="flex items-center text-gray-400 group hover:text-blue-400 transition-colors">
                <Phone className="w-5 mr-3" />
                <a href="tel:+918745818818" className="text-sm" data-testid="footer-phone">
                  +91-8745-818-818
                </a>
              </div>
              <div className="flex items-center text-gray-400 group hover:text-blue-400 transition-colors">
                <Mail className="w-5 mr-3" />
                <a href="mailto:contact@starsflock.com" className="text-sm" data-testid="footer-email">
                  contact@starsflock.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                    data-testid={`footer-company-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Knowledge Base */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Knowledge Base</h4>
            <ul className="space-y-3">
              {knowledgeBaseLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                    data-testid={`footer-knowledge-${link.label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter & Social */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Stay Connected</h4>
            <p className="text-gray-400 mb-4">
              Get creator tips, brand opportunities, and platform updates delivered to your inbox.
            </p>
            
            <form onSubmit={handleFooterSubmit} className="space-y-3 mb-6" data-testid="footer-newsletter-form">
              <Input
                type="email"
                placeholder="Your email address"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 focus:border-blue-500 text-sm"
                data-testid="footer-newsletter-input"
              />
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                disabled={footerNewsletterSubscription.isPending}
                data-testid="footer-newsletter-submit"
              >
                {footerNewsletterSubscription.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            
            {/* Social Links */}
            <div className="space-y-4">
              <h5 className="font-semibold text-white">Follow Us</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.label}
                    href={social.href} 
                    className={`w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${social.color}`}
                    data-testid={`footer-social-${social.label.toLowerCase()}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0" data-testid="footer-copyright">
              © Copyright 2025 by <GradientText>Stars Flock</GradientText>. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-privacy">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-terms">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-cookies">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors" data-testid="footer-sitemap">
                Sitemap
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
