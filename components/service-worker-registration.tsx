"use client"

import { useEffect } from "react"

/**
 * Service Worker Registration Component
 * Registers the service worker and handles updates.
 * This should be included in the root layout.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return

    if (process.env.NODE_ENV !== "production") {
      // Prevent stale SW cache from interfering with development hydration.
      navigator.serviceWorker
        ?.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => undefined)

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => undefined)
      }

      return
    }

    if (!("serviceWorker" in navigator)) {
      console.log("[PWA] Service workers not supported")
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js", {
          scope: "/",
        })

        console.log("[PWA] Service Worker registered with scope:", registration.scope)

        // Check for updates periodically (every 60 minutes)
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Ask the waiting worker to activate immediately.
              newWorker.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })

        // If a waiting worker already exists (from a previous load), activate it now.
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error)
      }
    }

    // Register after the page loads to not block initial render
    if (document.readyState === "complete") {
      registerSW()
    } else {
      window.addEventListener("load", registerSW)
      return () => window.removeEventListener("load", registerSW)
    }
  }, [])

  useEffect(() => {
    let hasRefreshed = false

    const handleControllerChange = () => {
      if (hasRefreshed) return
      hasRefreshed = true
      window.location.reload()
    }

    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange)

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange)
    }
  }, [])

  // Also add online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      console.log("[PWA] Connection restored")
      // Could trigger a sync here
    }

    const handleOffline = () => {
      console.log("[PWA] Connection lost")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return null
}
