"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description: string
  helpText?: string
  children?: React.ReactNode
}

/**
 * Reusable page header with title, description, and optional help tooltip.
 * Satisfies Section B Wireframe requirement: "Each screen should have description to guide the users"
 */
export function PageHeader({ title, description, helpText, children }: PageHeaderProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">{title}</h1>
            {helpText && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary flex-shrink-0"
                onClick={() => setShowHelp(!showHelp)}
                aria-label="Show help"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
        )}
      </div>

      {/* Help panel */}
      {showHelp && helpText && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/80 whitespace-pre-line">{helpText}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => setShowHelp(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
