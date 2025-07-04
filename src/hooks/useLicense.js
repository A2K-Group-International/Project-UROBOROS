import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  activeLicenses,
  assignNewLicense,
  getAllUserLicenses,
  inactiveLicenses,
  totalLicenses,
} from "@/services/userService";
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

  const licenseInfiniteQuery = useInfiniteQuery({
    queryKey: ["user-licenses", status],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllUserLicenses({
        status,
        page: pageParam,
        pageSize: 5,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.currentPage + 1;
      }
    },
    enabled: !!status,
  });

  // query for total licenses count
  const licensesCountQuery = useQuery({
    queryKey: ["licenses-count"],
    queryFn: () => totalLicenses(),
    staleTime: 5 * 60 * 1000,
  });

  const activeLicensesCountQuery = useQuery({
    queryKey: ["active-licenses-count"],
    queryFn: () => activeLicenses(),
    staleTime: 5 * 60 * 1000,
  });

  const inactiveLicensesCountQuery = useQuery({
    queryKey: ["inactive-licenses-count"],
    queryFn: () => inactiveLicenses(),
    staleTime: 5 * 60 * 1000,
  });

  const addLicenseMutation = useMutation({
    mutationFn: assignNewLicense,
    onSuccess: () => {
      toast({
        title: "License has been sent",
        description:
          "The license has been successfully sent to the user via email.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-licenses", status] });

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
    licenseInfiniteQuery,
    isPending: addLicenseMutation.isPending,

    totalLicenses: licensesCountQuery.data ?? 0,
    isTotalLicensesLoading: licensesCountQuery.isLoading,

    activeLicensesCount: activeLicensesCountQuery.data ?? 0,
    isActiveLicensesLoading: activeLicensesCountQuery.isLoading,
    inactiveLicensesCount: inactiveLicensesCountQuery.data ?? 0,

    isInactiveLicensesLoading: inactiveLicensesCountQuery.isLoading,
  };
};

export default useLicense;
