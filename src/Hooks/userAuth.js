import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../Lib/Axios.js";
import toast from "react-hot-toast";

export const getMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

// GET /auth/me : cookie se logged-in user. Login nahi hai to null milta hai
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await axiosInstance.get("/auth/me")).data.user;
      } catch (err) {
        if (err.response?.status === 401) return null; // login nahi hai, error nahi
        throw err;
      }
    },
    retry:1,
    staleTime: Infinity,
  });
}

// Login / Register: backend cookie set karta hai, hum user cache mein rakhte hain
function useAuthMutation(url, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => (await axiosInstance.post(url, formData)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
      toast.success(successMessage(data.user));
    },
    onError: (err) => toast.error(getMessage(err)),
  });
}

export const useLogin = () =>
  useAuthMutation(
    "/auth/login",
    (user) => `Welcome back, ${user.name.split(" ")[0]}!`
  );

export const useRegister = () =>
  useAuthMutation(
    "/auth/register",
    (user) => `Account created. Welcome, ${user.name.split(" ")[0]}!`
  );

// POST /auth/logout : backend cookie hata deta hai
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await axiosInstance.post("/auth/logout")).data,
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
    },
  });
}
// PUT /auth/me : profile + picture update (FormData, axios khud multipart header lagata hai)
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => (await axiosInstance.put("/auth/update-profile", formData)).data,
    onSuccess: (data) => queryClient.setQueryData(["me"], data.user),
  });
}