import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "../../contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[#00f0ff] transition-all"
      title="Toggle Theme Mode"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
