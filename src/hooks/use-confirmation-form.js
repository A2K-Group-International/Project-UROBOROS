import {
  getConfirmationRegistrations,
  getUserCoordinator,
  getUserMinistry,
  submitRegistrationForm,
} from "@/services/confirmationService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserMinistry = (userId, ministryId) => {
  return useQuery({
    queryKey: ["user-ministry", userId, ministryId],
    queryFn: () => getUserMinistry(userId, ministryId),
    enabled: !!userId && !!ministryId,
  });
};

export const useSubmitConfirmationForm = (userId) => {
  return useMutation({
    mutationFn: (formData) => submitRegistrationForm(userId, formData),
  });
};

export const useGetUserCoordinator = (userId, ministryId) => {
  return useQuery({
    queryKey: ["user-coordinator", userId, ministryId],
    queryFn: () => getUserCoordinator(userId, ministryId),
    enabled: !!userId && !!ministryId,
  });
};

export const useGetConfirmRegistration = () => {
  return useQuery({
    queryKey: ["confirm-registration"],
    queryFn: () => getConfirmationRegistrations(),
  });
};
