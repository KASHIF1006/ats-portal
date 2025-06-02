"use client"
import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const isCandidatePortal = pathname.includes("candidate-portal")
  const isLoginPage = pathname === "/login"
  // If we're on the candidate portal page, render without the sidebar
  if (isCandidatePortal) {
    return <>{children}</>
  }
  // If we're on the candidate portal or login page, render without the sidebar
  if (isCandidatePortal || isLoginPage) {
    return <>{children}</>
  }
  // If user is not authenticated, don't render the main layout
  if (!user) {
    return <>{children}</>
  }
   // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
