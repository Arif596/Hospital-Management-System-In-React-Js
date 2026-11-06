import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { assets } from "../assets/prescripto_assets/assets/assets_frontend/assets";
import { useLogout, useMe } from "../Hooks/userAuth";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "All Doctors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Desktop links: active page par halka rang ka pill
const desktopLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary/10 text-primary"
      : "text-gray-600 hover:text-primary hover:bg-gray-100"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const avatar = user?.image || assets.profile_pic;

  // Page badalne par dono menu band
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Dropdown: bahar click ya Esc se band
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Mobile drawer khula ho to piche ki page scroll band
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const onLogout = () => {
    setMenuOpen(false);
    setDrawerOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/login");
      },
      onError: () => toast.error("Could not log out. Please try again."),
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-200 mb-5">
      <nav className="flex items-center justify-between py-3">
        {/* Logo */}
        <img
          onClick={() => navigate("/")}
          className="w-40 sm:w-44 cursor-pointer"
          src={assets.logo}
          alt="Logo"
        />

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={desktopLinkClass}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div
              className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"
              aria-hidden="true"
            />
          ) : user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition-colors"
              >
                <img
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
                  src={avatar}
                  alt={user.name}
                />
                <img
                  className={`w-2.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  src={assets.dropdown_icon}
                  alt=""
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border-b">
                    <img
                      className="w-11 h-11 rounded-full object-cover"
                      src={avatar}
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="py-2 text-sm text-gray-700">
                    {user.role === "doctor" ? (
                      <button
                        role="menuitem"
                        onClick={() => navigate("/doctor")}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100"
                      >
                        Doctor Panel
                      </button>
                    ) : (
                      <>
                        <button
                          role="menuitem"
                          onClick={() => navigate("/my-profile")}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-100"
                        >
                          My Profile
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => navigate("/my-appointment")}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-100"
                        >
                          My Appointments
                        </button>
                      </>
                    )}
                    <div className="my-1 border-t" />
                    <button
                      role="menuitem"
                      onClick={onLogout}
                      disabled={logout.isPending}
                      className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {logout.isPending ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block bg-primary text-white px-7 py-2.5 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <img className="w-6" src={assets.menu_icon} alt="" />
          </button>
        </div>
      </nav>

      {/* ---- Mobile drawer ---- */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        {/* Andhera overlay */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <img className="w-32" src={assets.logo} alt="Logo" />
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <img className="w-6" src={assets.cross_icon} alt="" />
            </button>
          </div>

          {!isLoading && user && (
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={avatar}
                alt={user.name}
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={mobileLinkClass}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {user && (
              <>
                <li>
                  <NavLink to="/my-profile" className={mobileLinkClass}>
                    My Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/my-appointment" className={mobileLinkClass}>
                    My Appointments
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {!isLoading && (
            <div className="p-4 border-t">
              {user ? (
                <button
                  onClick={onLogout}
                  disabled={logout.isPending}
                  className="w-full border border-red-300 text-red-600 py-2.5 rounded-full font-medium hover:bg-red-50 disabled:opacity-60"
                >
                  {logout.isPending ? "Logging out..." : "Logout"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary text-white py-2.5 rounded-full font-medium hover:opacity-90"
                >
                  Login / Create Account
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </header>
  );
}

export default Navbar;
