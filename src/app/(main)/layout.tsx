"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { state } = useSidebar();

  return (
    <main className={`flex h-screen ${state == "expanded" && "bg-sidebar"} `}>
      <AppSidebar />

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-row items-center mb-2">
          {state == "collapsed" && <SidebarTrigger />}
        </div>

        {state == "expanded" ? (
          // Content with rounded corners when sidebar is open
          <div className="flex-1 bg-background rounded-2xl p-6 overflow-hidden">
            {children}
          </div>
        ) : (
          // Fullscreen content when sidebar is closed
          <div className="flex-1 w-full h-full">{children}</div>
        )}
      </div>
    </main>
  );
}
