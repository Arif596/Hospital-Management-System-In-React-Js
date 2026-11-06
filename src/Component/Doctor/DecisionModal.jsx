import { useEffect, useState } from "react";
import { useUpdateAppointmentStatus } from "../../Hooks/useDoctorPanel";
import { formatDate, formatTime, initials } from "./AppointmentBits";

// initialStep: "review" (confirm ya reject chuno) ya "reject" (seedha wajah wali screen)
export default function DecisionModal({ appointment, initialStep = "review", onClose }) {
  const update = useUpdateAppointmentStatus();
  const [step, setStep] = useState(initialStep);
  const [reason, setReason] = useState("");
  const saving = update.isPending;
  const patient = appointment.patient;
  const isCancel = appointment.status === "confirmed"; // pehle se confirmed ko cancel kar rahe hain

  // Esc se band (save ke dauran nahi)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const submit = (status) =>
    update.mutate(
      { id: appointment._id, status, reason: status === "cancelled" ? reason : undefined },
      { onSuccess: onClose } // kamyab ho to modal band
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div role="dialog" aria-modal="true" className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {step === "reject"
              ? isCancel ? "Cancel appointment" : "Reject appointment"
              : "Review appointment request"}
          </h2>
        </div>

        <div className="px-6 py-5 text-sm">
          {/* Patient + waqt ka khulasa */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
              {initials(patient?.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{patient?.name}</p>
              <p className="text-gray-500 truncate">{patient?.email}</p>
              {patient?.phone && <p className="text-gray-500">{patient.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-800">{formatDate(appointment.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-medium text-gray-800">{formatTime(appointment.timeSlot)}</p>
            </div>
          </div>

          {appointment.reason && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Reason for visit</p>
              <p className="text-gray-800">{appointment.reason}</p>
            </div>
          )}

          {/* Reject wali screen: wajah optional hai */}
          {step === "reject" && (
            <div className="mt-4">
              <label htmlFor="reject-reason" className="font-medium text-gray-700">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. I am unavailable on this day. Please book another slot."
                className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-400 text-right">{reason.length}/300</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          {step === "review" ? (
            <>
              <button
                onClick={() => setStep("reject")}
                disabled={saving}
                className="border border-rose-300 text-rose-600 px-5 py-2 rounded-full hover:bg-rose-50 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => submit("confirmed")}
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Confirming..." : "Confirm"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => (initialStep === "reject" ? onClose() : setStep("review"))}
                disabled={saving}
                className="border border-gray-300 px-5 py-2 rounded-full hover:bg-gray-100 disabled:opacity-60"
              >
                {initialStep === "reject" ? "Close" : "Back"}
              </button>
              <button
                onClick={() => submit("cancelled")}
                disabled={saving}
                className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : isCancel ? "Cancel appointment" : "Reject appointment"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}