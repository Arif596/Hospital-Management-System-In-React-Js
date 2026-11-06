import "./App.css";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import MyAppointment from "./Pages/MyAppointment";
import MyProfile from "./Pages/MyProfile";
import Doctors from "./Pages/Doctors";
import Appointment from "./Pages/Appointment";
import Navbar from "./Component/Navbar";
import Footer from "./Component/Footer";
import { ProtectedRoute, GuestRoute } from "./Component/RouteGuards";
import DoctorLayout from "./Layout/DoctorLayout"
import DoctorDashboard from "./Component/Doctor/DoctorDashboard";
import DoctorAppointments from "./Component/Doctor/DoctorAppointments";
import DoctorProfile from "./Component/Doctor/DoctorProfile";

// Patient / public site ka common frame
function SiteLayout() {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Doctor panel: apna layout, patient Navbar nahi */}
        <Route element={<ProtectedRoute roles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>
        </Route>

        {/* Public + patient site */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/appointment/:docId" element={<Appointment />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute roles={["patient"]} />}>
            <Route path="/my-appointment" element={<MyAppointment />} />
            <Route path="/my-profile" element={<MyProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;