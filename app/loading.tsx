export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-github-canvas-default">
      <div className="cascading-loader">
        <div className="cascading-dot"></div>
        <div className="cascading-dot"></div>
        <div className="cascading-dot"></div>
        <div className="cascading-dot"></div>
        <div className="cascading-dot"></div>
      </div>
    </div>
  )
}
