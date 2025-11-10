"use client";

import NextLink from "next/link";
import { ReactNode, memo, useCallback } from "react";
import { usePathname } from "next/navigation";

import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/app/auth-context";
import { Icon } from "@/components/icons";

// Map sidebar routes to icons
const leftNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    iconName: "dashboard",
  },
  {
    label: "News",
    href: "/admin/news",
    iconName: "news",
  },
  {
    label: "Images",
    href: "/admin/images",
    iconName: "images",
  },
  {
    label: "Videos",
    href: "/admin/videos",
    iconName: "videos",
  },
  {
    label: "Events",
    href: "/admin/events",
    iconName: "events",
  },
  {
    label: "Leaders",
    href: "/admin/leaders",
    iconName: "leaders",
  },
  {
    label: "Users",
    href: "/admin/users",
    iconName: "users",
  },
  {
    label: "Donations",
    href: "/admin/donations",
    iconName: "donations",
  },
  {
    label: "Queries",
    href: "/admin/queries",
    iconName: "queries",
  },
  {
    label: "Join Requests",
    href: "/admin/join-requests",
    iconName: "join-requests",
  },
];

const NavbarLayout = memo(function NavbarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { logout, isAuthenticated, isLoading } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleNavClick = useCallback((href: string) => {
    if (!isAuthenticated && href !== "/admin/login") {
      // Redirect to login if not authenticated and not already on login page
      window.location.href = "/admin/login";
      return;
    }
    // Allow navigation if authenticated or going to login page
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated and not on login page
  if (!isAuthenticated && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the admin panel.
            </p>
            <a
              href="/admin/login"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <aside className="fixed top-0 left-0 w-[clamp(200px,20%,256px)] max-w-[256px] min-w-[200px] bg-background dark:bg-default-50 flex flex-col h-screen">
        <div className="p-6">
          <h1 className="font-bold text-2xl text-foreground">Admin</h1>
        </div>

        <ul className="flex flex-col px-3">
          {leftNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="mb-1 px-2 py-1">
                <NextLink
                  className={`flex items-center gap-1.5 font-medium transition-all duration-200 whitespace-nowrap rounded-md px-2 py-1.5 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md border-l-4 border-blue-600"
                      : "text-foreground hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  href={item.href}
                >
                  <Icon className="w-4 h-4 scale-75" name={item.iconName} />
                  <span className="text-xs">{item.label}</span>
                </NextLink>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex-1 ml-[clamp(200px,20%,256px)] flex flex-col">
        {/* TOP NAVBAR */}
        <div className="fixed top-0 left-[clamp(200px,20%,256px)] right-0 h-15 bg-background dark:bg-default-100 border-b border-default-200 dark:border-default-300 flex items-center justify-between gap-4 px-6 z-10">
          <div>
            <h2 className="font-semibold text-foreground">Social Group Admin</h2>
          </div>
          <div className="flex items-center justify-center gap-2">
            {/* ThemeSwitch with hover circle */}
            <div className="relative group">
              <div className="p-2 flex items-center justify-center">
                <ThemeSwitch />
              </div>
              <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 transition-opacity group-hover:opacity-30 pointer-events-none" />
            </div>

            {/* Logout Button with hover circle */}
            <div className="relative group">
              <button
                className="px-4 py-2 rounded transition-colors"
                title="Logout"
                onClick={handleLogout}
              >
                <Icon className="w-4 h-4" name="logout" />
              </button>
              <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 transition-opacity group-hover:opacity-30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mt-20 overflow-auto px-6">{children}</main>
      </div>
    </div>
  );
});

NavbarLayout.displayName = "NavbarLayout";

export default NavbarLayout;
