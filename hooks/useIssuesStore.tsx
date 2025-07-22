"use client"

import { create } from "zustand"
import { createContext, useContext, type ReactNode } from "react"
import { fetchGitHubIssues } from "../lib/github-api"

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
  repositoryLanguage: string
  issueLink: string
  createdDate: string
  updatedDate: string
  comments: number
  state: string
}

interface IssuesState {
  issues: GitHubIssue[]
  filteredIssues: GitHubIssue[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedLabels: string[]
  selectedLanguages: string[]
  sortBy: "newest" | "comments" | "activity"
  issuesToDisplay: number
}

interface IssuesActions {
  fetchIssues: () => Promise<void>
  setSearchTerm: (term: string) => void
  setSelectedLabels: (labels: string[]) => void
  setSelectedLanguages: (languages: string[]) => void
  setSortBy: (sortBy: IssuesState["sortBy"]) => void
  incrementIssuesToDisplay: () => void
}

type IssuesStore = IssuesState & IssuesActions

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const MINUTE = 60,
    HOUR = 3600,
    DAY = 86400,
    MONTH = 2592000,
    YEAR = 31536000
  if (diffInSeconds < MINUTE) return "just now"
  if (diffInSeconds < HOUR) return `${Math.floor(diffInSeconds / MINUTE)}m ago`
  if (diffInSeconds < DAY) return `${Math.floor(diffInSeconds / HOUR)}h ago`
  if (diffInSeconds < MONTH) return `${Math.floor(diffInSeconds / DAY)}d ago`
  if (diffInSeconds < YEAR) return `${Math.floor(diffInSeconds / MONTH)}mo ago`
  return `${Math.floor(diffInSeconds / YEAR)}y ago`
}

const useIssuesStoreBase = create<IssuesStore>((set, get) => ({
  issues: [],
  filteredIssues: [],
  loading: false,
  error: null,
  searchTerm: "",
  selectedLabels: ["good first issue", "help wanted"],
  selectedLanguages: ["javascript", "typescript", "python"],
  sortBy: "newest",
  issuesToDisplay: 24,

  incrementIssuesToDisplay: () => {
    set((state) => ({
      issuesToDisplay: state.issuesToDisplay + 12,
    }))
  },

  fetchIssues: async () => {
    set({ loading: true, error: null })
    try {
      const { sortBy, selectedLanguages, selectedLabels } = get()
      const { issues, error } = await fetchGitHubIssues({
        sortBy,
        languages: selectedLanguages,
        labels: selectedLabels,
      })

      set({
        issues: issues,
        filteredIssues: issues,
        loading: false,
        error: error,
      })
      get().setSearchTerm(get().searchTerm) // Re-apply search term
    } catch (error: any) {
      console.error("Error fetching issues:", error)
      set({ error: error.message || "Failed to fetch issues.", loading: false })
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term })
    const { issues } = get()
    if (!term) {
      set({ filteredIssues: issues })
      return
    }
    const lowercasedTerm = term.toLowerCase()
    const filtered = issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(lowercasedTerm) ||
        issue.repositoryName.toLowerCase().includes(lowercasedTerm) ||
        issue.repositoryLanguage?.toLowerCase().includes(lowercasedTerm) ||
        issue.labels.some((l) => l.name.toLowerCase().includes(lowercasedTerm)),
    )
    set({ filteredIssues: filtered })
  },

  setSelectedLabels: (labels) => {
    set({ selectedLabels: labels })
    get().fetchIssues()
  },

  setSelectedLanguages: (languages) => {
    set({ selectedLanguages: languages })
    get().fetchIssues()
  },

  setSortBy: (sortBy) => {
    set({ sortBy })
    get().fetchIssues()
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
