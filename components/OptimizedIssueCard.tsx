"use client"

import { memo, useCallback } from "react"
import { MessageCircle, GitBranch, Code } from "lucide-react"
import Image from "next/image"
import type { GitHubIssue } from "../lib/github-api-optimized"
import { formatRelativeTime } from "../hooks/useOptimizedIssuesStore"

interface OptimizedIssueCardProps {
  issue: GitHubIssue
  onCardClick: (issue: GitHubIssue) => void
}

const HIGHLIGHT_LABELS = ["good first issue", "help wanted", "hacktoberfest"]

// Memoized label style calculation
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

function OptimizedIssueCard({ issue, onCardClick }: OptimizedIssueCardProps) {
  const handleClick = useCallback(() => {
    onCardClick(issue)
  }, [issue, onCardClick])

  return (
    <div
      className="github-card h-full flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] group"
      onClick={handleClick}
    >
      {/* Card Header: Repo Name and Language */}
      <div className="flex items-center justify-between text-xs mb-3 text-github-fg-muted group-hover:text-github-accent-fg transition-colors duration-200">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium truncate">{issue.repositoryName}</span>
        </div>
        {issue.repositoryLanguage && issue.repositoryLanguage !== "Unknown" && (
          <div className="flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" />
            <span>{issue.repositoryLanguage}</span>
          </div>
        )}
      </div>

      {/* Issue Title */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-github-fg-default group-hover:text-github-accent-fg line-clamp-2 transition-colors duration-200">
          {issue.title}
        </h3>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {issue.labels.slice(0, 4).map((label) => (
            <span
              key={label.name}
              className={`label-badge ${HIGHLIGHT_LABELS.includes(label.name.toLowerCase()) ? "label-highlight" : ""}`}
              style={getLabelStyle(label.color)}
              title={label.description || label.name}
            >
              {label.name}
            </span>
          ))}
          {issue.labels.length > 4 && (
            <span className="text-xs text-github-fg-muted group-hover:text-github-accent-fg transition-colors duration-200">
              +{issue.labels.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Card Footer: User, Date, Comments */}
      <div className="flex items-center justify-between text-xs text-github-fg-muted group-hover:text-github-accent-fg card-footer transition-colors duration-200">
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src={issue.user.avatar_url || "/placeholder.svg"}
            alt={`${issue.user.login}'s avatar`}
            width={20}
            height={20}
            className="rounded-full"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedIssueCard, (prevProps, nextProps) => {
  return (
    prevProps.issue.id === nextProps.issue.id &&
    prevProps.issue.updatedDate === nextProps.issue.updatedDate &&
    prevProps.issue.comments === nextProps.issue.comments
  )
})
