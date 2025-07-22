"use client"

import { useMemo, useCallback } from "react"
import { create } from "zustand"
import { createContext, useContext, type ReactNode } from "react"
import useSWR from "swr"
import { fetchGitHubIssues, type GitHubIssue } from "../lib/github-api-optimized"

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

export type { GitHubIssue }

interface IssuesState {
  searchTerm: string
  selectedLabels: string[]
  selectedLanguages: string[]
  sortBy: "newest" | "comments" | "activity"
  issuesToDisplay: number
  isLoadingMore: boolean
}

interface IssuesActions {
  setSearchTerm: (term: string) => void
  setSelectedLabels: (labels: string[]) => void
  setSelectedLanguages: (languages: string[]) => void
  setSortBy: (sortBy: IssuesState["sortBy"]) => void
  loadMore: () => void
  resetPagination: () => void
}

type IssuesStore = IssuesState & IssuesActions

// Optimized time formatting with memoization
const timeCache = new Map<string, string>()
export const formatRelativeTime = (dateString: string): string => {
  if (timeCache.has(dateString)) {
    return timeCache.get(dateString)!
  }

  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diffInSeconds = Math.floor((now - date) / 1000)

  let result: string
  if (diffInSeconds < 60) result = "just now"
  else if (diffInSeconds < 3600) result = `${Math.floor(diffInSeconds / 60)}m ago`
  else if (diffInSeconds < 86400) result = `${Math.floor(diffInSeconds / 3600)}h ago`
  else if (diffInSeconds < 2592000) result = `${Math.floor(diffInSeconds / 86400)}d ago`
  else if (diffInSeconds < 31536000) result = `${Math.floor(diffInSeconds / 2592000)}mo ago`
  else result = `${Math.floor(diffInSeconds / 31536000)}y ago`

  timeCache.set(dateString, result)
  return result
}

const useIssuesStoreBase = create<IssuesStore>((set, get) => ({
  searchTerm: "",
  selectedLabels: ["good first issue"],
  selectedLanguages: ["javascript"],
  sortBy: "newest",
  issuesToDisplay: 24,
  isLoadingMore: false,

  setSearchTerm: (term) => {
    set({ searchTerm: term })
  },

  setSelectedLabels: (labels) => {
    set({
      selectedLabels: labels,
      issuesToDisplay: 24,
    })
  },

  setSelectedLanguages: (languages) => {
    const singleLanguage = languages.length > 0 ? [languages[0]] : []
    set({
      selectedLanguages: singleLanguage,
      issuesToDisplay: 24,
    })
  },

  setSortBy: (sortBy) => {
    set({
      sortBy,
      issuesToDisplay: 24,
    })
  },

  loadMore: () => {
    const state = get()
    if (state.isLoadingMore) return

    set({
      issuesToDisplay: state.issuesToDisplay + 24,
      isLoadingMore: true,
    })

    setTimeout(() => {
      set({ isLoadingMore: false })
    }, 100)
  },

  resetPagination: () => {
    set({ issuesToDisplay: 24, isLoadingMore: false })
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

// Simplified issues hook
export function useIssues() {
  const store = useIssuesStore()
  const { selectedLanguages, selectedLabels, sortBy, searchTerm } = store

  const fetcher = useCallback(async ([_, filters]: [string, any]) => {
    const result = await fetchGitHubIssues(filters)
    if (result.error) {
      throw new Error(result.error)
    }
    return result
  }, [])

  const { data, error, isLoading, mutate } = useSWR(
    ["github-issues", { languages: selectedLanguages, labels: selectedLabels, sortBy }],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      keepPreviousData: true,
      revalidateIfStale: false,
    },
  )

  // Simplified filtering
  const filteredIssues = useMemo(() => {
    if (!data?.issues) return []
    if (!searchTerm.trim()) return data.issues

    const lowercasedTerm = searchTerm.toLowerCase().trim()
    return data.issues.filter((issue) => {
      return (
        issue.title.toLowerCase().includes(lowercasedTerm) ||
        issue.repositoryName.toLowerCase().includes(lowercasedTerm) ||
        issue.repositoryLanguage.toLowerCase().includes(lowercasedTerm) ||
        issue.labels.some((label) => label.name.toLowerCase().includes(lowercasedTerm))
      )
    })
  }, [data?.issues, searchTerm])

  return {
    issues: filteredIssues,
    loading: isLoading,
    error: error?.message || null,
    cached: data?.cached || false,
    refetch: mutate,
  }
}
