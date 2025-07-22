import type { GitHubIssue } from "@/hooks/useIssuesStore"

interface FetchIssuesFilters {
  languages: string[]
  labels: string[]
  sortBy: "newest" | "comments" | "activity"
}

const getGitHubToken = () => process.env.NEXT_PUBLIC_GITHUB_TOKEN

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchGitHubIssues(
  filters: FetchIssuesFilters,
): Promise<{ issues: GitHubIssue[]; error: string | null }> {
  try {
    const githubToken = getGitHubToken()
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Issues-Explorer/3.0.0",
    }
    if (githubToken) {
      headers["Authorization"] = `Bearer ${githubToken}`
    }

    const { languages, labels, sortBy } = filters
    let query = "is:issue is:open"

    if (languages.length > 0) {
      query += ` ${languages.map((lang) => `language:${lang}`).join(" ")}`
    }
    if (labels.length > 0) {
      query += ` ${labels.map((label) => `label:"${label}"`).join(" ")}`
    }

    const sortMap = {
      newest: { sort: "created", order: "desc" },
      comments: { sort: "comments", order: "desc" },
      activity: { sort: "updated", order: "desc" },
    }
    const { sort, order } = sortMap[sortBy]

    const response = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=100`,
      { headers, cache: "no-store", signal: AbortSignal.timeout(15000) },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("GitHub API Error:", errorText)
      if (response.status === 401) return { issues: [], error: "Authentication failed. Check your GitHub token." }
      if (response.status === 403) return { issues: [], error: "Rate limit exceeded. Please try again later." }
      return { issues: [], error: `GitHub API error (${response.status}): ${response.statusText}` }
    }

    const data = await response.json()
    if (!data.items || data.items.length === 0) {
      return { issues: [], error: "No issues found for the selected criteria." }
    }

    const repoDetailsCache = new Map<string, any>()
    const transformedIssues: GitHubIssue[] = []

    for (const issue of data.items) {
      if (issue.pull_request) continue

      let repoDetails = repoDetailsCache.get(issue.repository_url)
      if (!repoDetails) {
        try {
          const repoRes = await fetch(issue.repository_url, { headers, signal: AbortSignal.timeout(5000) })
          if (repoRes.ok) {
            repoDetails = await repoRes.json()
            repoDetailsCache.set(issue.repository_url, repoDetails)
            await delay(50) // Small delay to avoid hitting secondary rate limits
          }
        } catch (e) {
          console.warn(`Failed to fetch repo details for ${issue.repository_url}`)
        }
      }

      transformedIssues.push({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || "",
        description: issue.body
          ? issue.body.substring(0, 200) + (issue.body.length > 200 ? "..." : "")
          : "No description.",
        labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color, description: l.description })),
        user: {
          login: issue.user.login,
          avatar_url: issue.user.avatar_url,
          html_url: issue.user.html_url,
        },
        repositoryName: issue.repository_url.split("/").slice(-2).join("/"),
        repositoryUrl: issue.repository_url,
        repositoryLanguage: repoDetails?.language || "N/A",
        issueLink: issue.html_url,
        createdDate: issue.created_at,
        updatedDate: issue.updated_at,
        comments: issue.comments || 0,
        state: issue.state,
      })
    }

    return { issues: transformedIssues, error: null }
  } catch (error: any) {
    console.error("Failed to fetch issues:", error)
    if (error.name === "TimeoutError") return { issues: [], error: "Request timed out. Please try again." }
    return { issues: [], error: error.message || "An unknown error occurred." }
  }
}
