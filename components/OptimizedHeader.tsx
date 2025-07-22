"use client"

import type React from "react"
import { memo, useState, useCallback, useRef, useEffect } from "react"
import { useIssuesStore } from "../hooks/useOptimizedIssuesStore"
import { useTheme } from "../hooks/useTheme"
import { Sun, Moon, Search, Menu, X, Filter } from "lucide-react"

interface OptimizedHeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  isLoading: boolean
}

// Fixed debounced search input
function DebouncedSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className: string
}) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isInitialMount = useRef(true)

  // Only sync on initial mount or when external value changes significantly
  useEffect(() => {
    if (isInitialMount.current) {
      setLocalValue(value)
      isInitialMount.current = false
    }
  }, [value])

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue)
      }, 200)
    },
    [onChange],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      debouncedOnChange(newValue)
    },
    [debouncedOnChange],
  )

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      className={className}
      autoComplete="off"
      spellCheck="false"
    />
  )
}

function OptimizedHeader({ onToggleSidebar, sidebarOpen, isLoading }: OptimizedHeaderProps) {
  const { searchTerm, setSearchTerm } = useIssuesStore()
  const { theme, toggleTheme, mounted } = useTheme()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSearchToggle = useCallback(() => {
    setMobileSearchOpen((prev) => !prev)
  }, [])

  const handleSetSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term)
    },
    [setSearchTerm],
  )

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-sm transition-all duration-300 h-[var(--header-height)] ${
        isLoading ? "header-loading" : "header-visible"
      }`}
      style={{
        backgroundColor: "var(--github-canvas-default)",
        borderColor: "var(--github-border-default)",
      }}
    >
      {/* Main Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo and Menu */}
          <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="header-button lg:hidden" aria-label="Toggle sidebar">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="bitbug-logo">🐛</div>
          </div>

          {/* Center Section: Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "var(--github-fg-muted)" }}
              />
              <DebouncedSearchInput
                value={searchTerm}
                onChange={handleSetSearchTerm}
                placeholder="Search issues, repositories, or technologies..."
                className="search-input"
              />
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button onClick={handleSearchToggle} className="header-button md:hidden" aria-label="Toggle search">
              <Search className="h-4 w-4" />
            </button>

            {/* Mobile Filter Button */}
            <button onClick={onToggleSidebar} className="header-button md:hidden" aria-label="Toggle filters">
              <Filter className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="header-button"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="mobile-search md:hidden">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "var(--github-fg-muted)" }}
            />
            <DebouncedSearchInput
              value={searchTerm}
              onChange={handleSetSearchTerm}
              placeholder="Search issues..."
              className="search-input"
            />
          </div>
        </div>
      )}
    </header>
  )
}

export default memo(OptimizedHeader)
