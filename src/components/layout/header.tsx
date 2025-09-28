"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/oh-logo.png"
              alt="Offer Hub Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-[#002333] font-bold text-lg sm:text-xl">OFFER HUB</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-[#002333] font-medium bg-[#15949C]/10 px-4 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/find-workers"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              Find workers
            </Link>
            <Link
              href="/messages"
              className="text-gray-700 hover:text-gray-900"
            >
              My Chats
            </Link>
            <Link
              href="/my-account"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              My Account
            </Link>
            <Link
              href="/faq"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/help"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              Help
            </Link>
            <Link
              href="/financial-dashboard-demo"
              className="text-[#002333] hover:text-[#15949C] transition-colors px-3 py-1 rounded-md "
            >
             Financial Dashboard
            </Link>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Connect Wallet Button - Hidden on very small screens */}
          <Link
            href="/wallet"
            className="hidden sm:flex bg-[#15949C] hover:bg-[#15949C]/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-colors duration-200 items-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base ml-2 md:ml-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="hidden sm:inline">Connect Wallet</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-[#002333] hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-[#002333] font-medium bg-[#15949C]/10 px-4 py-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/find-workers"
                className="text-[#002333] hover:text-[#15949C] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find workers
              </Link>
              <Link 
                href="/messages" 
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Chats
              </Link>
              <Link
                href="/my-account"
                className="text-[#002333] hover:text-[#15949C] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Account
              </Link>
              <Link
                href="/faq"
                className="text-[#002333] hover:text-[#15949C] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/help"
                className="text-[#002333] hover:text-[#15949C] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help
              </Link>
              {/* Mobile Connect Wallet Button */}
              <Link 
                href="/wallet"
                className="bg-[#15949C] hover:bg-[#15949C]/90 text-white font-medium px-4 py-2.5 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                  />
                </svg>
                Connect Wallet
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
