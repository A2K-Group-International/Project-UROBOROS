import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { getAllUserLicenses } from "@/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { licenseSchema } from "@/zodSchema/Request/LicenseSchema";

const useLicense = ({ status = null }) => {
  const form = useForm({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      email: null,
      groupCode: "",
    },
  });

  const licenseQuery = useQuery({
    queryKey: ["user-licenses", status],
    queryFn: () => getAllUserLicenses({ status }),
    staleTime: 1000 * 60 * 10,
  });

  const addLicenseMutation = useMutation({
    // mutationFn: addLicense(),
    onSuccess: (data) => {
      toast({
        title: "License has been sent",
        description: `License has been sent to ${data.name}.`,
      });
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
