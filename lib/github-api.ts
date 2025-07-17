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

    // Fetch popular repositories (increased per_page to 100)
    const repoResponse = await fetch(
      "https://api.github.com/search/repositories?q=stars:>2000+language:javascript+language:typescript+language:python+language:java+language:go+language:rust&sort=stars&order=desc&per_page=100",
      {
        headers,
        cache: "no-store", // Ensure fresh data on each request
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

    // Fetch issues from up to 100 repositories (increased from 50)
    const issueFetchPromises = repoData.items.slice(0, 100).map(async (repo: any) => {
      try {
        console.log(`Server-side: Fetching issues from ${repo.full_name}...`)

        // Fetch issues (increased per_page to 100)
        const issuesResponse = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/issues?state=open&per_page=100&sort=created&direction=desc`,
          {
            headers,
            cache: "no-store",
          },
        )

        if (!issuesResponse.ok) {
          console.warn(`Server-side: Failed to fetch issues for ${repo.full_name}: ${issuesResponse.status}`)
          return [] // Return empty array for failed repo
        }

        const issues = await issuesResponse.json()

        // Filter out pull requests and transform issues (increased slice to 100)
        const filteredIssues = issues.filter((issue: any) => !issue.pull_request).slice(0, 100)

        const transformedIssues: GitHubIssue[] = filteredIssues.map((issue: any) => {
          const labels: GitHubLabel[] =
            issue.labels?.map((label: any) => ({
              name: label.name,
              color: label.color,
              description: label.description,
            })) || []

          const issueType = determineIssueType(labels) // Still determine for internal property

          // Add explicit 'bug' or 'feature-request' label if not already present
          if (issueType === "bug" && !labels.some((l) => l.name.toLowerCase().includes("bug"))) {
            labels.push({ name: "bug", color: "d73a4a", description: "Something isn't working" }) // GitHub's default bug color
          }
          if (
            issueType === "feature" &&
            !labels.some(
              (l) => l.name.toLowerCase().includes("feature") || l.name.toLowerCase().includes("enhancement"),
            )
          ) {
            labels.push({ name: "feature-request", color: "a2eeef", description: "New feature or request" }) // GitHub's default enhancement color
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
              html_url: issue.html_url, // Corrected from issue.user.html_url
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
        return [] // Return empty array for errors
      }
    })

    // Parallelize all issue fetching requests
    const results = await Promise.all(issueFetchPromises)
    const allIssues = results.flat() // Flatten the array of arrays into a single array

    console.log(`Server-side: Total issues fetched: ${allIssues.length}`)

    if (allIssues.length === 0) {
      return { issues: [], error: "No issues found in the repositories" }
    }

    return { issues: allIssues, error: null }
  } catch (error: any) {
    console.error("Server-side: Error fetching issues:", error)
    let errorMessage = "Failed to fetch issues. "
    errorMessage += error.message || "Please check your internet connection and try again."
    return { issues: [], error: errorMessage }
  }
}
