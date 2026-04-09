"use client"

import { useState } from "react"
import { Download, Smartphone, X, Share, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * PWA Install Button
 * Shows "Install Mobile App" button when the app is installable.
 * On iOS, shows manual instructions since Safari doesn't support beforeinstallprompt.
 */
export function PWAInstallButton({ variant = "default" }: { variant?: "default" | "sidebar" | "banner" }) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()
  const [showIOSDialog, setShowIOSDialog] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null

  // Don't show if not installable and not iOS
  if (!isInstallable && !isIOS) return null

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSDialog(true)
      return
    }
    await promptInstall()
  }

  // Sidebar variant - compact button
  if (variant === "sidebar") {
    return (
      <>
        <button
          onClick={handleInstall}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Smartphone className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">Install App</span>
          <Download className="w-4 h-4" />
        </button>
        <IOSInstallDialog open={showIOSDialog} onOpenChange={setShowIOSDialog} />
      </>
    )
  }

  // Banner variant - full-width banner at top/bottom
  if (variant === "banner") {
    return (
      <>
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Smartphone className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Install MWSC ERP App</p>
              <p className="text-xs opacity-80 truncate">Access the app from your home screen</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="rounded-lg text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <IOSInstallDialog open={showIOSDialog} onOpenChange={setShowIOSDialog} />
      </>
    )
  }

  // Default variant - standalone button
  return (
    <>
      <Button onClick={handleInstall} className="rounded-xl gap-2" variant="outline">
        <Download className="w-4 h-4" />
        Install Mobile App
      </Button>
      <IOSInstallDialog open={showIOSDialog} onOpenChange={setShowIOSDialog} />
    </>
  )
}

/**
 * iOS-specific installation instructions dialog
 */
function IOSInstallDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Install on iOS
          </DialogTitle>
          <DialogDescription>
            Follow these steps to add MWSC ERP to your home screen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
              1
            </div>
            <div>
              <p className="text-sm font-medium">Tap the Share button</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Look for the <Share className="w-3 h-3 inline" /> icon in your browser&apos;s toolbar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
              2
            </div>
            <div>
              <p className="text-sm font-medium">Scroll down and tap &quot;Add to Home Screen&quot;</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Look for the <Plus className="w-3 h-3 inline" /> icon next to &quot;Add to Home Screen&quot;
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
              3
            </div>
            <div>
              <p className="text-sm font-medium">Tap &quot;Add&quot; to confirm</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The MWSC ERP app icon will appear on your home screen
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full rounded-xl">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  )
}
