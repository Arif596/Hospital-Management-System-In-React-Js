import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMe, useLogout } from "../Hooks/userAuth";
import { assets } from "../assets/prescripto_assets/assets/assets_frontend/assets";

const NAV = [
  { to: "/doctor", label: "Dashboard", end: true },
  { to: "/doctor/appointments", label: "Appointments" },
  { to: "/doctor/profile", label: "My Profile" },
];

// NavLink className ko ek function de sakta hai: isActive true ho to highlight
const linkClass = ({ isActive }) =>
  `px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
    isActive ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function DoctorLayout() {
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const onLogout = () =>
    logout.mutate(undefined, { onSuccess: () => navigate("/login") });

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Sidebar (mobile par upar ki patti) */}
      <aside className="md:w-64 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-gray-200 md:flex md:flex-col">
        <div className="px-5 py-4 flex items-center justify-between">
          <img src={assets.logo} className="w-36" alt="Logo" />
          <button onClick={onLogout} className="md:hidden text-sm text-red-600 font-medium">
            Logout
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 px-5 py-4 border-y bg-gray-50">
          <img
            src={user?.image || assets.profile_pic}
            alt={user?.name}
            className="w-11 h-11 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">Dr. {user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1 px-3 py-2 md:py-4 overflow-x-auto md:flex-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block p-4 border-t">
          <button
            onClick={onLogout}
            disabled={logout.isPending}
            className="w-full border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60"
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Page ka content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}