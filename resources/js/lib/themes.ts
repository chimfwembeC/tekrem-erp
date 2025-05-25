export type Theme = "light" | "dark" | "system";

export const themes = [
  {
    name: "light",
    label: "Light",
    activeClass: "light",
    icon: "sun",
    color: "#ffffff",
  },
  {
    name: "dark",
    label: "Dark",
    activeClass: "dark",
    icon: "moon",
    color: "#09090b",
  },
  {
    name: "system",
    label: "System",
    activeClass: "",
    icon: "laptop",
    color: "transparent",
  },
] as const;

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const storedTheme = localStorage.getItem("tekrem-ui-theme") as Theme | null;

  if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
    return storedTheme;
  }

  return "system";
}

export function setTheme(theme: Theme) {
  const root = window.document.documentElement;

  // Remove all theme classes
  root.classList.remove("light", "dark");

  // If theme is system, check system preference
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    root.classList.add(systemTheme);
    localStorage.setItem("tekrem-ui-theme", "system");
    return;
  }

  // Otherwise add the specified theme class
  root.classList.add(theme);
  localStorage.setItem("tekrem-ui-theme", theme);
}

// Initialize theme on page load
export function initializeTheme() {
  if (typeof window === "undefined") return;

  // Set up system theme change listener
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function handleChange() {
    const theme = getTheme();
    if (theme === "system") {
      setTheme("system");
    }
  }

  mediaQuery.addEventListener("change", handleChange);

  // Initial setup
  setTheme(getTheme());

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}
