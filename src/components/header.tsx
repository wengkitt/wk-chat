import React from "react";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const themes = [
  { id: "light", name: "Light", icon: "☀️" },
  { id: "dark", name: "Dark", icon: "🌙" },
  { id: "cupcake", name: "Cupcake", icon: "🧁" },
  { id: "bumblebee", name: "Bumblebee", icon: "🐝" },
  { id: "emerald", name: "Emerald", icon: "💚" },
  { id: "corporate", name: "Corporate", icon: "🏢" },
  { id: "synthwave", name: "Synthwave", icon: "🌆" },
  { id: "retro", name: "Retro", icon: "📼" },
  { id: "cyberpunk", name: "Cyberpunk", icon: "🤖" },
  { id: "valentine", name: "Valentine", icon: "💝" },
  { id: "halloween", name: "Halloween", icon: "🎃" },
  { id: "garden", name: "Garden", icon: "🌸" },
  { id: "forest", name: "Forest", icon: "🌲" },
  { id: "aqua", name: "Aqua", icon: "🌊" },
  { id: "lofi", name: "Lo-Fi", icon: "🎵" },
  { id: "pastel", name: "Pastel", icon: "🎨" },
  { id: "fantasy", name: "Fantasy", icon: "🧚" },
  { id: "wireframe", name: "Wireframe", icon: "📐" },
  { id: "black", name: "Black", icon: "⚫" },
  { id: "luxury", name: "Luxury", icon: "💎" },
  { id: "dracula", name: "Dracula", icon: "🧛" },
  { id: "cmyk", name: "CMYK", icon: "🖨️" },
  { id: "autumn", name: "Autumn", icon: "🍂" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "acid", name: "Acid", icon: "🧪" },
  { id: "lemonade", name: "Lemonade", icon: "🍋" },
  { id: "night", name: "Night", icon: "🌃" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "winter", name: "Winter", icon: "❄️" },
  { id: "dim", name: "Dim", icon: "🔅" },
  { id: "nord", name: "Nord", icon: "🏔️" },
  { id: "sunset", name: "Sunset", icon: "🌅" },
];

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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
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
                    <a
                      onClick={() => handleThemeChange(theme.id)}
                      className={`flex items-center gap-3 px-4 py-2 ${
                        currentTheme === theme.id ? "active" : ""
                      }`}
                    >
                      <span className="text-lg">{theme.icon}</span>
                      <span className="flex-1 break-words">{theme.name}</span>
                      {currentTheme === theme.id && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </a>
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
