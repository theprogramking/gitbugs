import { AlertCircle, RefreshCw, Wifi, Key, Clock } from "lucide-react"

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="github-card p-4 border-red-200 dark:border-red-800">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5" style={{ color: "var(--github-danger-fg)" }} />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium" style={{ color: "var(--github-danger-fg)" }}>
            Error Loading Issues
          </h3>
          <div className="mt-2 text-sm" style={{ color: "var(--github-fg-muted)" }}>
            {message}
          </div>
          <div className="mt-3 text-sm" style={{ color: "var(--github-fg-muted)" }}>
            <p className="font-medium mb-2">Troubleshooting tips:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Check your internet connection
              </li>
              <li className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Verify your GitHub token is valid
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try refreshing the page
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Wait if you've hit rate limits
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
