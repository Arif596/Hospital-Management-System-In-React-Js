import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { axiosInstance } from "../Lib/Axios.js";
import { getMessage } from "./userAuth";

// Doctor ki saari appointments
export function useDoctorAppointments() {
  return useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: async () => (await axiosInstance.get("/appointment/doctor")).data.appointments,
  });
}

// Doctor ka apna professional profile
export function useMyDoctorProfile() {
  return useQuery({
    queryKey: ["doctor-me"],
    queryFn: async () => (await axiosInstance.get("/doctors/me")).data.doctor,
  });
}

const MESSAGES = {
  confirmed: "Appointment confirmed",
  completed: "Marked as completed",
  cancelled: "Appointment cancelled",
};

// Status badalna: { id, status, reason? }
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }) =>
      (await axiosInstance.patch(`/appointment/${id}/status`, { status, reason })).data,
    onSuccess: (_data, vars) => {
      toast.success(MESSAGES[vars.status]);
      // List dobara fetch hogi, to UI khud naya status dikhata hai
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
    },
    onError: (err) => toast.error(getMessage(err)),
  });
}