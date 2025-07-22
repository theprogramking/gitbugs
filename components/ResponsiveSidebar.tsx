"use client"

import { useIssuesStore } from "../hooks/useIssuesStore"
import { Filter, Languages, Tag, SortAsc, X } from "lucide-react"

interface ResponsiveSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Ruby", "PHP", "C++", "C#"]
const POPULAR_LABELS = ["good first issue", "help wanted", "bug", "enhancement", "documentation", "feature request"]

export default function ResponsiveSidebar({ isOpen, onClose }: ResponsiveSidebarProps) {
  const { selectedLanguages, selectedLabels, sortBy, setSelectedLanguages, setSelectedLabels, setSortBy } =
    useIssuesStore()

  const handleCheckboxChange = (value: string, list: string[], setter: (newList: string[]) => void) => {
    const newList = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
    setter(newList)
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay lg:hidden" onClick={onClose} />}
      <aside
        className={`sidebar-mobile ${isOpen ? "sidebar-visible" : "sidebar-hidden"} 
        lg:flex-shrink-0 lg:relative lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
        lg:w-80 lg:bg-github-canvas-subtle`}
      >
        <div className="h-full overflow-y-auto sidebar-scroll p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h2>
            <button onClick={onClose} className="lg:hidden github-button-icon">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Options */}
          <div className="sidebar-section">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
              <SortAsc className="h-4 w-4" />
              Sort By
            </h3>
            <div className="space-y-2">
              {(["newest", "comments", "activity"] as const).map((sortOption) => (
                <label
                  key={sortOption}
                  className="flex items-center gap-3 cursor-pointer text-sm p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === sortOption}
                    onChange={() => setSortBy(sortOption)}
                    className="github-radio"
                  />
                  <span className="capitalize">{sortOption}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages Filter */}
          <div className="sidebar-section">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
              <Languages className="h-4 w-4" />
              Languages
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto sidebar-scroll pr-2">
              {POPULAR_LANGUAGES.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-3 cursor-pointer text-sm p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.toLowerCase())}
                    onChange={() => handleCheckboxChange(lang.toLowerCase(), selectedLanguages, setSelectedLanguages)}
                    className="github-checkbox"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Labels Filter */}
          <div className="sidebar-section">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              Labels
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto sidebar-scroll pr-2">
              {POPULAR_LABELS.map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-3 cursor-pointer text-sm p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(label)}
                    onChange={() => handleCheckboxChange(label, selectedLabels, setSelectedLabels)}
                    className="github-checkbox"
                  />
                  <span className="capitalize">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
