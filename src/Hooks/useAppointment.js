import toast from "react-hot-toast";
import { axiosInstance } from "../Lib/Axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessage } from "./userAuth";

// MongoDB ki asli ID 24 hex characters ki hoti hai ("doc1" jaisi mock ID nahi)
const isObjectId = (v) => /^[a-f\d]{24}$/i.test(v || "");

// Saare doctors ki list (API se)
export function useDoctors() {
  return useQuery({
    queryKey: ["doctors", "list"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/doctors");
      return data.doctors || [];
    },
    retry: 1,
  });
}

// Ek doctor
export function useDoctor(id) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/doctors/${id}`);
      return data.doctor || data;
    },
    enabled: isObjectId(id),
    retry: false,
  });
}

// Is doctor ki bhari hui slots: [{ date: "2026-11-06", timeSlot: "10:00" }]
export function useBookedSlots(doctorId) {
  return useQuery({
    queryKey: ["booked", doctorId],
    queryFn: async () =>
      (await axiosInstance.get(`/appointment/booked/${doctorId}`)).data.slots,
    enabled: isObjectId(doctorId),
    staleTime: 30 * 1000,
    retry: false,
  });
}

// Book Appointment
export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await axiosInstance.post("/appointment", payload)).data,
    onSuccess: () => {
      toast.success("Appointment booked successfully");
      queryClient.invalidateQueries({ queryKey: ["booked"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (err) => {
      toast.error(getMessage(err));
      // Slot kisi aur ne le li (409): list taza karo
      if (err?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ["booked"] });
      }
    },
  });
}
// Logged-in patient ki apni appointments
export function useMyAppointments() {
  return useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () =>
      (await axiosInstance.get("/appointment/my")).data.appointments || [],
  });
}

// Appointment cancel karna (patient sirf apni cancel kar sakta hai)
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) =>
      (await axiosInstance.patch(`/appointment/${id}/status`, { status: "cancelled" })).data,
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["booked"] }); // slot dobara khul jaye
    },
    onError: (err) => toast.error(getMessage(err)),
  });
}