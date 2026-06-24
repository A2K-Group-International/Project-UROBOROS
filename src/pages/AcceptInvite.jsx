import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAcceptInvitation } from "@/hooks/useFamilyData";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const acceptMutation = useAcceptInvitation();

  useEffect(() => {
    if (!token) {
      toast({ title: "No token found", variant: "destructive" });
      navigate("/");
      return;
    }

    acceptMutation.mutate(token);
  }, []);

  if (acceptMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-gray-900 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-lg text-primary-text">
            Accepting invitation...
          </p>
        </div>
      </div>
    );
  }
};

export default AcceptInvite;
