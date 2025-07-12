import { themes } from "@/types";
import { Check, Palette, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React from "react";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const [currentTheme, setCurrentTheme] = React.useState("light");

  React.useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <header className="bg-base-100 border-b border-base-300 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-sm"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm"
              title="Change theme"
            >
              <Palette className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-0 shadow-lg border border-base-300 max-h-96 overflow-hidden"
            >
              <li className="menu-title sticky top-0 z-10 bg-base-100 border-b border-base-300">
                <span>Choose Theme</span>
              </li>
              <div className="overflow-y-auto max-h-80">
                {themes.map((theme) => (
                  <li key={theme.id}>
                    <button
                      onClick={() => handleThemeChange(theme.id)}
                      className={`flex items-center gap-3 px-4 py-2 ${
                        currentTheme === theme.id ? "active" : ""
                      }`}
                    >
                      <span className="text-lg">{theme.icon}</span>
                      <span className="flex-1 break-words">{theme.name}</span>
                      {currentTheme === theme.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
