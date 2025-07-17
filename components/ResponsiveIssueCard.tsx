import type { GitHubIssue } from "../hooks/useIssuesStore"
import { formatRelativeTime } from "../hooks/useIssuesStore"
import { MessageCircle } from "lucide-react" // Removed Bug, Sparkles, Circle
import Image from "next/image"

interface ResponsiveIssueCardProps {
  issue: GitHubIssue
}

export default function ResponsiveIssueCard({ issue }: ResponsiveIssueCardProps) {
  // Removed getIssueTypeIcon and getIssueTypeClass functions

  const getLabelStyle = (color: string) => {
    const hexColor = `#${color}`
    const r = Number.parseInt(color.substr(0, 2), 16)
    const g = Number.parseInt(color.substr(2, 2), 16)
    const b = Number.parseInt(color.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const textColor = brightness > 128 ? "#000000" : "#ffffff"

    return {
      backgroundColor: hexColor,
      color: textColor,
      borderColor: hexColor,
    }
  }

  return (
    <a
      href={issue.issueLink}
      target="_blank"
      rel="noopener noreferrer"
      className="github-card issue-card-mobile issue-card-tablet issue-card-desktop h-full flex flex-col hover:scale-[1.02] lg:hover:scale-[1.03] transition-transform duration-200 cursor-pointer block clickable-card"
      style={{ textDecoration: "none" }}
    >
      {/* Removed Header with issue type and number */}
      {/*
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div
          className={`label-badge label-mobile label-tablet ${getIssueTypeClass(issue.issueType)} flex items-center gap-1`}
        >
          {getIssueTypeIcon(issue.issueType)}
          <span className="capitalize text-xs sm:text-sm">{issue.issueType}</span>
        </div>
        <span className="text-xs sm:text-sm" style={{ color: "var(--github-fg-muted)" }}>
          #{issue.number}
        </span>
      </div>
      */}

      {/* Issue Title */}
      <div className="mb-2 sm:mb-3">
        <div
          className="title-mobile title-tablet title-desktop line-clamp-2 block card-title"
          style={{ color: "var(--github-accent-fg)" }}
        >
          {issue.title}
        </div>
      </div>

      {/* Description */}
      <div className="mb-3 sm:mb-4 flex-1">
        <p
          className="description-mobile description-tablet line-clamp-4" // Changed from line-clamp-2/3
          style={{ color: "var(--github-fg-muted)" }}
        >
          {issue.description}
        </p>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-wrap gap-1">
            {issue.labels.slice(0, window.innerWidth < 640 ? 2 : 4).map((label) => (
              <span
                key={label.name}
                className="label-badge label-mobile label-tablet"
                style={getLabelStyle(label.color)}
                title={label.description}
              >
                {label.name}
              </span>
            ))}
            {issue.labels.length > (window.innerWidth < 640 ? 2 : 4) && (
              <span
                className="label-badge label-mobile label-tablet"
                style={{
                  backgroundColor: "var(--github-canvas-subtle)",
                  color: "var(--github-fg-muted)",
                  border: "1px solid var(--github-border-default)",
                }}
              >
                +{issue.labels.length - (window.innerWidth < 640 ? 2 : 4)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* User and Repository Info */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <Image
            src={issue.user.avatar_url || "/placeholder.svg"}
            alt={`${issue.user.login}'s avatar`}
            width={16}
            height={16}
            className="avatar-mobile avatar-tablet avatar-desktop rounded-full flex-shrink-0"
          />
          <span className="text-xs sm:text-sm font-medium truncate" style={{ color: "var(--github-fg-default)" }}>
            {issue.user.login}
          </span>
        </div>
        <span
          className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] text-right"
          style={{ color: "var(--github-fg-muted)" }}
        >
          {issue.repositoryName.split("/")[1] || issue.repositoryName}
        </span>
      </div>

      {/* Footer with date and comments */}
      <div
        className="flex items-center justify-between text-xs sm:text-sm mb-3 sm:mb-4"
        style={{ color: "var(--github-fg-muted)" }}
      >
        <span>{formatRelativeTime(issue.createdDate)}</span>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{issue.comments}</span>
        </div>
      </div>
    </a>
  )
}
