"use client"

import { X, Lightbulb, Star, BookOpen, GitBranch, Users, Target, MessageSquare } from "lucide-react"
import { useEffect } from "react"

interface ProTipsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRO_TIPS = [
  {
    icon: <Star className="h-4 w-4" />,
    text: "Start with 'good first issue' labels",
    description: "These are specifically curated for newcomers to open source",
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    text: "Look for documentation tasks",
    description: "Great way to contribute without complex coding requirements",
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    text: "Choose repos with high stars for resume impact",
    description: "Popular repositories carry more weight on your profile",
  },
  {
    icon: <Users className="h-4 w-4" />,
    text: "Read contributing guidelines first",
    description: "Each project has specific requirements and processes",
  },
  {
    icon: <Target className="h-4 w-4" />,
    text: "Filter by programming language you know",
    description: "Focus on technologies you're comfortable with initially",
  },
  {
    icon: <MessageSquare className="h-4 w-4" />,
    text: "Check issue activity and comments",
    description: "Active discussions indicate maintainer engagement",
  },
]

export default function ProTipsModal({ isOpen, onClose }: ProTipsModalProps) {
  // Handle escape key press
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
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="relative pro-tips-modal-container max-w-md w-full max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="protips-title"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-full shadow-sm">
              <Lightbulb className="h-5 w-5 text-blue-900" />
            </div>
            <h2 id="protips-title" className="text-xl font-bold text-white">
              Pro Tips
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close Pro Tips modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] pro-tips-scroll">
          <div className="p-4 space-y-3">
            {PRO_TIPS.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-800/30 border border-blue-600/20"
              >
                <div className="flex-shrink-0 p-1.5 bg-blue-600/40 rounded-md text-blue-200">{tip.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm leading-relaxed mb-1">{tip.text}</div>
                  <div className="text-blue-200 text-xs leading-relaxed opacity-90">{tip.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-blue-600/30 bg-blue-900/30">
            <div className="text-center text-blue-200 text-xs">
              💡 These tips will help you find the perfect issues to contribute to!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
