"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCandidatePortal = pathname.includes("candidate-portal")

  // If we're on the candidate portal page, render without the sidebar
  if (isCandidatePortal) {
    return <>{children}</>
  }

  // Otherwise, render with the sidebar
  return (
    <div className="flex bg-gray-50 fixed inset-0">
      <div className="flex-none w-auto h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}