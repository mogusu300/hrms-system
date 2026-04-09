"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">You&apos;re Offline</CardTitle>
          <CardDescription className="text-base">
            It seems you&apos;ve lost your internet connection. Don&apos;t worry — your work is saved locally and will
            sync automatically when you&apos;re back online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm">What you can do offline:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View previously loaded data</li>
              <li>• Fill out request forms (will submit when online)</li>
              <li>• Access cached pages</li>
            </ul>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full rounded-xl"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This page will automatically refresh when your connection is restored.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
