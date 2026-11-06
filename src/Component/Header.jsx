import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/prescripto_assets/assets/assets_frontend/assets";
import { useDoctors } from "../Hooks/useAppointment"; // apna sahi path likhein

function Header() {
  // Asli numbers backend se (list load na ho to stats chhupe rehte hain)
  const { data: doctors = [] } = useDoctors();

  const specialityCount = useMemo(
    () => new Set(doctors.map((d) => d.specialization).filter(Boolean)).size,
    [doctors]
  );

  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary px-6 md:px-10 lg:px-16">
      {/* Halke background circles (sirf depth ke liye) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/5"
      />

      <div className="relative flex flex-col md:flex-row items-center">
        {/* ----- Left side */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left gap-5 py-12 md:py-20 lg:py-24">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white font-semibold leading-tight">
            Book an appointment
            <br />
            with trusted doctors
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-white/90 text-sm font-light">
            <img className="w-24 shrink-0" src={assets.group_profiles} alt="" />
            <p className="max-w-sm leading-relaxed">
              Browse our verified specialists, pick a time that suits you, and
              confirm your visit in a few clicks.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
            <a
              href="#specility"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-700 transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Book appointment
              <img className="w-3" src={assets.arrow_icon} alt="" />
            </a>
            <Link
              to="/doctors"
              className="inline-flex items-center rounded-full border border-white/60 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              View all doctors
            </Link>
          </div>

          {doctors.length > 0 && (
            <dl className="flex items-center gap-8 mt-4 pt-6 border-t border-white/20 text-white">
              <div>
                <dd className="text-2xl font-semibold leading-none">{doctors.length}</dd>
                <dt className="text-xs text-white/70 mt-1.5">Verified doctors</dt>
              </div>
              {specialityCount > 0 && (
                <div>
                  <dd className="text-2xl font-semibold leading-none">{specialityCount}</dd>
                  <dt className="text-xs text-white/70 mt-1.5">Specialities</dt>
                </div>
              )}
              <div>
                <dd className="text-2xl font-semibold leading-none">Same day</dd>
                <dt className="text-xs text-white/70 mt-1.5">Booking available</dt>
              </div>
            </dl>
          )}
        </div>

        {/* ------ Right side */}
        <div className="md:w-1/2 flex items-end justify-center self-stretch">
          <img
            className="w-full max-w-lg h-auto object-contain"
            src={assets.header_img}
            alt="Doctors ready to help"
          />
        </div>
      </div>
    </section>
  );
}

export default Header;