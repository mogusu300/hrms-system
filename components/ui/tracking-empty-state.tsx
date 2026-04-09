/**
 * TrackingEmptyState Component
 * Displays user-friendly empty state messages for tracking modules
 * 
 * Usage:
 * import { TrackingEmptyState } from '@/components/ui/tracking-empty-state'
 * 
 * <TrackingEmptyState 
 *   type="no-records" 
 *   title="No Leave Applications"
 *   description="You don't have any leave applications yet"
 * />
 */

import { FileX, Search, AlertCircle } from 'lucide-react'
import { Empty } from '@/components/ui/empty'

export type EmptyStateType = 'no-records' | 'no-search-results' | 'error'

interface TrackingEmptyStateProps {
  type?: EmptyStateType
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export function TrackingEmptyState({
  type = 'no-records',
  title,
  description,
  actionText,
  onAction,
}: TrackingEmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'no-search-results':
        return <Search className="h-12 w-12 text-amber-600" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />
      case 'no-records':
      default:
        return <FileX className="h-12 w-12 text-blue-600" />
    }
  }

  const getBgClass = () => {
    switch (type) {
      case 'no-search-results':
        return 'border border-amber-200 bg-amber-50'
      case 'error':
        return 'border border-red-200 bg-red-50'
      case 'no-records':
      default:
        return 'border border-blue-200 bg-blue-50'
    }
  }

  const getTitleClass = () => {
    switch (type) {
      case 'no-search-results':
        return 'text-amber-900'
      case 'error':
        return 'text-red-900'
      case 'no-records':
      default:
        return 'text-blue-900'
    }
  }

  const getDescriptionClass = () => {
    switch (type) {
      case 'no-search-results':
        return 'text-amber-700'
      case 'error':
        return 'text-red-700'
      case 'no-records':
      default:
        return 'text-blue-700'
    }
  }

  const getActionClass = () => {
    switch (type) {
      case 'no-search-results':
        return 'text-amber-600'
      case 'error':
        return 'text-red-600'
      case 'no-records':
      default:
        return 'text-blue-600'
    }
  }

  return (
    <Empty className={getBgClass()}>
      {getIcon()}
      <div>
        <h3 className={`text-lg font-semibold ${getTitleClass()}`}>{title}</h3>
        <p className={`text-sm ${getDescriptionClass()} mt-1`}>{description}</p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className={`text-xs ${getActionClass()} mt-3 px-4 py-2 rounded hover:opacity-80 transition-opacity font-medium`}
          >
            {actionText}
          </button>
        )}
      </div>
    </Empty>
  )
}
