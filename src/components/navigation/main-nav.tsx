"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  children?: NavigationItem[];
}

interface MainNavProps {
  className?: string;
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function MainNav({ className = "", onMenuToggle }: MainNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  
  const pathname = usePathname();
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const desktopNavRef = React.useRef<HTMLDivElement>(null);
  const dropdownRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  const navigationItems: NavigationItem[] = [
    { href: "/", label: "Home" },
    { href: "/find-workers", label: "Find Workers" },
    { 
      href: "/services", 
      label: "Services",
      children: [
        { href: "/services/web-development", label: "Web Development" },
        { href: "/services/mobile-apps", label: "Mobile Apps" },
        { href: "/services/design", label: "Design" },
        { href: "/services/marketing", label: "Marketing" }
      ]
    },
    { href: "/messages", label: "Messages" },
    { href: "/my-account", label: "My Account" },
    { href: "/faq", label: "FAQ" },
    { href: "/help", label: "Help" }
  ];

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    setFocusedIndex(-1);
    setActiveDropdown(null);
    onMenuToggle?.(newState);
  };

  // Handle keyboard navigation for desktop navigation
  const handleDesktopKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const navItems = desktopNavRef.current?.querySelectorAll('a[href], button[data-dropdown-trigger]');
    if (!navItems) return;

    const currentIndex = Array.from(navItems).findIndex(item => 
      item === document.activeElement
    );

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0;
        (navItems[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1;
        (navItems[prevIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const currentItem = navItems[currentIndex] as HTMLElement;
        const dropdownTrigger = currentItem?.getAttribute('data-dropdown-trigger');
        if (dropdownTrigger) {
          setActiveDropdown(dropdownTrigger);
          // Focus first dropdown item
          setTimeout(() => {
            const firstDropdownItem = dropdownRefs.current[dropdownTrigger]?.querySelector('a[href]') as HTMLElement;
            firstDropdownItem?.focus();
          }, 100);
        }
        break;
      case 'Home':
        e.preventDefault();
        (navItems[0] as HTMLElement)?.focus();
        break;
      case 'End':
        e.preventDefault();
        (navItems[navItems.length - 1] as HTMLElement)?.focus();
        break;
      case 'Escape':
        setActiveDropdown(null);
        break;
    }
  };

  // Handle keyboard navigation for mobile menu
  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menuItems = mobileMenuRef.current?.querySelectorAll('a[href], button[data-dropdown-trigger]');
    if (!menuItems) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev: number) => {
          const nextIndex = prev < menuItems.length - 1 ? prev + 1 : 0;
          (menuItems[nextIndex] as HTMLElement)?.focus();
          return nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev: number) => {
          const prevIndex = prev > 0 ? prev - 1 : menuItems.length - 1;
          (menuItems[prevIndex] as HTMLElement)?.focus();
          return prevIndex;
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        const currentItem = menuItems[focusedIndex] as HTMLElement;
        const dropdownTrigger = currentItem?.getAttribute('data-dropdown-trigger');
        if (dropdownTrigger) {
          setActiveDropdown(activeDropdown === dropdownTrigger ? null : dropdownTrigger);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        (menuItems[0] as HTMLElement)?.focus();
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(menuItems.length - 1);
        (menuItems[menuItems.length - 1] as HTMLElement)?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        mobileMenuButtonRef.current?.focus();
        break;
    }
  };

  // Handle dropdown keyboard navigation
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, dropdownKey: string) => {
    const dropdownItems = dropdownRefs.current[dropdownKey]?.querySelectorAll('a[href]');
    if (!dropdownItems) return;

    const currentIndex = Array.from(dropdownItems).findIndex(item => 
      item === document.activeElement
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < dropdownItems.length - 1 ? currentIndex + 1 : 0;
        (dropdownItems[nextIndex] as HTMLElement)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : dropdownItems.length - 1;
        (dropdownItems[prevIndex] as HTMLElement)?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setActiveDropdown(null);
        // Return focus to trigger
        const trigger = document.querySelector(`[data-dropdown-trigger="${dropdownKey}"]`) as HTMLElement;
        trigger?.focus();
        break;
      case 'Tab':
        // Allow normal tab behavior but close dropdown
        setActiveDropdown(null);
        break;
    }
  };

  // Handle mobile menu button keyboard events
  const handleMobileMenuButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMobileMenu();
    }
  };

  // Focus management when mobile menu opens/closes
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      // Focus first menu item when menu opens
      setTimeout(() => {
        const firstMenuItem = mobileMenuRef.current?.querySelector('a[href]') as HTMLElement;
        firstMenuItem?.focus();
        setFocusedIndex(0);
      }, 100);
    } else {
      setFocusedIndex(-1);
      setActiveDropdown(null);
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileMenuButtonRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdown = dropdownRefs.current[activeDropdown];
        const trigger = document.querySelector(`[data-dropdown-trigger="${activeDropdown}"]`);
        
        if (dropdown && !dropdown.contains(event.target as Node) && 
            trigger && !trigger.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const dropdownKey = `dropdown-${item.href}`;
    const isDropdownOpen = activeDropdown === dropdownKey;

    if (hasChildren) {
      return (
        <div key={item.href} className="relative">
          <button
            data-dropdown-trigger={dropdownKey}
            onClick={() => setActiveDropdown(isDropdownOpen ? null : dropdownKey)}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveDropdown(isDropdownOpen ? null : dropdownKey);
              }
            }}
            className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#15949C] focus:ring-offset-2 ${
              isItemActive 
                ? "text-[#002333] font-medium bg-[#15949C]/10" 
                : "text-[#002333] hover:text-[#15949C]"
            } ${isMobile ? "w-full text-left" : ""}`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {item.label}
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          
          {isDropdownOpen && (
            <div
              ref={(el: HTMLDivElement | null) => { dropdownRefs.current[dropdownKey] = el; }}
              className={`absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg ${
                isMobile ? 'relative mt-2 w-full' : ''
              }`}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleDropdownKeyDown(e, dropdownKey)}
              role="menu"
              aria-label={`${item.label} submenu`}
            >
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#15949C] focus:outline-none focus:ring-2 focus:ring-[#15949C] focus:ring-offset-1 rounded-sm"
                  role="menuitem"
                  onClick={() => {
                    setActiveDropdown(null);
                    if (isMobile) setIsMobileMenuOpen(false);
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#15949C] focus:ring-offset-2 ${
          isItemActive 
            ? "text-[#002333] font-medium bg-[#15949C]/10" 
            : "text-[#002333] hover:text-[#15949C]"
        } ${isMobile ? "w-full text-left" : ""}`}
        onClick={() => {
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        aria-current={isItemActive ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className={`${className}`} role="navigation" aria-label="Main navigation">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div
          ref={desktopNavRef}
          className="flex items-center space-x-6"
          onKeyDown={handleDesktopKeyDown}
        >
          {navigationItems.map((item) => renderNavigationItem(item, false))}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        ref={mobileMenuButtonRef}
        onClick={toggleMobileMenu}
        onKeyDown={handleMobileMenuButtonKeyDown}
        className="md:hidden p-2 rounded-md text-[#002333] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#15949C] focus:ring-offset-2"
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50"
          onKeyDown={handleMobileKeyDown}
          id="mobile-navigation"
        >
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => renderNavigationItem(item, true))}
          </div>
        </div>
      )}
    </nav>
  );
}