"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ComingSoonProps {
  title?: string
  description?: string
  backLink?: string
  backLabel?: string
}

export function ComingSoon({
  title = "Coming Soon",
  description = "This feature is currently under development. We're working hard to bring you something amazing!",
  backLink = "/dashboard",
  backLabel = "Back to Dashboard",
}: ComingSoonProps) {
  const router = useRouter()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-12 text-center space-y-8 shadow-xl">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground text-balance">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button onClick={() => router.back()} variant="outline" className="gap-2 min-w-[160px]">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link href={backLink}>
            <Button className="gap-2 min-w-[160px]">{backLabel}</Button>
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="pt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </Card>
    </div>
  )
}
