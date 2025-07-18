"use client"

import { useState, useMemo } from "react"
import { useIssuesStore } from "../hooks/useIssuesStore"
import { Search, Filter } from "lucide-react"

export default function SearchAndFilters() {
  const {
    issues,
    searchTerm,
    selectedLabels,
    selectedRepositories,
    sortBy,
    sortOrder,
    dateRange,
    setSearchTerm,
    setSelectedLabels,
    setSelectedRepositories,
    setSortBy,
    setSortOrder,
    setDateRange,
  } = useIssuesStore()

  const [showFilters, setShowFilters] = useState(false)

  const availableLabels = useMemo(() => {
    const labels = new Set<string>()
    issues.forEach((issue) => {
      issue.labels.forEach((label) => labels.add(label))
    })
    return Array.from(labels).sort()
  }, [issues])

  const availableRepositories = useMemo(() => {
    const repos = new Set<string>()
    issues.forEach((issue) => repos.add(issue.repositoryName))
    return Array.from(repos).sort()
  }, [issues])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-200">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues, repositories, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary whitespace-nowrap flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {/* Labels Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</label>
            <select
              multiple
              value={selectedLabels}
              onChange={(e) => setSelectedLabels(Array.from(e.target.selectedOptions, (option) => option.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              size={3}
            >
              {availableLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Repositories Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repositories</label>
            <select
              multiple
              value={selectedRepositories}
              onChange={(e) => setSelectedRepositories(Array.from(e.target.selectedOptions, (option) => option.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              size={3}
            >
              {availableRepositories.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="created">Created Date</option>
              <option value="updated">Updated Date</option>
              <option value="repository">Repository</option>
              <option value="title">Title</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="End date"
            />
          </div>
        </div>
      )}
    </div>
  )
}
