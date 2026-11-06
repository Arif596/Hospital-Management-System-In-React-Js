import { useMemo, useState } from "react";
import { useDoctorAppointments, useUpdateAppointmentStatus } from "../../Hooks/useDoctorPanel";
import DecisionModal from "../../Component/doctor/DecisionModal";
import { StatusBadge, formatDate, formatTime, initials } from "../../Component/doctor/AppointmentBits";

const TABS = ["pending", "confirmed", "completed", "cancelled", "all"];

export default function DoctorAppointments() {
  const { data: appointments = [], isLoading, isError, refetch } = useDoctorAppointments();
  const update = useUpdateAppointmentStatus();
  const [tab, setTab] = useState("pending");
  const [modal, setModal] = useState(null); // { appointment, step } ya null

  const counts = useMemo(() => {
    const c = { all: appointments.length };
    TABS.forEach((t) => t !== "all" && (c[t] = appointments.filter((a) => a.status === t).length));
    return c;
  }, [appointments]);

  const list = tab === "all" ? appointments : appointments.filter((a) => a.status === tab);

  if (isLoading) return <p className="text-gray-500">Loading appointments...</p>;
  if (isError)
    return (
      <div>
        <p className="text-gray-600">Could not load appointments.</p>
        <button onClick={() => refetch()} className="mt-3 border border-primary px-5 py-2 rounded-full text-sm">
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
      <p className="text-gray-500 mt-1">Review requests and manage your schedule.</p>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize border transition-colors ${
              tab === t
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary"
            }`}
          >
            {t} <span className="opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl mt-6 py-14 text-center text-gray-500 text-sm">
          No {tab === "all" ? "" : tab} appointments.
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {list.map((a) => {
            const busy = update.isPending && update.variables?.id === a._id;
            return (
              <li key={a._id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                    {initials(a.patient?.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{a.patient?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{a.patient?.email}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {formatDate(a.date)} at {formatTime(a.timeSlot)}
                    </p>
                  </div>

                  <StatusBadge status={a.status} />
                </div>

                {a.reason && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-medium">Visit reason:</span> {a.reason}
                  </p>
                )}
                {a.status === "cancelled" && a.statusReason && (
                  <p className="text-sm text-rose-600 mt-2">
                    <span className="font-medium">Reason given:</span> {a.statusReason}
                  </p>
                )}

                {/* Actions status ke hisaab se */}
                {a.status === "pending" && (
                  <div className="mt-4">
                    <button
                      onClick={() => setModal({ appointment: a, step: "review" })}
                      className="bg-primary text-white text-sm px-5 py-2 rounded-full hover:opacity-90"
                    >
                      Review request
                    </button>
                  </div>
                )}
                {a.status === "confirmed" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => update.mutate({ id: a._id, status: "completed" })}
                      disabled={busy}
                      className="bg-emerald-600 text-white text-sm px-5 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busy ? "Saving..." : "Mark completed"}
                    </button>
                    <button
                      onClick={() => setModal({ appointment: a, step: "reject" })}
                      disabled={busy}
                      className="border border-rose-300 text-rose-600 text-sm px-5 py-2 rounded-full hover:bg-rose-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* key se modal har baar naya mount hota hai, to purana state nahi bachta */}
      {modal && (
        <DecisionModal
          key={modal.appointment._id}
          appointment={modal.appointment}
          initialStep={modal.step}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}