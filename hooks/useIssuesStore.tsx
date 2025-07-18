"use client"

import { create } from "zustand"
import { createContext, useContext, type ReactNode } from "react"

export interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubLabel {
  name: string
  color: string
  description?: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string
  description: string
  labels: GitHubLabel[]
  user: GitHubUser
  repositoryName: string
  repositoryUrl: string
  issueLink: string
  createdDate: string
  updatedDate: string
  comments: number
  state: string
  issueType: "bug" | "feature" | "other"
}

interface IssuesState {
  issues: GitHubIssue[]
  filteredIssues: GitHubIssue[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedLabels: string[]
  selectedRepositories: string[]
  sortBy: "created" | "updated" | "comments" | "title"
  sortOrder: "asc" | "desc"
  issuesToDisplay: number
  dateRange: { start: string; end: string }
}

interface IssuesActions {
  fetchIssues: () => Promise<void>
  setSearchTerm: (term: string) => void
  setSelectedLabels: (labels: string[]) => void
  setSelectedRepositories: (repos: string[]) => void
  setSortBy: (sortBy: IssuesState["sortBy"]) => void
  setSortOrder: (order: IssuesState["sortOrder"]) => void
  incrementIssuesToDisplay: () => void
  setDateRange: (range: { start: string; end: string }) => void
  applyFilters: () => void
}

type IssuesStore = IssuesState & IssuesActions

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const MINUTE = 60
  const HOUR = MINUTE * 60
  const DAY = HOUR * 24
  const MONTH = DAY * 30
  const YEAR = DAY * 365

  if (diffInSeconds < MINUTE) {
    return "just now"
  } else if (diffInSeconds < HOUR) {
    const minutes = Math.floor(diffInSeconds / MINUTE)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  } else if (diffInSeconds < DAY) {
    const hours = Math.floor(diffInSeconds / HOUR)
    return `${hours} hour${hours === 1 ? "" : "s"} ago`
  } else if (diffInSeconds < MONTH) {
    const days = Math.floor(diffInSeconds / DAY)
    return `${days} day${days === 1 ? "" : "s"} ago`
  } else if (diffInSeconds < YEAR) {
    const months = Math.floor(diffInSeconds / MONTH)
    return `${months} month${months === 1 ? "" : "s"} ago`
  } else {
    const years = Math.floor(diffInSeconds / YEAR)
    return `${years} year${years === 1 ? "" : "s"} ago`
  }
}

const useIssuesStoreBase = create<IssuesStore>((set, get) => ({
  issues: [],
  filteredIssues: [],
  loading: false,
  error: null,
  searchTerm: "",
  selectedLabels: [],
  selectedRepositories: [],
  sortBy: "created",
  sortOrder: "desc",
  issuesToDisplay: 24,
  dateRange: { start: "", end: "" },

  fetchIssues: async () => {
    set({ loading: true, error: null })

    try {
      const { fetchGitHubIssues } = await import("../lib/github-api")
      const { issues, error } = await fetchGitHubIssues()

      set({
        issues: issues,
        filteredIssues: issues,
        loading: false,
        error: error,
        issuesToDisplay: 24,
      })
      get().applyFilters()
    } catch (error: any) {
      console.error("Error fetching issues:", error)
      set({
        error: error.message || "Failed to fetch issues.",
        loading: false,
      })
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term, issuesToDisplay: 24 })
    get().applyFilters()
  },

  setSelectedLabels: (labels) => {
    set({ selectedLabels: labels, issuesToDisplay: 24 })
    get().applyFilters()
  },

  setSelectedRepositories: (repos) => {
    set({ selectedRepositories: repos, issuesToDisplay: 24 })
    get().applyFilters()
  },

  setSortBy: (sortBy) => {
    set({ sortBy, issuesToDisplay: 24 })
    get().applyFilters()
  },

  setSortOrder: (order) => {
    set({ sortOrder: order, issuesToDisplay: 24 })
    get().applyFilters()
  },

  incrementIssuesToDisplay: () => {
    set((state) => ({
      issuesToDisplay: state.issuesToDisplay + 12,
    }))
  },

  setDateRange: (range) => {
    set({ dateRange: range, issuesToDisplay: 24 })
    get().applyFilters()
  },

  applyFilters: () => {
    const { issues, searchTerm, selectedLabels, selectedRepositories, sortBy, sortOrder, dateRange } = get()

    let filtered = [...issues]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.repositoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.user.login.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply label filter
    if (selectedLabels.length > 0) {
      filtered = filtered.filter((issue) =>
        selectedLabels.some((label) => issue.labels.some((issueLabel) => issueLabel.name === label)),
      )
    }

    // Apply repository filter
    if (selectedRepositories.length > 0) {
      filtered = filtered.filter((issue) => selectedRepositories.includes(issue.repositoryName))
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((issue) => {
        const issueDate = new Date(issue.createdDate)
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date("1970-01-01")
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date()
        return issueDate >= startDate && issueDate <= endDate
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "created":
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
          break
        case "updated":
          comparison = new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime()
          break
        case "comments":
          comparison = a.comments - b.comments
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    set({ filteredIssues: filtered, issuesToDisplay: 24 })
  },
}))

const IssuesContext = createContext<IssuesStore | null>(null)

export function IssuesProvider({ children }: { children: ReactNode }) {
  const store = useIssuesStoreBase()
  return <IssuesContext.Provider value={store}>{children}</IssuesContext.Provider>
}

export function useIssuesStore() {
  const context = useContext(IssuesContext)
  if (!context) {
    throw new Error("useIssuesStore must be used within IssuesProvider")
  }
  return context
}

export { formatRelativeTime }
