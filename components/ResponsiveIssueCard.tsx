"use client"

import type { GitHubIssue } from "../hooks/useIssuesStore"
import { formatRelativeTime } from "../hooks/useIssuesStore"
import { MessageCircle, GitBranch, Code } from "lucide-react"
import Image from "next/image"

interface ResponsiveIssueCardProps {
  issue: GitHubIssue
  onCardClick: (issue: GitHubIssue) => void
}

const HIGHLIGHT_LABELS = ["good first issue", "help wanted", "hacktoberfest"]

export default function ResponsiveIssueCard({ issue, onCardClick }: ResponsiveIssueCardProps) {
  const getLabelStyle = (color: string) => {
    const hexColor = `#${color}`
    const r = Number.parseInt(color.substring(0, 2), 16)
    const g = Number.parseInt(color.substring(2, 4), 16)
    const b = Number.parseInt(color.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return {
      backgroundColor: hexColor,
      color: brightness > 128 ? "#000000" : "#ffffff",
      border: "none",
    }
  }

  return (
    <div
      className="github-card h-full flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => onCardClick(issue)}
    >
      {/* Card Header: Repo Name and Language */}
      <div className="flex items-center justify-between text-xs mb-3 text-github-fg-muted">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium truncate">{issue.repositoryName}</span>
        </div>
        {issue.repositoryLanguage && (
          <div className="flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" />
            <span>{issue.repositoryLanguage}</span>
          </div>
        )}
      </div>

      {/* Issue Title */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-github-fg-default hover:text-github-accent-fg line-clamp-2">
          {issue.title}
        </h3>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {issue.labels.slice(0, 5).map((label) => (
            <span
              key={label.name}
              className={`label-badge ${HIGHLIGHT_LABELS.includes(label.name.toLowerCase()) ? "label-highlight" : ""}`}
              style={getLabelStyle(label.color)}
              title={label.description || label.name}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Card Footer: User, Date, Comments */}
      <div className="flex items-center justify-between text-xs text-github-fg-muted card-footer">
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src={issue.user.avatar_url || "/placeholder.svg"}
            alt={`${issue.user.login}'s avatar`}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="truncate">{issue.user.login}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{formatRelativeTime(issue.createdDate)}</span>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{issue.comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
