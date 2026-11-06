import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDoctors } from "../Hooks/useAppointment"; // apna sahi path likhein

const CURRENCY = "Rs.";

const normalize = (s) => String(s || "").trim().toLowerCase();

function getImageUrl(image) {
  if (!image) return "";
  return typeof image === "string" ? image : image.url || "";
}

function initials(name = "") {
  return (
    name
      .replace(/^dr\.?\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "Dr"
  );
}

// Har photo ka size ek jaisa: fixed ratio + object-cover (chehra upar se dikhe)
function CardPhoto({ url, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="aspect-[4/5] w-full overflow-hidden bg-indigo-50">
      {!url || failed ? (
        <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-primary">
          {initials(name)}
        </div>
      ) : (
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      )}
    </div>
  );
}

function DoctorCard({ doctor, onOpen }) {
  const name = doctor.user?.name || "Doctor";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <CardPhoto url={getImageUrl(doctor.image)} name={name} />

      <div className="flex flex-1 flex-col p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Available
        </span>

        <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-1">{name}</h3>
        <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
          {doctor.specialization || "Specialist"}
        </p>

        {/* mt-auto: fee aur button har card mein neeche ek hi jagah rehte hain */}
        <div className="mt-auto pt-4">
          <p className="mb-3 min-h-[1.25rem] text-sm text-gray-500">
            {doctor.fee !== undefined && doctor.fee !== null && (
              <>
                Consultation fee{" "}
                <span className="font-semibold text-gray-900">
                  {CURRENCY} {doctor.fee}
                </span>
              </>
            )}
          </p>

          {/* Card pehle se <button> hai, is liye andar span se button jaisa look */}
          <span className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-all group-hover:brightness-90">
            Book appointment
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

function CardSkeletons() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 animate-pulse">
          <div className="aspect-[4/5] w-full bg-gray-200" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </>
  );
}

function Doctor() {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [showfilter, setshowFilter] = useState(false);

  const { data: doctors = [], isLoading, isError, refetch } = useDoctors();

  // Sidebar ki list doctors ke asli data se (duplicate hata kar)
  const specialities = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => {
      const name = d.specialization?.trim();
      if (name && !map.has(normalize(name))) map.set(normalize(name), name);
    });
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filterDoc = useMemo(() => {
    if (!speciality) return doctors;
    return doctors.filter((d) => normalize(d.specialization) === normalize(speciality));
  }, [doctors, speciality]);

  const toggleSpeciality = (s) => {
    if (normalize(speciality) === normalize(s)) navigate("/doctors");
    else navigate(`/doctors/${encodeURIComponent(s)}`);
    setshowFilter(false);
  };

  return (
    <div className="pb-16">
      <div className="mt-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {speciality ? decodeURIComponent(speciality) : "All doctors"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading
            ? "Loading doctors..."
            : `${filterDoc.length} ${filterDoc.length === 1 ? "doctor" : "doctors"} available. Select one to see times and book.`}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Filters */}
        <div className="sm:w-52 sm:shrink-0">
          <button
            type="button"
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors sm:hidden ${
              showfilter ? "border-primary bg-primary text-white" : "border-gray-300 text-gray-700"
            }`}
            onClick={() => setshowFilter((prev) => !prev)}
          >
            Filter by speciality
          </button>

          <div
            className={`mt-3 flex-col gap-2 sm:mt-0 sm:flex ${showfilter ? "flex" : "hidden"}`}
          >
            <button
              type="button"
              onClick={() => navigate("/doctors")}
              className={`rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                !speciality
                  ? "border-primary bg-indigo-50 text-primary font-medium"
                  : "border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              All doctors
            </button>
            {specialities.map((s) => {
              const active = normalize(speciality) === normalize(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpeciality(s)}
                  className={`rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-primary bg-indigo-50 text-primary font-medium"
                      : "border-gray-200 text-gray-600 hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctors grid */}
        <div className="w-full">
          {isError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">We could not load the doctors.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && filterDoc.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-base font-medium text-gray-900">No doctors found</p>
              <p className="mt-1 text-sm text-gray-500">
                There are no doctors in this speciality yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-white"
              >
                Show all doctors
              </button>
            </div>
          )}

          {/* items-stretch + h-full: sab cards ki height barabar */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-stretch gap-5">
            {isLoading ? (
              <CardSkeletons />
            ) : (
              filterDoc.map((item) => (
                <DoctorCard
                  key={item._id}
                  doctor={item}
                  onOpen={() => navigate(`/appointment/${item._id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctor;