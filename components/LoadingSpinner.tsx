import { Loader2 } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin" style={{ color: "var(--github-accent-emphasis)" }} />
      <div style={{ color: "var(--github-fg-muted)" }}>Loading GitHub issues...</div>
    </div>
  )
}
