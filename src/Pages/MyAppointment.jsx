import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMyAppointments, useCancelAppointment } from "../Hooks/useAppointment"; // apna sahi path likhein

const CURRENCY = "Rs.";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function slotToMinutes(slot) {
  const m = String(slot || "").trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const p = m[3]?.toLowerCase();
  if (p === "pm" && h < 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return h * 60 + Number(m[2]);
}

function formatDate(ymd) {
  const d = new Date(`${ymd}T00:00:00`);
  if (isNaN(d)) return ymd;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

const STATUS_STYLES = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", cls: "bg-green-50 text-green-700", dot: "bg-green-500" },
  completed: { label: "Completed", cls: "bg-indigo-50 text-primary", dot: "bg-primary" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

// ---------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------
function DoctorPhoto({ url, name }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-xl font-semibold shrink-0">
        {initials(name)}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      onError={() => setFailed(true)}
      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-indigo-50 shrink-0"
    />
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 mt-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-5 rounded-2xl border border-gray-200 p-5">
          <div className="w-24 h-24 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfirmCancel({ appointment, loading, onClose, onConfirm }) {
  if (!appointment) return null;
  const docName = appointment.doctor?.user?.name || "this doctor";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel appointment"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900">Cancel this appointment?</h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Your visit with {docName} on {formatDate(appointment.date)} at {appointment.timeSlot} will be
          cancelled and the slot will open up for others.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep appointment
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Cancel appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
function MyAppointment() {
  const { data: appointments = [], isLoading, isError, refetch } = useMyAppointments();
  const cancel = useCancelAppointment();

  const [tab, setTab] = useState("upcoming");
  const [toCancel, setToCancel] = useState(null);

  const today = toYMD(new Date());

  const isActive = (a) => a.status === "pending" || a.status === "confirmed";
  const isUpcoming = (a) => isActive(a) && a.date >= today;
  const isPast = (a) => a.status === "completed" || (isActive(a) && a.date < today);

  const counts = useMemo(
    () => ({
      upcoming: appointments.filter(isUpcoming).length,
      past: appointments.filter(isPast).length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      all: appointments.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, today]
  );

  const visible = useMemo(() => {
    let list = appointments;
    if (tab === "upcoming") list = appointments.filter(isUpcoming);
    else if (tab === "past") list = appointments.filter(isPast);
    else if (tab === "cancelled") list = appointments.filter((a) => a.status === "cancelled");

    const key = (a) => `${a.date} ${String(slotToMinutes(a.timeSlot)).padStart(4, "0")}`;
    return [...list].sort((a, b) =>
      tab === "upcoming" ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, tab, today]);

  const confirmCancel = () => {
    if (!toCancel) return;
    cancel.mutate(toCancel._id, { onSettled: () => setToCancel(null) });
  };

  return (
    <div className="pb-16">
      <div className="mt-10">
        <h1 className="text-2xl font-semibold text-gray-900">My appointments</h1>
        <p className="text-sm text-gray-500 mt-1">View, track and cancel your bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mt-6 pb-1" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs ${active ? "text-indigo-100" : "text-gray-400"}`}>
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading && <ListSkeleton />}

      {isError && (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            We could not load your appointments. Check that you are logged in as a patient.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && visible.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-base font-medium text-gray-900">
            {tab === "upcoming" ? "No upcoming appointments" : "Nothing to show here"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {tab === "upcoming"
              ? "Find a doctor and book your next visit."
              : "Appointments in this category will appear here."}
          </p>
          {tab === "upcoming" && (
            <Link
              to="/doctors"
              className="inline-block mt-5 rounded-full bg-primary px-6 py-2.5 text-sm text-white"
            >
              Find a doctor
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4 mt-6">
        {visible.map((a) => {
          const doc = a.doctor;
          const name = doc?.user?.name || "Doctor no longer available";
          const canCancel = isActive(a) && a.date >= today;

          return (
            <article
              key={a._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row gap-5"
            >
              <DoctorPhoto url={getImageUrl(doc?.image)} name={name} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {doc?.specialization || "Specialist"}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-14 shrink-0">Date</dt>
                    <dd className="text-gray-900">{formatDate(a.date)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-14 shrink-0">Time</dt>
                    <dd className="text-gray-900">{a.timeSlot}</dd>
                  </div>
                  {doc?.fee !== undefined && (
                    <div className="flex gap-2">
                      <dt className="text-gray-500 w-14 shrink-0">Fee</dt>
                      <dd className="text-gray-900">
                        {CURRENCY} {doc.fee}
                      </dd>
                    </div>
                  )}
                  {a.reason && (
                    <div className="flex gap-2 sm:col-span-2">
                      <dt className="text-gray-500 w-14 shrink-0">Reason</dt>
                      <dd className="text-gray-900 break-words">{a.reason}</dd>
                    </div>
                  )}
                </dl>

                {a.notes && (
                  <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Doctor's note: </span>
                    {a.notes}
                  </p>
                )}
              </div>

              {canCancel && (
                <div className="flex sm:flex-col justify-end sm:min-w-40">
                  <button
                    type="button"
                    onClick={() => setToCancel(a)}
                    className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ConfirmCancel
        appointment={toCancel}
        loading={cancel.isPending}
        onClose={() => !cancel.isPending && setToCancel(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}

export default MyAppointment;