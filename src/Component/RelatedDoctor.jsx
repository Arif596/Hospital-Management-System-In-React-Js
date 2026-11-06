import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctors } from "../Hooks/useAppointment"; // apna sahi path likhein

const CURRENCY = "Rs.";
// Kitne related doctors dikhane hain
const RELATED_COUNT = 4;

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

function RelatedDoctor({ speciality, docId }) {
  const navigate = useNavigate();
  const { data: doctors = [], isLoading } = useDoctors();

  // Isi speciality ke doctors (jo abhi khula hai wo nahi)
  const related = useMemo(() => {
    if (!speciality) return [];
    return doctors.filter(
      (d) => normalize(d.specialization) === normalize(speciality) && d._id !== docId
    );
  }, [doctors, speciality, docId]);

  // Koi related doctor na ho to section dikhane ki zaroorat nahi
  if (isLoading || related.length === 0) return null;

  const shown = related.slice(0, RELATED_COUNT);

  return (
    <section className="my-16 md:mx-10 text-gray-900">
      <div className="text-center">
        <h2 className="text-3xl font-medium">More {speciality} doctors</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-600 leading-relaxed">
          Not sure about this one? Compare other doctors in the same speciality.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-stretch gap-5 px-3 sm:px-0">
        {shown.map((item) => (
          <DoctorCard
            key={item._id}
            doctor={item}
            onOpen={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ))}
      </div>

      {related.length > RELATED_COUNT && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => {
              navigate(`/doctors/${encodeURIComponent(speciality)}`);
              window.scrollTo(0, 0);
            }}
            className="rounded-full border border-primary px-10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            View all {speciality} doctors
          </button>
        </div>
      )}
    </section>
  );
}

export default RelatedDoctor;