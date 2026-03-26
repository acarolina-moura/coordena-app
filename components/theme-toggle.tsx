"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 text-gray-400 invisible">
        <Sun className="h-4 w-4 shrink-0" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0 text-yellow-500 transition-colors" />
      ) : (
        <Moon className="h-4 w-4 shrink-0 text-slate-700 transition-colors" />
      )}
    </button>
  )
}
