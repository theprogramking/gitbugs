"use client"

import { memo, useCallback, useState, useMemo } from "react"
import { useIssuesStore } from "../hooks/useOptimizedIssuesStore"
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
  Code,
} from "lucide-react"
import ProTipsModal from "./ProTipsModal"

interface OptimizedSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Memoized language data
const PROGRAMMING_LANGUAGES = [
  { name: "JavaScript", key: "javascript", popular: true },
  { name: "TypeScript", key: "typescript", popular: true },
  { name: "Python", key: "python", popular: true },
  { name: "Java", key: "java", popular: true },
  { name: "Go", key: "go", popular: true },
  { name: "Rust", key: "rust", popular: true },
  { name: "C++", key: "c++", popular: false },
  { name: "C#", key: "c#", popular: false },
  { name: "C", key: "c", popular: false },
  { name: "PHP", key: "php", popular: false },
  { name: "Ruby", key: "ruby", popular: false },
  { name: "Swift", key: "swift", popular: false },
  { name: "Kotlin", key: "kotlin", popular: false },
  { name: "Scala", key: "scala", popular: false },
  { name: "R", key: "r", popular: false },
  { name: "MATLAB", key: "matlab", popular: false },
  { name: "Dart", key: "dart", popular: false },
  { name: "Elixir", key: "elixir", popular: false },
  { name: "Haskell", key: "haskell", popular: false },
  { name: "Clojure", key: "clojure", popular: false },
  { name: "F#", key: "f#", popular: false },
  { name: "Erlang", key: "erlang", popular: false },
  { name: "Julia", key: "julia", popular: false },
  { name: "Lua", key: "lua", popular: false },
  { name: "Perl", key: "perl", popular: false },
  { name: "Shell", key: "shell", popular: false },
  { name: "PowerShell", key: "powershell", popular: false },
  { name: "Assembly", key: "assembly", popular: false },
  { name: "Objective-C", key: "objective-c", popular: false },
  { name: "Visual Basic", key: "visual basic", popular: false },
]

const MARKUP_AND_CONFIG_LANGUAGES = [
  { name: "HTML", key: "html", popular: false },
  { name: "CSS", key: "css", popular: false },
  { name: "SCSS", key: "scss", popular: false },
  { name: "Less", key: "less", popular: false },
  { name: "XML", key: "xml", popular: false },
  { name: "JSON", key: "json", popular: false },
  { name: "YAML", key: "yaml", popular: false },
  { name: "TOML", key: "toml", popular: false },
  { name: "Markdown", key: "markdown", popular: false },
  { name: "LaTeX", key: "tex", popular: false },
]

const POPULAR_LABELS = ["good first issue", "help wanted", "bug"]

// Memoized language groups
const POPULAR_LANGS = PROGRAMMING_LANGUAGES.filter((lang) => lang.popular)
const OTHER_LANGS = [...PROGRAMMING_LANGUAGES.filter((lang) => !lang.popular), ...MARKUP_AND_CONFIG_LANGUAGES]

function OptimizedSidebar({ isOpen, onClose }: OptimizedSidebarProps) {
  const { selectedLanguages, selectedLabels, sortBy, setSelectedLanguages, setSelectedLabels, setSortBy } =
    useIssuesStore()

  const [showProTips, setShowProTips] = useState(false)
  const selectedLanguage = selectedLanguages.length > 0 ? selectedLanguages[0] : ""

  // Simplified handlers without transitions
  const handleLanguageChange = useCallback(
    (languageKey: string) => {
      if (selectedLanguage === languageKey) {
        setSelectedLanguages([])
      } else {
        setSelectedLanguages([languageKey])
      }
    },
    [selectedLanguage, setSelectedLanguages],
  )

  const handleLabelChange = useCallback(
    (label: string) => {
      const newList = selectedLabels.includes(label)
        ? selectedLabels.filter((item) => item !== label)
        : [...selectedLabels, label]
      setSelectedLabels(newList)
    },
    [selectedLabels, setSelectedLabels],
  )

  const handleSortChange = useCallback(
    (newSortBy: typeof sortBy) => {
      setSortBy(newSortBy)
    },
    [setSortBy],
  )

  // Memoized sort icon
  const getSortIcon = useCallback((sortType: string) => {
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
  }, [])

  // Memoized sort options
  const sortOptions = useMemo(
    () => [
      { key: "newest" as const, label: "Most Recent", icon: getSortIcon("newest") },
      { key: "comments" as const, label: "Most Discussed", icon: getSortIcon("comments") },
      { key: "activity" as const, label: "Most Active", icon: getSortIcon("activity") },
    ],
    [getSortIcon],
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
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
              {sortOptions.map((option) => (
                <label key={option.key} className="filter-option">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === option.key}
                    onChange={() => handleSortChange(option.key)}
                    className="github-radio"
                  />
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Languages Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <Languages className="h-4 w-4" style={{ color: "var(--github-accent-emphasis)" }} />
              Programming Language
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto sidebar-scroll">
              {/* Popular Languages */}
              {POPULAR_LANGS.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-github-fg-muted mb-2 flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Popular
                  </div>
                  <div className="space-y-1">
                    {POPULAR_LANGS.map((lang) => (
                      <label key={lang.key} className="filter-option">
                        <input
                          type="radio"
                          name="language"
                          checked={selectedLanguage === lang.key}
                          onChange={() => handleLanguageChange(lang.key)}
                          className="github-radio"
                        />
                        <span className="flex-1">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Languages */}
              {OTHER_LANGS.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-github-fg-muted mb-2 flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    All Languages
                  </div>
                  <div className="space-y-1">
                    {OTHER_LANGS.map((lang) => (
                      <label key={lang.key} className="filter-option">
                        <input
                          type="radio"
                          name="language"
                          checked={selectedLanguage === lang.key}
                          onChange={() => handleLanguageChange(lang.key)}
                          className="github-radio"
                        />
                        <span className="flex-1">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Labels Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <Tag className="h-4 w-4" style={{ color: "var(--github-accent-emphasis)" }} />
              Issue Labels
            </div>
            <div className="space-y-1">
              {POPULAR_LABELS.map((label) => (
                <label key={label} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(label)}
                    onChange={() => handleLabelChange(label)}
                    className="github-checkbox"
                  />
                  <span className="capitalize flex-1">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Pro Tips Modal */}
      <ProTipsModal isOpen={showProTips} onClose={() => setShowProTips(false)} />
    </>
  )
}

export default memo(OptimizedSidebar)
