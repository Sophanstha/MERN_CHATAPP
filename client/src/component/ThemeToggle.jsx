import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
        isDark
          ? "bg-slate-700 text-yellow-400 hover:bg-slate-600 shadow-md"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
