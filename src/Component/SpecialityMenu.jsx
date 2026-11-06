import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { specialityData } from "../assets/prescripto_assets/assets/assets_frontend/assets";
import { useDoctors } from "../Hooks/useAppointment"; // apna sahi path likhein

// Purani icons ko naam se match karne ke liye (spelling/case ka farq chal jata hai)
const normalize = (s) => String(s || "").trim().toLowerCase();
const iconFor = (name) =>
  specialityData.find((s) => normalize(s.speciality) === normalize(name))?.image;

function SpecialityCard({ name, count }) {
  const icon = iconFor(name);

  return (
    <Link
      to={`/doctors/${encodeURIComponent(name)}`}
      onClick={() => window.scrollTo(0, 0)}
      className="group shrink-0 w-36 sm:w-auto flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-indigo-50 transition-colors group-hover:bg-indigo-100">
        {icon ? (
          <img className="h-10 w-10 sm:h-12 sm:w-12 object-contain" src={icon} alt="" />
        ) : (
          <span className="text-xl font-semibold text-primary">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-900">{name}</p>
      <p className="mt-1 text-xs text-gray-500">
        {count} {count === 1 ? "doctor" : "doctors"}
      </p>
    </Link>
  );
}

function SkeletonCards() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="shrink-0 w-36 sm:w-auto rounded-2xl border border-gray-200 px-4 py-6 animate-pulse"
        >
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-200" />
          <div className="mx-auto mt-4 h-3 w-20 rounded bg-gray-200" />
          <div className="mx-auto mt-2 h-3 w-12 rounded bg-gray-100" />
        </div>
      ))}
    </>
  );
}

function SpecialityMenu() {
  const { data: doctors = [], isLoading } = useDoctors();

  // Asli doctors se speciality aur un ki tadaad (duplicate nahi)
  const specialities = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => {
      const name = d.specialization?.trim();
      if (!name) return;
      const key = normalize(name);
      const entry = map.get(key);
      if (entry) entry.count += 1;
      else map.set(key, { name, count: 1 });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [doctors]);

  // Load hone ke baad koi doctor hi na ho to section chhupa do
  if (!isLoading && specialities.length === 0) return null;

  return (
    <section id="speciality" className="py-16 text-gray-800">
      <div className="text-center">
        <h2 className="text-3xl font-medium text-gray-900">Find by speciality</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 leading-relaxed">
          Choose a speciality to see the doctors available and book a time that suits you.
        </p>
      </div>

      <div className="mt-10 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:overflow-visible">
        {isLoading ? (
          <SkeletonCards />
        ) : (
          specialities.map((s) => <SpecialityCard key={s.name} name={s.name} count={s.count} />)
        )}
      </div>
    </section>
  );
}

export default SpecialityMenu;