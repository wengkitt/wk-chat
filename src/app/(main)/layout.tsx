"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
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
      className={`flex h-screen w-full ${state == "expanded" && "bg-sidebar"} `}
    >
      <AppSidebar />

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-row items-center mb-2">
          {state == "collapsed" && <SidebarTrigger />}
        </div>

        <div
          className={`flex-1 w-full h-full ${
            state == "expanded" && "bg-background rounded-2xl p-6"
          } overflow-hidden`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
