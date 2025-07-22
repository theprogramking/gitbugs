"use client"

import { memo, useCallback, useState, useMemo, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import dynamic from "next/dynamic"
import { useIssues, useIssuesStore } from "../hooks/useOptimizedIssuesStore"
import type { GitHubIssue } from "../lib/github-api-optimized"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"

// Lazy load components
const OptimizedIssueCard = dynamic(() => import("./OptimizedIssueCard"), {
  loading: () => <IssueCardSkeleton />,
})

const IssueModal = dynamic(() => import("./IssueModal"), {
  ssr: false,
})

// Optimized skeleton component
const IssueCardSkeleton = memo(() => (
  <div className="github-card h-64 p-4 animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
    <div className="flex-grow"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
  </div>
))

// Fixed load more trigger
const LoadMoreTrigger = memo(({ onLoadMore, hasMore }: { onLoadMore: () => void; hasMore: boolean }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (inView && hasMore) {
      const timeoutId = setTimeout(() => {
        onLoadMore()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [inView, hasMore, onLoadMore])

  return (
    <div ref={ref} className="flex justify-center py-8">
      {hasMore ? <LoadingSpinner /> : <p className="text-github-fg-muted text-sm">All issues loaded</p>}
    </div>
  )
})

function VirtualizedIssuesList() {
  const { issues, loading, error, cached } = useIssues()
  const { issuesToDisplay, loadMore } = useIssuesStore()
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleCardClick = useCallback((issue: GitHubIssue) => {
    setSelectedIssue(issue)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setSelectedIssue(null)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loading) {
      loadMore()
    }
  }, [loadMore, loading])

  // Optimized memoization
  const displayedIssues = useMemo(() => {
    return issues.slice(0, issuesToDisplay)
  }, [issues, issuesToDisplay])

  const hasMore = useMemo(() => issues.length > issuesToDisplay, [issues.length, issuesToDisplay])

  if (loading && issues.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <IssueCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (issues.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-github-fg-default mb-2">No issues found</h3>
          <p className="text-github-fg-muted">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {cached && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                800+ Loaded
              </span>
            )}
          </div>
          <div className="text-sm text-github-fg-muted">
            Showing {displayedIssues.length} of {issues.length}
          </div>
        </div>

        {/* Issues grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedIssues.map((issue) => (
            <OptimizedIssueCard key={issue.id} issue={issue} onCardClick={handleCardClick} />
          ))}
        </div>

        {/* Load more trigger */}
        {hasMore && <LoadMoreTrigger onLoadMore={handleLoadMore} hasMore={hasMore} />}
      </div>

      {/* Modal */}
      <IssueModal issue={selectedIssue} isOpen={modalOpen} onClose={handleCloseModal} />
    </>
  )
}

export default memo(VirtualizedIssuesList)
