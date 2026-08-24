import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../src/assets/logo.png";
import UserDropdown from "../user/user";
import { ShoppingCart, Home, Info, Utensils, Calendar, Phone } from "lucide-react";
import { useCart } from "../../src/contexts/CartContext";
import { useAuth } from "../../src/contexts/AuthContext";

function MobileTopBar() {
  const { itemCount, toggle } = useCart();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full items-center justify-between md:hidden">
      <NavLink to="/">
        <img src={logo} alt="Logo" className="h-14 cursor-pointer sm:h-16" />
      </NavLink>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="relative flex items-center justify-center rounded-full border border-white/10 bg-white/10 p-2 text-white transition-all duration-300 hover:border-[#ff9900]/60 hover:bg-[#ff9900]/10 hover:text-[#ff9900]"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {(itemCount ?? 0) > -1 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff9900] text-[10px] font-bold text-black">
              {itemCount}
            </span>
          )}
        </button>

        {token && user ? (
          <UserDropdown user={user} onLogout={handleLogout} />
        ) : (
          <NavLink
            to="/login"
            className="flex items-center justify-center rounded-full bg-[#ff9900] px-4 py-2 text-sm font-bold uppercase text-black transition-all duration-300 hover:bg-[#e88c02]"
          >
            Login
          </NavLink>
        )}
      </div>
    </div>
  );
}

function MobileBottomNav({ links }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide transition-all duration-200 ${
                  isActive ? "text-[#ff9900]" : "text-white/70 hover:text-[#ff9900]"
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { itemCount, toggle } = useCart();
  const { user, token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Menu", path: "/menu", icon: Utensils },
    { name: "Reservation", path: "/reservation", icon: Calendar },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkClick = () => setIsMenuOpen(false);

  const renderDesktopLinks = () => (
    <>
      {links.map((link) => (
        <li key={link.name}>
          <NavLink
            to={link.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `transition-all duration-300 cursor-pointer ${
                isActive ? "text-[#ff9900]" : "text-white/90 hover:text-[#ff9900]"
              }`
            }
          >
            {link.name}
          </NavLink>
        </li>
      ))}

      <li>
        <button
          onClick={toggle}
          className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white/90 transition-all duration-300 hover:border-[#ff9900]/60 hover:bg-[#ff9900]/10 hover:text-[#ff9900] cursor-pointer"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Cart</span>
          {(itemCount ?? 0) > -1 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff9900] text-[10px] font-bold text-black">
              {itemCount}
            </span>
          )}
        </button>
      </li>

      <li>
        {token && user ? (
          <UserDropdown user={user} onLogout={handleLogout} />
        ) : (
          <NavLink
            to="/login"
            onClick={handleLinkClick}
            className="inline-flex items-center rounded-full bg-[#ff9900] px-5 py-2.5 text-sm font-bold uppercase text-black transition-all duration-300 hover:bg-[#e88c02]"
          >
            Login
          </NavLink>
        )}
      </li>
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <NavLink to="/" onClick={handleLinkClick} className="hidden md:block">
            <img src={logo} alt="Logo" className="h-16 cursor-pointer sm:h-20" />
          </NavLink>

          <div className="hidden items-center gap-6 text-white uppercase tracking-wide md:flex">
            <ul className="flex items-center gap-6">
              {renderDesktopLinks()}
            </ul>
          </div>

          <MobileTopBar />
        </div>
      </nav>

      <MobileBottomNav links={links} />

      {/* <div className="h-14 md:hidden" /> */}
    </>
  );
}

export default Navbar;