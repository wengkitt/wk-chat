"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import { ModeToggle } from "@/components/custom/mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import React from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { state } = useSidebar();

  return (
    <main
      className={`flex h-screen w-full ${
        state == "expanded" && "bg-background"
      } `}
    >
      <AppSidebar />
      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-row items-center mb-2">
          {state == "collapsed" && <SidebarTrigger />}
          <div className="flex-1 flex items-center justify-end">
            <ModeToggle />
          </div>
        </div>

        <div
          className={`flex-1 w-full h-full bg-sidebar rounded-2xl p-2 overflow-hidden`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
