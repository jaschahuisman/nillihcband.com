"use client";

import { useEffect } from "react";

/** Forces document-level dark so portaled UI (sheets, menus, toasts) inherits tokens. */
export function CrmDarkMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.colorScheme = "dark";

    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = "";
    };
  }, []);

  return null;
}
