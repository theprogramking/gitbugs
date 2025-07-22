"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { IssuesProvider } from "../hooks/useOptimizedIssuesStore"

// Lazy load all major components
const OptimizedHeader = dynamic(() => import("../components/OptimizedHeader"), {
  loading: () => <div className="h-16 bg-gray-200 dark:bg-gray-800" />,
})

const OptimizedSidebar = dynamic(() => import("../components/OptimizedSidebar"), {
  loading: () => <div className="w-80 bg-gray-100 dark:bg-gray-900 hidden lg:block" />,
})

const VirtualizedIssuesList = dynamic(() => import("../components/VirtualizedIssuesList"), {
  loading: () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <IssuesProvider>
      <HomeContent />
    </IssuesProvider>
  )
}

function HomeContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    // Minimal initialization
    const timer = setTimeout(() => {
      setInitialLoad(false)
    }, 300) // Reduced initialization time

    return () => clearTimeout(timer)
  }, [])

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-github-canvas-default">
        <div className="cascading-loader">
          <div className="cascading-dot"></div>
          <div className="cascading-dot"></div>
          <div className="cascading-dot"></div>
          <div className="cascading-dot"></div>
          <div className="cascading-dot"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--github-canvas-default)",
      }}
    >
      <OptimizedHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isLoading={false}
      />

      <div className="flex">
        <OptimizedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1">
          <VirtualizedIssuesList />
        </main>
      </div>
    </div>
  )
}
