"use client"

import { useMemo, useRef, useEffect, useCallback } from "react" // Added useRef, useEffect, useCallback
import { useIssuesStore } from "../hooks/useIssuesStore"
import ResponsiveIssueCard from "./ResponsiveIssueCard"
// import Pagination from "./Pagination" // Removed Pagination import
import { FileX, Loader2 } from "lucide-react"

export default function ResponsiveIssuesList() {
  const { filteredIssues, loading, issuesToDisplay, incrementIssuesToDisplay } = useIssuesStore() // Updated state
  const loaderRef = useRef<HTMLDivElement>(null) // Ref for the infinite scroll loader

  const currentDisplayedIssues = useMemo(() => {
    return filteredIssues.slice(0, issuesToDisplay) // Slice based on issuesToDisplay
  }, [filteredIssues, issuesToDisplay])

  const hasMore = issuesToDisplay < filteredIssues.length // Check if there are more issues to load

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !loading) {
        incrementIssuesToDisplay()
      }
    },
    [hasMore, loading, incrementIssuesToDisplay],
  )

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "200px", // Load more when 200px from bottom
      threshold: 0,
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [handleObserver])

  if (loading && filteredIssues.length === 0) {
    return (
      <div className="flex-1 container-mobile container-tablet container-desktop py-4 sm:py-6 lg:ml-[var(--sidebar-desktop-width)] transition-all duration-300">
        {" "}
        {/* Added lg:ml-[var(--sidebar-desktop-width)] */}
        <div className="grid grid-mobile grid-tablet grid-desktop gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="github-card issue-card-mobile issue-card-tablet issue-card-desktop animate-pulse"
            >
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
              </div>
              <div className="h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2 sm:mb-3"></div>
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
              <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4">
                <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-12 sm:w-16"></div>
                <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-16 sm:w-20"></div>
              </div>
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 sm:w-16"></div>
                </div>
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 sm:w-20"></div>
              </div>
              <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (filteredIssues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:ml-[var(--sidebar-desktop-width)] transition-all duration-300">
        {" "}
        {/* Added lg:ml-[var(--sidebar-desktop-width)] */}
        <div className="text-center">
          <FileX className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" style={{ color: "var(--github-fg-muted)" }} />
          <div className="text-lg sm:text-xl mb-2" style={{ color: "var(--github-fg-muted)" }}>
            No issues found
          </div>
          <div className="text-sm" style={{ color: "var(--github-fg-subtle)" }}>
            Try adjusting your search or filters
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 container-mobile container-tablet container-desktop py-4 sm:py-6 lg:ml-[var(--sidebar-desktop-width)] transition-all duration-300">
      {" "}
      {/* Added lg:ml-[var(--sidebar-desktop-width)] */}
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
        <div className="text-sm sm:text-base" style={{ color: "var(--github-fg-muted)" }}>
          Showing {Math.min(issuesToDisplay, filteredIssues.length)} of {filteredIssues.length} issues
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--github-fg-muted)" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
      {/* Issues Grid - Responsive */}
      <div className="grid grid-mobile grid-tablet grid-desktop gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {currentDisplayedIssues.map((issue) => (
          <ResponsiveIssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--github-accent-emphasis)" }} />
        </div>
      )}
    </div>
  )
}
