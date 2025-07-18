import type { GitHubIssue, GitHubLabel } from "@/hooks/useIssuesStore"

// Determine issue type based on labels (moved from useIssuesStore)
const determineIssueType = (labels: GitHubLabel[]): "bug" | "feature" | "other" => {
  const labelNames = labels.map((label) => label.name.toLowerCase())

  if (labelNames.some((name) => name.includes("bug") || name.includes("error") || name.includes("fix"))) {
    return "bug"
  }

  if (
    labelNames.some(
      (name) =>
        name.includes("feature") ||
        name.includes("enhancement") ||
        name.includes("request") ||
        name.includes("improvement"),
    )
  ) {
    return "feature"
  }

  return "other"
}

// Get the GitHub token (server-side access)
const getGitHubToken = () => {
  // In a server environment, process.env is directly available
  return process.env.NEXT_PUBLIC_GITHUB_TOKEN
}

// Add delay function to prevent rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchGitHubIssues(): Promise<{ issues: GitHubIssue[]; error: string | null }> {
  try {
    const githubToken = getGitHubToken()
    console.log("Server-side GitHub token available:", !!githubToken)

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Issues-Explorer/2.0.0",
    }

    if (githubToken) {
      headers["Authorization"] = `Bearer ${githubToken}`
    }

    console.log("Server-side: Fetching trending repositories...")

    // Fetch popular repositories - reduced to be more production-friendly
    const repoResponse = await fetch(
      "https://api.github.com/search/repositories?q=stars:>5000+language:javascript+language:typescript+language:python+language:java+language:go+language:rust&sort=stars&order=desc&per_page=100",
      {
        headers,
        cache: "no-store",
        // Add timeout for production
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    )

    if (!repoResponse.ok) {
      const errorText = await repoResponse.text()
      console.error("Server-side: Repository fetch error:", errorText)

      if (repoResponse.status === 401) {
        return { issues: [], error: `Authentication failed (${repoResponse.status}). Please check your GitHub token.` }
      } else if (repoResponse.status === 403) {
        const rateLimitReset = repoResponse.headers.get("x-ratelimit-reset")
        const resetTime = rateLimitReset
          ? new Date(Number.parseInt(rateLimitReset) * 1000).toLocaleTimeString()
          : "unknown"
        return {
          issues: [],
          error: `Rate limit exceeded (${repoResponse.status}). Resets at ${resetTime}. Please add a GitHub token for higher limits.`,
        }
      } else {
        return { issues: [], error: `GitHub API error (${repoResponse.status}): ${repoResponse.statusText}` }
      }
    }

    const repoData = await repoResponse.json()
    console.log(`Server-side: Found ${repoData.items?.length || 0} repositories`)

    if (!repoData.items || repoData.items.length === 0) {
      return { issues: [], error: "No repositories found" }
    }

    // Process repositories in smaller batches to avoid overwhelming the API
    const BATCH_SIZE = 10 // Process 10 repos at a time
    const MAX_REPOS = 50 // Limit total repos for production stability
    const allIssues: GitHubIssue[] = []

    const reposToProcess = repoData.items.slice(0, MAX_REPOS)

    // Process repositories in batches
    for (let i = 0; i < reposToProcess.length; i += BATCH_SIZE) {
      const batch = reposToProcess.slice(i, i + BATCH_SIZE)

      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(reposToProcess.length / BATCH_SIZE)}`)

      const batchPromises = batch.map(async (repo: any) => {
        try {
          console.log(`Server-side: Fetching issues from ${repo.full_name}...`)

          // Add timeout for each request
          const issuesResponse = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/issues?state=open&per_page=50&sort=created&direction=desc`,
            {
              headers,
              cache: "no-store",
              signal: AbortSignal.timeout(8000), // 8 second timeout per request
            },
          )

          if (!issuesResponse.ok) {
            console.warn(`Server-side: Failed to fetch issues for ${repo.full_name}: ${issuesResponse.status}`)
            return []
          }

          const issues = await issuesResponse.json()
          const filteredIssues = issues.filter((issue: any) => !issue.pull_request).slice(0, 50)

          const transformedIssues: GitHubIssue[] = filteredIssues.map((issue: any) => {
            const labels: GitHubLabel[] =
              issue.labels?.map((label: any) => ({
                name: label.name,
                color: label.color,
                description: label.description,
              })) || []

            const issueType = determineIssueType(labels) // Still determine for internal property

            // Add explicit labels for better categorization
            if (issueType === "bug" && !labels.some((l) => l.name.toLowerCase().includes("bug"))) {
              labels.push({ name: "bug", color: "d73a4a", description: "Something isn't working" })
            }
            if (
              issueType === "feature" &&
              !labels.some(
                (l) => l.name.toLowerCase().includes("feature") || l.name.toLowerCase().includes("enhancement"),
              )
            ) {
              labels.push({ name: "feature-request", color: "a2eeef", description: "New feature or request" })
            }

            return {
              id: issue.id,
              number: issue.number,
              title: issue.title,
              body: issue.body || "",
              description: issue.body
                ? issue.body.length > 400 // Increased from 200
                  ? issue.body.substring(0, 400) + "..."
                  : issue.body
                : "No description available",
              labels,
              user: {
                login: issue.user.login,
                avatar_url: issue.user.avatar_url,
                html_url: issue.user.html_url, // Corrected from issue.user.html_url
              },
              repositoryName: `${repo.owner.login}/${repo.name}`,
              repositoryUrl: repo.html_url,
              issueLink: issue.html_url,
              createdDate: issue.created_at,
              updatedDate: issue.updated_at,
              comments: issue.comments || 0,
              state: issue.state,
              issueType, // Keep this internal property for now, might be useful later
            }
          })

          console.log(`Server-side: Added ${transformedIssues.length} issues from ${repo.full_name}`)
          return transformedIssues
        } catch (repoError: any) {
          console.warn(`Server-side: Failed to fetch issues for ${repo.full_name}:`, repoError.message)
          return []
        }
      })

      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises)
      allIssues.push(...batchResults.flat())

      // Add delay between batches to prevent rate limiting
      if (i + BATCH_SIZE < reposToProcess.length) {
        await delay(1000) // 1 second delay between batches
      }
    }

    console.log(`Server-side: Total issues fetched: ${allIssues.length}`)

    if (allIssues.length === 0) {
      return { issues: [], error: "No issues found in the repositories" }
    }

    return { issues: allIssues, error: null }
  } catch (error: any) {
    console.error("Server-side: Error fetching issues:", error)

    // More specific error handling for production
    if (error.name === "TimeoutError") {
      return { issues: [], error: "Request timed out. Please try again later." }
    }

    let errorMessage = "Failed to fetch issues. "
    errorMessage += error.message || "Please check your internet connection and try again."
    return { issues: [], error: errorMessage }
  }
}
