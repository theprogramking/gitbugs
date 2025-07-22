"use client"

import { X, ExternalLink, MessageCircle, GitBranch, Code, Calendar, User } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"
import type { GitHubIssue } from "../hooks/useIssuesStore"
import { formatRelativeTime } from "../hooks/useIssuesStore"

interface IssueModalProps {
  issue: GitHubIssue | null
  isOpen: boolean
  onClose: () => void
}

const HIGHLIGHT_LABELS = ["good first issue", "help wanted", "hacktoberfest"]

export default function IssueModal({ issue, isOpen, onClose }: IssueModalProps) {
  // Handle escape key press and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !issue) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-github-canvas-default border border-github-border-default rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: "var(--github-canvas-default)", borderColor: "var(--github-border-default)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 modal-header-clean">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="h-4 w-4 text-github-fg-muted flex-shrink-0" />
            <span className="text-sm text-github-fg-muted truncate">{issue.repositoryName}</span>
            {issue.repositoryLanguage && (
              <>
                <span className="text-github-fg-muted">•</span>
                <div className="flex items-center gap-1">
                  <Code className="h-3.5 w-3.5 text-github-fg-muted" />
                  <span className="text-sm text-github-fg-muted">{issue.repositoryLanguage}</span>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="minimalistic-close-button" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Issue Title */}
            <h2 className="text-xl font-semibold text-github-fg-default mb-4 leading-tight">{issue.title}</h2>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {issue.labels.map((label) => (
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

            {/* Issue Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-github-fg-default mb-3">Description</h3>
              <div
                className="text-sm text-github-fg-default leading-relaxed whitespace-pre-wrap bg-github-canvas-subtle p-4 rounded-xl border border-github-border-default max-h-[250px] overflow-y-auto issue-description-scroll"
                style={{ backgroundColor: "var(--github-canvas-subtle)", borderColor: "var(--github-border-default)" }}
              >
                {issue.body || "No description provided."}
              </div>
            </div>

            {/* Issue Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 card-section">
              <div className="flex items-center gap-2 text-sm text-github-fg-muted">
                <User className="h-4 w-4" />
                <span>Created by:</span>
                <a
                  href={issue.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-github-accent-fg hover:underline"
                >
                  <Image
                    src={issue.user.avatar_url || "/placeholder.svg"}
                    alt={`${issue.user.login}'s avatar`}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  {issue.user.login}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm text-github-fg-muted">
                <Calendar className="h-4 w-4" />
                <span>Created {formatRelativeTime(issue.createdDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-github-fg-muted">
                <MessageCircle className="h-4 w-4" />
                <span>
                  {issue.comments} comment{issue.comments !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-github-fg-muted">
                <span>Issue #{issue.number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 modal-footer-clean">
          <a
            href={issue.issueLink}
            target="_blank"
            rel="noopener noreferrer"
            className="refined-github-button w-full flex items-center justify-center gap-2 py-3"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
