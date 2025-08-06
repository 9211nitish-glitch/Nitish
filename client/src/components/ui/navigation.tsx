import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientText from "@/components/ui/gradient-text";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#creators", label: "For Creators" },
    { href: "#brands", label: "For Brands" },
    { href: "#blog", label: "Blog" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800" data-testid="navigation">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Star className="text-white text-xl" />
            </div>
            <GradientText className="text-xl font-bold">Stars Flock</GradientText>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="hover:text-blue-400 transition-colors"
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="hidden md:block border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              data-testid="sign-in-button"
            >
              Sign In
            </Button>
            <Link href="/register">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                data-testid="get-started-button"
              >
                Get Started
              </Button>
            </Link>
            <button 
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left hover:text-blue-400 transition-colors"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-700">
                <Button 
                  variant="outline" 
                  className="w-full mb-2 border-blue-500 text-blue-400"
                  data-testid="mobile-sign-in-button"
                >
                  Sign In
                </Button>
                <Link href="/register" className="block">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                    data-testid="mobile-get-started-button"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
