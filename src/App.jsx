import "./App.css";
import { Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <>
      <div className="mx-4 sm:mx-[10%]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/my-appointment" element={<MyAppointment />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
