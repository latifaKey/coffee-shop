"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "dark" | "light";

type Ctx = {
  mode: ThemeMode;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode: ThemeMode = "dark";
  const [mounted, setMounted] = useState(false);

  // Set mounted state after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme after component mounts
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    
    // Set theme without transitions on first load
    root.classList.add("theme-init");
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = "dark";
    
    // Remove transition blocker after theme is applied
    const timer = window.setTimeout(() => {
      root.classList.remove("theme-init");
    }, 100);
    
    try { 
      localStorage.removeItem("theme"); 
    } catch {}
    
    return () => window.clearTimeout(timer);
  }, [mode, mounted]);

  const value = useMemo(() => ({ mode }), [mode]);
  
  // Render children immediately but theme changes happen after mount
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
