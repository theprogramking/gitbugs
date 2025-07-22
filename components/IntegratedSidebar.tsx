"use client"

import { useState } from "react"
import { useIssuesStore } from "../hooks/useIssuesStore"
import {
  Filter,
  Languages,
  Tag,
  SortAsc,
  X,
  TrendingUp,
  MessageCircle,
  Clock,
  Lightbulb,
  HelpCircle,
} from "lucide-react"
import ProTipsModal from "./ProTipsModal"

interface IntegratedSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Ruby", "PHP", "C++", "C#"]
const POPULAR_LABELS = ["good first issue", "help wanted", "bug", "enhancement", "documentation", "feature request"]

export default function IntegratedSidebar({ isOpen, onClose }: IntegratedSidebarProps) {
  const { selectedLanguages, selectedLabels, sortBy, setSelectedLanguages, setSelectedLabels, setSortBy } =
    useIssuesStore()

  const [showProTips, setShowProTips] = useState(false)

  const handleCheckboxChange = (value: string, list: string[], setter: (newList: string[]) => void) => {
    const newList = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
    setter(newList)
  }

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case "newest":
        return <Clock className="h-4 w-4" />
      case "comments":
        return <MessageCircle className="h-4 w-4" />
      case "activity":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <SortAsc className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay lg:hidden" onClick={onClose} />}

      {/* Integrated Sidebar */}
      <aside
        className={`sidebar-mobile ${isOpen ? "sidebar-visible" : "sidebar-hidden"} 
        lg:flex-shrink-0 lg:relative lg:translate-x-0 lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100vh-var(--header-height))]
        lg:w-80 integrated-sidebar`}
      >
        <div className="h-full overflow-y-auto sidebar-scroll p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: "var(--github-fg-default)" }}>
              <Filter className="h-5 w-5" style={{ color: "var(--github-accent-emphasis)" }} />
              Filters
            </h2>
            <button onClick={onClose} className="lg:hidden header-button">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Pro Tips Section */}
          <div className="pro-tips-section">
            <button
              onClick={() => setShowProTips(true)}
              className="pro-tips-button w-full"
              aria-label="Open Pro Tips modal"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-900" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm" style={{ color: "var(--github-fg-default)" }}>
                    Pro Tips
                  </div>
                  <div className="text-xs" style={{ color: "var(--github-fg-muted)" }}>
                    Get expert advice for finding issues
                  </div>
                </div>
                <HelpCircle className="h-4 w-4" style={{ color: "var(--github-fg-muted)" }} />
              </div>
            </button>
          </div>

          {/* Sort Options */}
          <div className="filter-section">
            <div className="filter-header">
              <SortAsc className="h-4 w-4" style={{ color: "var(--github-accent-emphasis)" }} />
              Sort Issues
            </div>
            <div className="space-y-1">
              {(["newest", "comments", "activity"] as const).map((sortOption) => (
                <label key={sortOption} className="filter-option">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === sortOption}
                    onChange={() => setSortBy(sortOption)}
                    className="github-radio"
                  />
                  <div className="flex items-center gap-2">
                    {getSortIcon(sortOption)}
                    <span className="capitalize">
                      {sortOption === "newest"
                        ? "Most Recent"
                        : sortOption === "comments"
                          ? "Most Discussed"
                          : "Most Active"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Languages Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <Languages className="h-4 w-4" style={{ color: "var(--github-accent-emphasis)" }} />
              Programming Languages
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto sidebar-scroll">
              {POPULAR_LANGUAGES.map((lang) => (
                <label key={lang} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.toLowerCase())}
                    onChange={() => handleCheckboxChange(lang.toLowerCase(), selectedLanguages, setSelectedLanguages)}
                    className="github-checkbox"
                  />
                  <span>{lang}</span>
                  {selectedLanguages.includes(lang.toLowerCase()) && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-github-accent-emphasis text-white">
                      Active
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Labels Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <Tag className="h-4 w-4" style={{ color: "var(--github-accent-emphasis)" }} />
              Issue Labels
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto sidebar-scroll">
              {POPULAR_LABELS.map((label) => (
                <label key={label} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(label)}
                    onChange={() => handleCheckboxChange(label, selectedLabels, setSelectedLabels)}
                    className="github-checkbox"
                  />
                  <span className="capitalize">{label}</span>
                  {selectedLabels.includes(label) && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-github-success-fg text-white">
                      Active
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedLanguages.length > 0 || selectedLabels.length > 0) && (
            <div className="filter-section">
              <div className="filter-header">Active Filters</div>
              <div className="space-y-2">
                {selectedLanguages.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-github-fg-muted">Languages:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="text-xs px-2 py-1 rounded-full bg-github-accent-emphasis text-white"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedLabels.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-github-fg-muted">Labels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLabels.map((label) => (
                        <span
                          key={label}
                          className="text-xs px-2 py-1 rounded-full bg-github-success-fg text-white capitalize"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Pro Tips Modal */}
      <ProTipsModal isOpen={showProTips} onClose={() => setShowProTips(false)} />
    </>
  )
}
