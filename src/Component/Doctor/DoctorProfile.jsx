import { useContext, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { assets } from "../../assets/prescripto_assets/assets/assets_frontend/assets";
import { useMe } from "../../Hooks/userAuth";
import { useMyDoctorProfile } from "../../Hooks/useDoctorPanel";
import EditProfileModal from "../../Component/EditProfileModal";
import { formatTime } from "../../Component/doctor/AppointmentBits";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-3 border-b last:border-b-0 text-sm">
      <dt className="font-medium text-gray-600">{label}</dt>
      <dd className="text-gray-800 break-words">
        {children || <span className="text-gray-400">Not added</span>}
      </dd>
    </div>
  );
}

export default function DoctorProfile() {
  const { currencySymbol } = useContext(AppContext);
  const { data: user } = useMe();
  const { data: doc, isLoading, isError, refetch } = useMyDoctorProfile();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <p className="text-gray-500">Loading profile...</p>;
  if (isError || !doc)
    return (
      <div>
        <p className="text-gray-600">Could not load your doctor profile.</p>
        <button onClick={() => refetch()} className="mt-3 border border-primary px-5 py-2 rounded-full text-sm">
          Retry
        </button>
      </div>
    );

  const avatar = user?.image || doc.image?.url || assets.profile_pic;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <img src={avatar} alt={user?.name} className="w-24 h-24 rounded-full object-cover border" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">Dr. {user?.name}</h1>
          <p className="text-primary font-medium mt-1">{doc.specialization}</p>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="self-start sm:self-center border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
        >
          Edit personal details
        </button>
      </div>

      {/* Professional */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 mt-5">
        <h2 className="font-semibold text-gray-800 mb-1">Professional information</h2>
        <dl>
          <Row label="Specialization">{doc.specialization}</Row>
          <Row label="Experience">{doc.experience ? `${doc.experience} years` : ""}</Row>
          <Row label="Fee">{doc.fee ? `${currencySymbol}${doc.fee}` : ""}</Row>
          <Row label="Phone">{doc.phone}</Row>
          <Row label="About">{doc.bio}</Row>
        </dl>
      </section>

      {/* Availability */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 mt-5">
        <h2 className="font-semibold text-gray-800">Availability</h2>

        <p className="text-sm text-gray-500 mt-4">Working days</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {ALL_DAYS.map((d) => (
            <span
              key={d}
              className={`px-3 py-1 rounded-full text-sm ${
                doc.availableDays?.includes(d)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-5">Time slots</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {(doc.timeSlots || []).map((t) => (
            <span key={t} className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600">
              {formatTime(t)}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          To change your fee, days or time slots, please contact the administrator.
        </p>
      </section>

      {/* Personal details wala wahi modal jo patient profile mein tha */}
      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} />}
    </div>
  );
}