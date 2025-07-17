"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { IssuesProvider, useIssuesStore } from "../hooks/useIssuesStore"
import MobileHeader from "../components/MobileHeader"
import ResponsiveSidebar from "../components/ResponsiveSidebar"
import ResponsiveIssuesList from "../components/ResponsiveIssuesList"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { fetchGitHubIssues } from "../lib/github-api" // Import the server-side fetch function

// This component will be a Server Component to fetch initial data
export default async function Home() {
  const { issues: initialIssues, error: initialError } = await fetchGitHubIssues()

  return (
    <IssuesProvider>
      <HomeContent initialIssues={initialIssues} initialError={initialError} />
    </IssuesProvider>
  )
}

// This is a Client Component that consumes the initial data
function HomeContent({
  initialIssues,
  initialError,
}: {
  initialIssues: any[]
  initialError: string | null
}) {
  const { issues, loading, error, initializeIssues, fetchIssues } = useIssuesStore()
  const [sidebarOpen, setSidebarOpen] = useState(false) // For mobile sidebar
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true) // For desktop sidebar, open by default

  // Initialize the store with server-fetched data only once
  useEffect(() => {
    initializeIssues(initialIssues, initialError)
  }, [initialIssues, initialError, initializeIssues])

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

  // Display loading spinner only if no issues are loaded yet and still loading
  if (loading && issues.length === 0) {
    return (
      <div className="min-h-screen main-scroll" style={{ backgroundColor: "var(--github-canvas-default)" }}>
        <MobileHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
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
          "--sidebar-desktop-width": desktopSidebarOpen ? "20rem" : "0rem", // 80 (w-80) = 20rem
        } as React.CSSProperties
      }
    >
      <MobileHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        desktopSidebarOpen={desktopSidebarOpen}
        onToggleDesktopSidebar={toggleDesktopSidebar}
      />

      {(error || initialError) && (
        <div className="container-mobile container-tablet container-desktop py-4">
          <ErrorMessage message={error || initialError || "An unknown error occurred."} />
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
