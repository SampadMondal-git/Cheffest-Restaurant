import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ----------------------------------------------------------------------
// Custom hook: detect clicks outside a given ref
// ----------------------------------------------------------------------

const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

// ----------------------------------------------------------------------
// Dropdown item component with hover and focus states
// ----------------------------------------------------------------------
type DropdownItemProps = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;   // optional icon
};

const DropdownItem: React.FC<DropdownItemProps> = ({ label, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 cursor-pointer"
      role="menuitem"
    >
      {icon && <span className="text-gray-400">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

// ----------------------------------------------------------------------
// Main UserDropdown component
// ----------------------------------------------------------------------
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  position?: string;
  avatarUrl?: string;
};

type UserDropdownProps = {
  user: User;
  onProfile?: () => void;
  onOrders?: () => void;
  onReservations?: () => void;
  onLogout?: () => void;
  onDashboard?: () => void;
};

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onProfile = () => alert("Profile clicked"),
  onOrders = () => alert("Orders clicked"),
  onReservations = () => alert("Reservations clicked"),
  onLogout = () => alert("Logout clicked"),
  onDashboard,
}) => {
  const navigate = useNavigate();
  const handleDashboard = () => {
    if (onDashboard) {
      onDashboard();
    } else {
      navigate("/dashboard");
    }
  };
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, useCallback(() => setOpen(false), []));

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus first menu item when dropdown opens
  useEffect(() => {
    if (open && menuRef.current) {
      const firstItem = menuRef.current.querySelector(
        '[role="menuitem"]'
      ) as HTMLElement;
      firstItem?.focus();
    }
  }, [open]);

  const toggleDropdown = () => setOpen((prev) => !prev);

  // Get user initial for avatar fallback
  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Avatar / User Icon */}
      <button
        onClick={toggleDropdown}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ff9900] cursor-pointer hover:ring-0.5 hover:ring-offset-2 focus:outline-none transition-all duration-200 shadow-sm"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-medium text-sm">{userInitial}</span>
        )}
      </button>

      {/* Dropdown Menu with animation */}
      <div
        className={`
          absolute right-0 mt-3 w-64 origin-top-right
          transition-all duration-200 ease-out
          ${open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}
        `}
      >
        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 focus:outline-none overflow-hidden"
          >
            {/* Profile section */}
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <DropdownItem
                label="Profile"
                onClick={() => {
                  onProfile();
                  setOpen(false);
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              {user.role === "admin" && (
                <DropdownItem
                  label="Dashboard"
                  onClick={() => {
                    // replace with real handler
                    handleDashboard();
                    setOpen(false);
                  }}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zM3 21h8v-6H3v6zm10-8h8V3h-8v10z" />
                    </svg>
                  }
                />
              )}
              <DropdownItem
                label="Orders"
                onClick={() => {
                  onOrders();
                  setOpen(false);
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
              <DropdownItem
                label="Reservations"
                onClick={() => {
                  onReservations();
                  setOpen(false);
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <DropdownItem
                label="Logout"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;