"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { IssuesProvider, useIssuesStore } from "../hooks/useIssuesStore"
import MobileHeader from "../components/MobileHeader"
import ResponsiveSidebar from "../components/ResponsiveSidebar"
import ResponsiveIssuesList from "../components/ResponsiveIssuesList"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"

// Make this a regular client component and fetch data on mount
export default function Home() {
  return (
    <IssuesProvider>
      <HomeContent />
    </IssuesProvider>
  )
}

// Client Component that fetches data on mount
function HomeContent() {
  const { issues, loading, error, fetchIssues } = useIssuesStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // Fetch issues on component mount
  useEffect(() => {
    if (initialLoad) {
      fetchIssues().finally(() => setInitialLoad(false))
    }
  }, [fetchIssues, initialLoad])

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen((prev) => !prev)
  }

  // Show loading spinner during initial load
  if (initialLoad && loading) {
    return (
      <div className="min-h-screen main-scroll" style={{ backgroundColor: "var(--github-canvas-default)" }}>
        <MobileHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          desktopSidebarOpen={desktopSidebarOpen}
          onToggleDesktopSidebar={toggleDesktopSidebar}
        />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen main-scroll"
      style={
        {
          backgroundColor: "var(--github-canvas-default)",
          "--sidebar-desktop-width": desktopSidebarOpen ? "20rem" : "0rem",
        } as React.CSSProperties
      }
    >
      <MobileHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        desktopSidebarOpen={desktopSidebarOpen}
        onToggleDesktopSidebar={toggleDesktopSidebar}
      />

      {error && (
        <div className="container-mobile container-tablet container-desktop py-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="flex">
        <ResponsiveSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          desktopSidebarOpen={desktopSidebarOpen}
        />
        <ResponsiveIssuesList />
      </div>
    </div>
  )
}
