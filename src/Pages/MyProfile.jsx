import React, { useState } from "react";
import { assets } from "../assets/prescripto_assets/assets/assets_frontend/assets";
import { useMe } from "../Hooks/userAuth";
import EditProfileModal from "../Component/EditProfileModal";

// "2001-01-05" -> "5 Jan 2001" (timezone ki wajah se tareekh aage peeche na ho)
const formatDate = (value) => {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-3 py-3 border-b last:border-b-0">
      <dt className="font-medium text-neutral-600">{label}</dt>
      <dd className="text-neutral-800 break-words">
        {children || <span className="text-zinc-400">Not added</span>}
      </dd>
    </div>
  );
}

function MyProfile() {
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);

  if (!user) return null; // ProtectedRoute pehle hi user load karwa chuka hota hai

  const address = user.address || { line1: "", line2: "" };
  const fullAddress = [address.line1, address.line2].filter(Boolean).join(", ");
  const gender = user.gender && user.gender !== "Not Selected" ? user.gender : "";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 border rounded-xl p-6 bg-white">
        <img
          src={user.image || assets.profile_pic}
          alt={user.name}
          className="w-28 h-28 rounded-full object-cover border"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-neutral-800">{user.name}</h1>
          <p className="text-zinc-500 mt-1">{user.email}</p>
          <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">
            {user.role}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all self-start sm:self-center"
        >
          Edit profile
        </button>
      </div>

      {/* Contact */}
      <section className="border rounded-xl p-6 mt-5 bg-white">
        <h2 className="text-base font-semibold text-neutral-800 mb-1">Contact information</h2>
        <dl className="text-sm">
          <InfoRow label="Email">{user.email}</InfoRow>
          <InfoRow label="Phone">{user.phone}</InfoRow>
          <InfoRow label="Address">{fullAddress}</InfoRow>
        </dl>
      </section>

      {/* Basic */}
      <section className="border rounded-xl p-6 mt-5 bg-white">
        <h2 className="text-base font-semibold text-neutral-800 mb-1">Basic information</h2>
        <dl className="text-sm">
          <InfoRow label="Gender">{gender}</InfoRow>
          <InfoRow label="Birthday">{formatDate(user.dob)}</InfoRow>
        </dl>
      </section>

      {/* Modal: sirf khulne par render hota hai, is liye form har baar naye data se bharta hai */}
      {open && <EditProfileModal user={user} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default MyProfile;