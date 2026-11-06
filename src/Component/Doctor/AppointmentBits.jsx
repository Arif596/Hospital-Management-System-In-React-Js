const pad = (n) => String(n).padStart(2, "0");

// Aaj ki local tareekh "YYYY-MM-DD" (toISOString se din aage peeche ho sakta hai)
export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "2026-11-05" -> "5 Nov 2026"
export const formatDate = (value) => {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// "13:30" -> "1:30 pm"
export const formatTime = (t) => {
  if (!/^\d{1,2}:\d{2}$/.test(t || "")) return t || "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "pm" : "am"}`;
};

const STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-sky-50 text-sky-700 ring-sky-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ring-1 ${STYLES[status]}`}>
      {status}
    </span>
  );
}

// Naam ke pehle do harf, jaise "Muhammad Arif" -> "MA"
export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");