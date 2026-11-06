// import { Navigate, Outlet } from "react-router-dom";
// import { useMe } from "../Hooks/userAuth";

// export function ProtectedRoute() {
//   const { data: user, isLoading, isError, refetch } = useMe();

//   if (isLoading) return <p className="center-note">Loading your account...</p>;

//   // Server ya network ka masla: logout mat karo, dobara koshish ka option do
//   if (isError) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-gray-600">Could not load your account. Please try again.</p>
//         <button
//           onClick={() => refetch()}
//           className="mt-4 border border-primary px-6 py-2 rounded-full"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return user ? <Outlet /> : <Navigate to="/login" replace />;
// }

// export function GuestRoute() {
//   const { data: user, isLoading } = useMe();
//   if (isLoading) return <p className="center-note">Loading...</p>;
//   return user ? <Navigate to="/" replace /> : <Outlet />;
// }
import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../Hooks/userAuth";

// Role ke hisaab se "ghar" ka raasta
export const homeFor = (role) => (role === "doctor" ? "/doctor" : "/");

// roles optional hai: <ProtectedRoute roles={["doctor"]} />
export function ProtectedRoute({ roles }) {
  const { data: user, isLoading, isError, refetch } = useMe();

  if (isLoading) return <p className="text-center py-20 text-gray-500">Loading your account...</p>;

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Could not load your account. Please try again.</p>
        <button onClick={() => refetch()} className="mt-4 border border-primary px-6 py-2 rounded-full">
          Retry
        </button>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Login hai lekin role is page ka nahi: apne ghar bhej do
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { data: user, isLoading } = useMe();
  if (isLoading) return <p className="text-center py-20 text-gray-500">Loading...</p>;
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Outlet />;
}