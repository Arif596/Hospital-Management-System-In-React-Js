import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/prescripto_assets/assets/assets_frontend/assets";
import { useUpdateProfile, getMessage } from "../Hooks/userAuth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const inputClass = (hasError) =>
  `w-full border rounded-md px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
    hasError ? "border-red-400" : "border-zinc-300"
  }`;

export default function EditProfileModal({ user, onClose }) {
  const update = useUpdateProfile();
  const fileRef = useRef(null);
  const address = user.address || { line1: "", line2: "" };

  // Modal har baar naya mount hota hai, is liye form seedha user se bharta hai
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    addressLine1: address.line1 || "",
    addressLine2: address.line2 || "",
    gender: user.gender || "Not Selected",
    dob: user.dob || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  const saving = update.isPending;

  // Esc se band karein + piche ki page scroll band rakhein
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [saving, onClose]);

  // Purani preview URL memory se hatao (preview badalne par aur modal band hone par)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // wahi file dobara chunne par bhi onChange chale
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Only JPG, PNG or WEBP images are allowed" }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, image: "Image must be smaller than 2MB" }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (form.phone && !/^[+\d][\d\s-]{6,19}$/.test(form.phone.trim()))
      next.phone = "Enter a valid phone number";
    if (form.dob && form.dob > new Date().toISOString().slice(0, 10))
      next.dob = "Birthday cannot be in the future";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (saving || !validate()) return;

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value ?? ""));
    if (imageFile) data.append("image", imageFile);

    update.mutate(data, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        onClose();
      },
      onError: (err) => toast.error(getMessage(err)),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        // Sirf bahar (backdrop) par click se band ho
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-neutral-800">
            Edit profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="text-2xl leading-none text-zinc-500 hover:text-black disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="px-6 py-5 flex flex-col gap-5 text-sm">
          {/* Picture */}
          <div className="flex items-center gap-4">
            <img
              src={preview || user.image || assets.profile_pic}
              alt="Profile preview"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="border border-primary text-primary px-4 py-1.5 rounded-full text-xs hover:bg-primary hover:text-white transition-all"
              >
                Change picture
              </button>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG or WEBP, up to 2MB</p>
              {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onPickImage}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-medium text-neutral-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              className={inputClass(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email (badli nahi ja sakti) */}
          <div>
            <label htmlFor="email" className="block font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full border border-zinc-200 bg-zinc-100 text-zinc-500 rounded-md px-3 py-2 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block font-medium text-neutral-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+92 300 1234567"
              autoComplete="tel"
              className={inputClass(errors.phone)}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="line1" className="block font-medium text-neutral-700 mb-1">
              Address
            </label>
            <input
              id="line1"
              type="text"
              value={form.addressLine1}
              onChange={set("addressLine1")}
              placeholder="Address line 1"
              className={inputClass(false)}
            />
            <input
              id="line2"
              type="text"
              value={form.addressLine2}
              onChange={set("addressLine2")}
              placeholder="Address line 2 (city, area)"
              aria-label="Address line 2"
              className={`${inputClass(false)} mt-2`}
            />
          </div>

          {/* Gender + Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="gender" className="block font-medium text-neutral-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={form.gender}
                onChange={set("gender")}
                className={inputClass(false)}
              >
                <option value="Not Selected">Not selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block font-medium text-neutral-700 mb-1">
                Birthday
              </label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                max={new Date().toISOString().slice(0, 10)}
                onChange={set("dob")}
                className={inputClass(errors.dob)}
              />
              {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t mt-1 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-zinc-300 px-6 py-2 rounded-full hover:bg-zinc-100 transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-8 py-2 rounded-full hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}