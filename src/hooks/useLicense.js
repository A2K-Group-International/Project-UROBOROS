import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { assignNewLicense, getAllUserLicenses } from "@/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { licenseSchema } from "@/zodSchema/Request/LicenseSchema";

const useLicense = ({ status = null, setLicenseOpen }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      userId: "",
      licenseCode: "",
    },
  });

  const licenseQuery = useQuery({
    queryKey: ["user-licenses", status],
    queryFn: () => getAllUserLicenses({ status }),
    staleTime: 1000 * 60 * 10,
  });

  const addLicenseMutation = useMutation({
    mutationFn: assignNewLicense,
    onSuccess: () => {
      toast({
        title: "License has been sent",
        description:
          "The license has been successfully sent to the user via email.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-licenses"] });

      if (setLicenseOpen) {
        setLicenseOpen(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Error sending license",
        description:
          error.message || "An error occurred while sending the license.",
      });
    },
    onSettled: () => {
      form.reset();
    },
  });

  const onSubmit = (data) => {
    addLicenseMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    licenseQuery,
    isPending: addLicenseMutation.isPending,
  };
};

export default useLicense;
