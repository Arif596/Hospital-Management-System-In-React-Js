import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDoctor,
  useDoctors,
  useBookedSlots,
  useBookAppointment,
} from "../Hooks/useAppointment"; // apna sahi path likhein

// Currency ka label yahan se badal sakte hain
const CURRENCY = "Rs.";
// Booking ke baad patient ko jahan bhejna hai (apna route likhein)
const AFTER_BOOKING_ROUTE = "/my-appointments";
// Kitne din aage tak dates dikhani hain
const DAYS_AHEAD = 21;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");

// Local date -> "YYYY-MM-DD" (toISOString UTC deta hai, is liye khud banaya)
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "10:00 am" / "2:30 PM" / "14:00" -> minutes. Samajh na aaye to null.
function slotToMinutes(slot) {
  const m = String(slot || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const p = m[3]?.toLowerCase();
  if (p === "pm" && h < 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return h * 60 + min;
}

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

// ---------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------
function DoctorPhoto({ url, name, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-indigo-50 text-primary font-semibold ${className}`}
        aria-label={name}
      >
        <span className="text-4xl">{initials(name)}</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      onError={() => setFailed(true)}
      className={`object-cover bg-indigo-50 ${className}`}
    />
  );
}

function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 text-primary shrink-0"
      fill="currentColor"
      aria-label="Verified doctor"
    >
      <path d="M12 2l2.4 1.8 3-.2 1.2 2.8 2.6 1.5-.7 2.9L21.5 13l-1.9 2.4.2 3-2.9 1-1.7 2.5-2.9-1-2.9 1-1.7-2.5-2.9-1 .2-3L2.5 13l1.9-1.7-.7-2.9L6.3 6.9l1.2-2.8 3 .2L12 2z" />
      <path
        d="M8.5 12.2l2.5 2.5 4.7-4.9"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex-1 min-w-[120px] rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="animate-pulse mt-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-64 h-64 rounded-2xl bg-gray-200" />
        <div className="flex-1 rounded-2xl border border-gray-200 p-8 space-y-4">
          <div className="h-7 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function Appointment() {
  const { docId } = useParams();
  const navigate = useNavigate();

  const { data: doctor, isLoading, isError } = useDoctor(docId);
  const { data: bookedSlots = [] } = useBookedSlots(docId);
  const { data: allDoctors = [] } = useDoctors();
  const booking = useBookAppointment();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");

  const name = doctor?.user?.name || "Doctor";
  const imageUrl = getImageUrl(doctor?.image);

  // Doctor ke working days ke hisaab se agli dates
  const days = useMemo(() => {
    if (!doctor?.availableDays?.length) return [];
    const working = doctor.availableDays.map((d) => String(d).slice(0, 3).toLowerCase());
    const list = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (working.includes(DAY_KEYS[d.getDay()])) {
        list.push({
          ymd: toYMD(d),
          day: DAY_LABELS[d.getDay()],
          num: d.getDate(),
          month: d.toLocaleString("en-US", { month: "short" }),
          isToday: i === 0,
        });
      }
    }
    return list;
  }, [doctor]);

  // Pehli available date khud select ho jaye
  useEffect(() => {
    if (days.length && !days.some((d) => d.ymd === selectedDate)) {
      setSelectedDate(days[0].ymd);
      setSelectedSlot("");
    }
  }, [days, selectedDate]);

  // Bhari hui slots ka lookup
  const bookedSet = useMemo(
    () => new Set(bookedSlots.map((s) => `${s.date}|${s.timeSlot}`)),
    [bookedSlots]
  );

  // Har slot ki halat: free / booked / past
  const slotStates = useMemo(() => {
    if (!doctor?.timeSlots || !selectedDate) return [];
    const now = new Date();
    const isToday = selectedDate === toYMD(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();

    return doctor.timeSlots.map((slot) => {
      const mins = slotToMinutes(slot);
      const past = isToday && mins !== null && mins <= nowMin;
      const taken = bookedSet.has(`${selectedDate}|${slot}`);
      return { slot, taken, past, disabled: taken || past };
    });
  }, [doctor, selectedDate, bookedSet]);

  // Related doctors (isi specialization ke)
  const related = useMemo(
    () =>
      allDoctors
        .filter((d) => d._id !== docId && d.specialization === doctor?.specialization)
        .slice(0, 4),
    [allDoctors, doctor, docId]
  );

  const selectedDay = days.find((d) => d.ymd === selectedDate);
  const canBook = Boolean(selectedDate && selectedSlot) && !booking.isPending;

  const handleBook = () => {
    if (!canBook) return;
    booking.mutate(
      {
        doctorId: docId,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedSlot("");
          setReason("");
          navigate(AFTER_BOOKING_ROUTE);
        },
      }
    );
  };

  // ---------------- States ----------------
  if (isLoading) return <PageSkeleton />;

  if (isError || !doctor) {
    return (
      <div className="mt-16 text-center">
        <p className="text-lg font-medium text-gray-900">Doctor not found</p>
        <p className="text-sm text-gray-500 mt-1">
          This doctor may have been removed, or the link is incorrect.
        </p>
        <Link
          to="/doctors"
          className="inline-block mt-5 px-6 py-2.5 rounded-full bg-primary text-white text-sm"
        >
          Browse all doctors
        </Link>
      </div>
    );
  }

  // ---------------- Page ----------------
  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mt-4" aria-label="Breadcrumb">
        <Link to="/doctors" className="hover:text-primary">
          All doctors
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{name}</span>
      </nav>

      {/* Doctor profile */}
      <section className="mt-5 flex flex-col sm:flex-row gap-6">
        <DoctorPhoto
          url={imageUrl}
          name={name}
          className="w-full sm:w-64 h-64 sm:h-auto sm:min-h-[16rem] rounded-2xl"
        />

        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{name}</h1>
            <VerifiedBadge />
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-primary text-sm font-medium">
              {doctor.specialization || "General"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Accepting appointments
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Stat
              label="Experience"
              value={
                doctor.experience !== undefined && doctor.experience !== null
                  ? `${doctor.experience} ${Number(doctor.experience) === 1 ? "year" : "years"}`
                  : "Not listed"
              }
            />
            <Stat
              label="Consultation fee"
              value={doctor.fee !== undefined ? `${CURRENCY} ${doctor.fee}` : "Not listed"}
            />
            <Stat
              label="Works on"
              value={doctor.availableDays?.length ? doctor.availableDays.join(", ") : "Not listed"}
            />
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">About</h2>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed max-w-2xl">
              {doctor.bio || "This doctor has not added a profile description yet."}
            </p>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">Book an appointment</h2>

          {days.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4">
              This doctor has no working days set, so online booking is not available right now.
            </p>
          ) : (
            <>
              {/* Date */}
              <h3 className="text-sm font-medium text-gray-700 mt-6">Choose a date</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 mt-3" role="radiogroup" aria-label="Date">
                {days.map((d) => {
                  const active = d.ymd === selectedDate;
                  return (
                    <button
                      key={d.ymd}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setSelectedDate(d.ymd);
                        setSelectedSlot("");
                      }}
                      className={`shrink-0 w-[72px] rounded-2xl py-3 text-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-200 text-gray-700 hover:border-primary"
                      }`}
                    >
                      <p className="text-xs">{d.isToday ? "Today" : d.day}</p>
                      <p className="text-xl font-semibold leading-tight">{d.num}</p>
                      <p className={`text-xs ${active ? "text-indigo-100" : "text-gray-400"}`}>
                        {d.month}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Time */}
              <h3 className="text-sm font-medium text-gray-700 mt-6">Choose a time</h3>
              {slotStates.length === 0 ? (
                <p className="text-sm text-gray-500 mt-3">No time slots set for this doctor.</p>
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3"
                  role="radiogroup"
                  aria-label="Time"
                >
                  {slotStates.map(({ slot, taken, past, disabled }) => {
                    const active = slot === selectedSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slot)}
                        title={taken ? "Already booked" : past ? "Time has passed" : ""}
                        className={`rounded-full px-4 py-2.5 text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          disabled
                            ? "bg-gray-50 border-gray-100 text-gray-300 line-through cursor-not-allowed"
                            : active
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-gray-200 text-gray-700 hover:border-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
              {slotStates.length > 0 && slotStates.every((s) => s.disabled) && (
                <p className="text-sm text-amber-600 mt-3">
                  All slots on this date are taken. Please pick another date.
                </p>
              )}

              {/* Reason */}
              <h3 className="text-sm font-medium text-gray-700 mt-6">
                Reason for visit <span className="text-gray-400 font-normal">(optional)</span>
              </h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="For example: fever for 3 days, follow-up visit"
                className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-6 h-fit lg:sticky lg:top-6">
          <h2 className="text-base font-semibold text-gray-900">Your appointment</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Doctor</dt>
              <dd className="text-gray-900 text-right">{name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-900 text-right">
                {selectedDay ? `${selectedDay.day}, ${selectedDay.num} ${selectedDay.month}` : "Not selected"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Time</dt>
              <dd className="text-gray-900 text-right">{selectedSlot || "Not selected"}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-3 border-t border-gray-100">
              <dt className="text-gray-500">Fee</dt>
              <dd className="text-gray-900 font-semibold text-right">
                {doctor.fee !== undefined ? `${CURRENCY} ${doctor.fee}` : "Not listed"}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleBook}
            disabled={!canBook}
            className="mt-6 w-full rounded-full bg-primary text-white text-sm font-medium py-3 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            {booking.isPending ? "Booking..." : "Confirm appointment"}
          </button>
          {!selectedSlot && days.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center">Pick a date and time to continue.</p>
          )}
        </aside>
      </section>

      {/* Related doctors */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-gray-900">
            More {doctor.specialization} doctors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {related.map((d) => (
              <button
                key={d._id}
                type="button"
                onClick={() => {
                  navigate(`/appointment/${d._id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <DoctorPhoto
                  url={getImageUrl(d.image)}
                  name={d.user?.name}
                  className="w-full h-40"
                />
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{d.specialization}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Appointment;