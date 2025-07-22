"use client"
import { useIssuesStore } from "../hooks/useIssuesStore"
import { useTheme } from "../hooks/useTheme"
import { Sun, Moon, RefreshCw, Search, Menu, X, Filter } from "lucide-react"

interface MobileHeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export default function MobileHeader({ onToggleSidebar, sidebarOpen }: MobileHeaderProps) {
  const { loading, error, searchTerm, setSearchTerm } = useIssuesStore()
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{
        backgroundColor: "var(--github-canvas-default)",
        borderColor: "var(--github-border-default)",
      }}
    >
      {/* Main Header */}
      <div className="container-mobile container-tablet container-desktop py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="github-button-icon border border-github-border-default"
              aria-label="Toggle filters menu"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--github-fg-muted)" }}
              />
              <input
                type="text"
                placeholder="Search issues, users, or repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="github-input w-full pl-10 pr-4"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden github-button-icon border border-github-border-default"
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="github-button-icon border border-github-border-default"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}

            {/* Retry Button */}
            {error && (
              <button onClick={() => {}} disabled={loading} className="github-button github-button-sm hidden sm:flex">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Retrying..." : "Retry"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
