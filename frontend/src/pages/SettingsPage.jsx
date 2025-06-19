import { useEffect } from 'react';
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const THEMES = [
  { name: "White", value: "light" },
  { name: "Black", value: "dark" },
  { name: "Grey", value: "corporate" },
];

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    // Fallback: If theme is not set (e.g., on first load), default to 'dark'
    if (!theme) {
      setTheme('dark');
    }
    console.log("Applying theme:", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, setTheme]);

  const handleThemeChange = (selectedTheme) => {
    console.log("Selected theme:", selectedTheme);
    setTheme(selectedTheme);
    // localStorage.setItem('theme', selectedTheme); // Moved to useThemeStore
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        {/* Theme Selection Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface
          </p>
        </div>

        {/* Theme Buttons */}
        <div className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`btn ${theme === t.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleThemeChange(t.value)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="rounded-xl border border-base-300 overflow-hidden">
            <div className="p-4 bg-base-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                  J
                </div>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-base-content/70">Online</p>
                </div>
              </div>

              <div className="space-y-3">
                {PREVIEW_MESSAGES.map((message) => (
                  <div
                    key={message.id}
                    className={`chat ${message.isSent ? 'chat-end' : 'chat-start'}`}
                  >
                    <div
                      className={`chat-bubble ${
                        message.isSent ? 'bg-primary text-primary-content' : 'bg-base-200'
                      }`}
                    >
                      {message.content}
                      <div className="text-xs opacity-70 mt-1">
                        12:00 PM
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder="Type a message..."
                />
                <button className="btn btn-primary">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
