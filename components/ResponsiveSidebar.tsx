"use client"

import { useMemo } from "react"
import { useIssuesStore } from "../hooks/useIssuesStore"
import { SortAsc, SortDesc, X } from "lucide-react" // Removed Bug, Sparkles, Circle

interface ResponsiveSidebarProps {
  isOpen: boolean
  onClose: () => void
  desktopSidebarOpen: boolean // New prop
}

export default function ResponsiveSidebar({ isOpen, onClose, desktopSidebarOpen }: ResponsiveSidebarProps) {
  const {
    issues,
    // Removed issueTypeFilter,
    selectedLabels,
    selectedRepositories,
    sortBy,
    sortOrder,
    // Removed setIssueTypeFilter,
    setSelectedLabels,
    setSelectedRepositories,
    setSortBy,
    setSortOrder,
  } = useIssuesStore()

  const availableLabels = useMemo(() => {
    const labelMap = new Map<string, { name: string; color: string; count: number }>()
    issues.forEach((issue) => {
      issue.labels.forEach((label) => {
        const existing = labelMap.get(label.name)
        if (existing) {
          existing.count++
        } else {
          labelMap.set(label.name, { name: label.name, color: label.color, count: 1 })
        }
      })
    })
    return Array.from(labelMap.values()).sort((a, b) => b.count - a.count)
  }, [issues])

  const availableRepositories = useMemo(() => {
    const repoMap = new Map<string, number>()
    issues.forEach((issue) => {
      const count = repoMap.get(issue.repositoryName) || 0
      repoMap.set(issue.repositoryName, count + 1)
    })
    return Array.from(repoMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [issues])

  // Removed issueTypeCounts memo

  const getLabelStyle = (color: string) => {
    const hexColor = `#${color}`
    const r = Number.parseInt(color.substr(0, 2), 16)
    const g = Number.parseInt(color.substr(2, 2), 16)
    const b = Number.parseInt(color.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const textColor = brightness > 128 ? "#000000" : "#ffffff"

    return {
      backgroundColor: hexColor,
      color: textColor,
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`sidebar-mobile ${isOpen ? "sidebar-visible" : "sidebar-hidden"} 
      lg:flex-shrink-0 lg:fixed lg:h-[calc(100vh-64px)] lg:top-[64px] lg:left-0 lg:z-40 lg:bg-github-canvas-default 
      transition-all duration-300 ${desktopSidebarOpen ? "lg:w-80" : "lg:w-0 lg:overflow-hidden"}`}
      >
        <div className="h-full overflow-y-auto sidebar-scroll p-4 space-y-4">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--github-fg-default)" }}>
              Filters
            </h2>
            <button onClick={onClose} className="github-button-icon">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Removed Issue Type Filter */}
          {/*
        <div className="sidebar-section">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Filter className="h-4 w-4" />
            Issue Type
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
              <input
                type="radio"
                name="issueType"
                checked={issueTypeFilter === "all"}
                onChange={() => setIssueTypeFilter("all")}
                className="github-radio"
              />
              <span>All Issues ({issues.length})</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
              <input
                type="radio"
                name="issueType"
                checked={issueTypeFilter === "bug"}
                onChange={() => setIssueTypeFilter("bug")}
                className="github-radio"
              />
              <Bug className="h-4 w-4 text-red-600" />
              <span>Bugs ({issueTypeCounts.bug})</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
              <input
                type="radio"
                name="issueType"
                checked={issueTypeFilter === "feature"}
                onChange={() => setIssueTypeFilter("feature")}
                className="github-radio"
              />
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Features ({issueTypeCounts.feature})</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
              <input
                type="radio"
                name="issueType"
                checked={issueTypeFilter === "other"}
                onChange={() => setIssueTypeFilter("other")}
                className="github-radio"
              />
              <Circle className="h-4 w-4 text-gray-600" />
              <span>Other ({issueTypeCounts.other})</span>
            </label>
          </div>
        </div>
        */}

          {/* Sort Options */}
          <div className="sidebar-section">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Sort By
            </h3>
            <div className="space-y-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="github-select w-full"
              >
                <option value="created">Date Created</option>
                <option value="updated">Date Updated</option>
                <option value="comments">Most Commented</option>
                <option value="title">Title</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder("desc")}
                  className={`github-button flex-1 ${sortOrder === "desc" ? "github-button-primary" : ""}`}
                >
                  Descending
                </button>
                <button
                  onClick={() => setSortOrder("asc")}
                  className={`github-button flex-1 ${sortOrder === "asc" ? "github-button-primary" : ""}`}
                >
                  Ascending
                </button>
              </div>
            </div>
          </div>

          {/* Labels Filter */}
          <div className="sidebar-section">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Labels</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto sidebar-scroll">
              {availableLabels.slice(0, 20).map((label) => (
                <label
                  key={label.name}
                  className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(label.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLabels([...selectedLabels, label.name])
                      } else {
                        setSelectedLabels(selectedLabels.filter((l) => l !== label.name))
                      }
                    }}
                    className="github-checkbox"
                  />
                  <span className="label-badge label-mobile label-tablet" style={getLabelStyle(label.color)}>
                    {label.name}
                  </span>
                  <span style={{ color: "var(--github-fg-muted)" }}>({label.count})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
