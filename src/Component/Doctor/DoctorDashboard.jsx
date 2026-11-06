import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMe } from "../../Hooks/userAuth";
import { useDoctorAppointments } from "../../Hooks/useDoctorPanel";
import {
  StatusBadge, formatDate, formatTime, todayString, initials,
} from "../../Component/Doctor/AppointmentBits";

function StatCard({ label, value, tone }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${tone}`}>{value}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const { data: user } = useMe();
  const { data: appointments = [], isLoading, isError, refetch } = useDoctorAppointments();
  const today = todayString();

  // appointments badalne par hi dobara hisaab ho
  const stats = useMemo(() => {
    const count = (fn) => appointments.filter(fn).length;
    return {
      pending: count((a) => a.status === "pending"),
      today: count((a) => a.date === today && ["pending", "confirmed"].includes(a.status)),
      upcoming: count((a) => a.status === "confirmed" && a.date >= today),
      completed: count((a) => a.status === "completed"),
    };
  }, [appointments, today]);

  const waiting = appointments.filter((a) => a.status === "pending").slice(0, 5);

  if (isLoading) return <p className="text-gray-500">Loading dashboard...</p>;
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
      <h1 className="text-2xl font-semibold text-gray-800">Welcome, Dr. {user?.name}</h1>
      <p className="text-gray-500 mt-1">Here is what needs your attention today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Waiting for response" value={stats.pending} tone="text-amber-600" />
        <StatCard label="Today" value={stats.today} tone="text-primary" />
        <StatCard label="Upcoming confirmed" value={stats.upcoming} tone="text-emerald-600" />
        <StatCard label="Completed" value={stats.completed} tone="text-sky-600" />
      </div>

      <section className="bg-white border border-gray-200 rounded-xl mt-8">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Needs your response</h2>
          <Link to="/doctor/appointments" className="text-sm text-primary font-medium">View all</Link>
        </div>

        {waiting.length === 0 ? (
          <p className="px-5 py-10 text-center text-gray-500 text-sm">
            You are all caught up. No pending requests.
          </p>
        ) : (
          <ul className="divide-y">
            {waiting.map((a) => (
              <li key={a._id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                  {initials(a.patient?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{a.patient?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(a.date)} at {formatTime(a.timeSlot)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}