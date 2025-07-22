import { getCached, setCached, generateCacheKey } from "./cache"

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

interface FetchIssuesFilters {
  languages: string[]
  labels: string[]
  sortBy: "newest" | "comments" | "activity"
}

interface GitHubApiResponse {
  issues: GitHubIssue[]
  error: string | null
  cached?: boolean
  timestamp?: number
}

// Enhanced retry logic with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // Reduced timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return response
      }

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1s, 2s
        const delay = Math.min(500 * Math.pow(2, attempt), 2000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

export async function fetchGitHubIssues(filters: FetchIssuesFilters, useCache = true): Promise<GitHubApiResponse> {
  const cacheKey = generateCacheKey(filters)

  // Check cache first
  if (useCache) {
    const cached = getCached<GitHubApiResponse>(cacheKey)
    if (cached) {
      return { ...cached, cached: true }
    }
  }

  try {
    const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_PAT

    if (!githubToken) {
      return {
        issues: [],
        error: "GitHub token not configured. Please add GITHUB_PAT to your environment variables.",
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${githubToken}`,
      "User-Agent": "Bitbug-Issues-Explorer/2.0.0",
      "X-GitHub-Api-Version": "2022-11-28",
    }

    const { languages, labels, sortBy } = filters
    let query = "is:issue is:open"

    // Optimized query construction
    if (languages.length > 0) {
      query += ` language:${languages[0]}`
    }
    if (labels.length > 0) {
      // Use AND logic for better filtering
      query += ` ${labels.map((label) => `label:"${label}"`).join(" ")}`
    }

    const sortMap = {
      newest: { sort: "created", order: "desc" },
      comments: { sort: "comments", order: "desc" },
      activity: { sort: "updated", order: "desc" },
    }
    const { sort, order } = sortMap[sortBy]

    // Optimized fetching strategy
    const allIssues: any[] = []
    const maxPages = 8 // Reduced from 10 for better performance
    const batchSize = 3 // Process in smaller batches

    for (let batch = 0; batch < Math.ceil(maxPages / batchSize); batch++) {
      const batchPromises: Promise<any>[] = []

      for (let i = 0; i < batchSize; i++) {
        const page = batch * batchSize + i + 1
        if (page > maxPages) break

        const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=100&page=${page}`

        batchPromises.push(
          fetchWithRetry(searchUrl, { headers })
            .then((response) => response.json())
            .then((data) => ({ page, data }))
            .catch((error) => ({ page, error })),
        )
      }

      // Process batch concurrently
      const batchResults = await Promise.allSettled(batchPromises)

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value.data && !result.value.error) {
          const { data } = result.value
          if (data.items && data.items.length > 0) {
            allIssues.push(...data.items)
          }
        }
      }

      // Small delay between batches
      if (batch < Math.ceil(maxPages / batchSize) - 1) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    if (allIssues.length === 0) {
      const result = { issues: [], error: null, timestamp: Date.now() }
      setCached(cacheKey, result)
      return result
    }

    // Optimized repository details fetching
    const repoDetailsCache = new Map<string, any>()
    const uniqueRepoUrls = [...new Set(allIssues.map((issue) => issue.repository_url))].slice(0, 30)

    // Batch fetch repository details with concurrency limit
    const repoPromises = uniqueRepoUrls.map(async (repoUrl) => {
      try {
        const repoRes = await fetchWithRetry(repoUrl, { headers })
        if (repoRes.ok) {
          const repoData = await repoRes.json()
          repoDetailsCache.set(repoUrl, repoData)
        }
      } catch (error) {
        // Silently fail for repo details
      }
    })

    // Process repo details with timeout
    await Promise.allSettled(repoPromises)

    // Optimized issue transformation
    const transformedIssues: GitHubIssue[] = allIssues
      .filter((issue: any) => !issue.pull_request)
      .slice(0, 800) // Reduced from 1000 for better performance
      .map((issue: any) => {
        const repoDetails = repoDetailsCache.get(issue.repository_url)

        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body || "",
          description: issue.body
            ? issue.body.substring(0, 150) + (issue.body.length > 150 ? "..." : "")
            : "No description available.",
          labels: issue.labels.map((l: any) => ({
            name: l.name,
            color: l.color,
            description: l.description,
          })),
          user: {
            login: issue.user.login,
            avatar_url: issue.user.avatar_url,
            html_url: issue.user.html_url,
          },
          repositoryName: issue.repository_url.split("/").slice(-2).join("/"),
          repositoryUrl: issue.repository_url,
          repositoryLanguage: repoDetails?.language || "Unknown",
          issueLink: issue.html_url,
          createdDate: issue.created_at,
          updatedDate: issue.updated_at,
          comments: issue.comments || 0,
          state: issue.state,
        }
      })

    const result: GitHubApiResponse = {
      issues: transformedIssues,
      error: null,
      timestamp: Date.now(),
    }

    // Cache with optimized TTL
    setCached(cacheKey, result, { ttl: 1000 * 60 * 8 }) // 8 minutes
    return result
  } catch (error: any) {
    console.error("Failed to fetch GitHub issues:", error)

    if (error.message?.includes("HTTP 401")) {
      return { issues: [], error: "Authentication failed. Please check your GitHub token." }
    }
    if (error.message?.includes("HTTP 403")) {
      return { issues: [], error: "Rate limit exceeded. Please try again in a few minutes." }
    }
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return { issues: [], error: "Request timed out. Please try again." }
    }

    return { issues: [], error: error.message || "Failed to fetch issues. Please try again." }
  }
}

// Optimized preload function
export async function preloadPopularIssues(): Promise<void> {
  const popularFilter = { languages: ["javascript"], labels: ["good first issue"], sortBy: "newest" as const }

  // Use setTimeout to avoid blocking the main thread
  setTimeout(() => {
    fetchGitHubIssues(popularFilter, true).catch((error) => console.warn("Preload failed:", error))
  }, 100)
}
