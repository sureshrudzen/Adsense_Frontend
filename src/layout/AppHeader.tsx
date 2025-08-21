import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar Toggle */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.2 7.28C5.93 6.99 5.93 6.51 6.22 6.22C6.51 5.93 6.99 5.93 7.28 6.22L12 10.94L16.72 6.22C17.01 5.93 17.49 5.93 17.78 6.22C18.07 6.51 18.07 6.99 17.78 7.28L13.06 12L17.78 16.72C18.07 17.01 18.07 17.49 17.78 17.78C17.49 18.07 17.01 18.07 16.72 17.78L12 13.06L7.28 17.78C6.99 18.07 6.51 18.07 6.22 17.78C5.93 17.49 5.93 17.01 6.22 16.72L10.94 12L6.22 7.28Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.58 1C0.58 0.59 0.92 0.25 1.33 0.25H14.67C15.08 0.25 15.42 0.59 15.42 1C15.42 1.41 15.08 1.75 14.67 1.75H1.33C0.92 1.75 0.58 1.41 0.58 1ZM0.58 11C0.58 10.59 0.92 10.25 1.33 10.25H14.67C15.08 10.25 15.42 10.59 15.42 11C15.42 11.41 15.08 11.75 14.67 11.75H1.33C0.92 11.75 0.58 11.41 0.58 11ZM1.33 5.25C0.92 5.25 0.58 5.59 0.58 6C0.58 6.41 0.92 6.75 1.33 6.75H8C8.41 6.75 8.75 6.41 8.75 6C8.75 5.59 8.41 5.25 8 5.25H1.33Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" />
          </Link>
        </div>

        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* Dark Mode Toggler */}
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
