"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  ExternalLink,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

const externalLinks = [
  {
    name: "Candidate Portal",
    href: "/candidate-portal",
    icon: Upload,
    external: true,
    description: "Public resume upload form",
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full",
        collapsed ? "w-16 " : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ATS</span>
            </div>
            <span className="font-semibold text-gray-900">Talent Hub</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-1.5">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}

        {/* Separator */}
        <div className="py-2">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* External Links */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">External Tools</p>
          )}
          {externalLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "text-gray-600 hover:text-gray-900 hover:bg-gray-50 group",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <div className="flex-1">
                    <span>{item.name}</span>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      {/* {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">HR Manager</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}