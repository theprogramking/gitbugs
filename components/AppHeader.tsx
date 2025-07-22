"use client"

import { useState } from "react"
import { useIssuesStore } from "../hooks/useIssuesStore"
import { useTheme } from "../hooks/useTheme"
import { Sun, Moon, Search, Menu, X, Filter } from "lucide-react"

interface AppHeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  isLoading: boolean
}

export default function AppHeader({ onToggleSidebar, sidebarOpen, isLoading }: AppHeaderProps) {
  const { searchTerm, setSearchTerm } = useIssuesStore()
  const { theme, toggleTheme, mounted } = useTheme()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

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
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--github-fg-muted)" }}
              />
              <input
                type="text"
                placeholder="Search issues, repositories, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="header-button md:hidden"
              aria-label="Toggle search"
            >
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
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--github-fg-muted)" }}
            />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
