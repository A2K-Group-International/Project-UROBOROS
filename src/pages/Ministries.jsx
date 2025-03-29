import { lazy, Suspense } from "react";
import { ROLES } from "@/constants/roles";
import { useUser } from "@/context/useUser";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components
const AdminViewMinistry = lazy(
  () => import("@/components/Ministry/AdminViewMinistry")
);
const CoordinatorViewMinistry = lazy(
  () => import("@/components/Ministry/CoordinatorViewMinistry")
);

const ROLE_COMPONENTS = {
  [ROLES[0]]: CoordinatorViewMinistry, // Coordinator
  [ROLES[4]]: AdminViewMinistry, // Admin
  [ROLES[1]]: CoordinatorViewMinistry, // Volunteer
  [ROLES[2]]: CoordinatorViewMinistry, // Parishioner
  [ROLES[3]]: CoordinatorViewMinistry, // Co-parent
};

const LoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const UnauthorizedAccess = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <p className="text-muted-foreground text-lg">
      {`You don't have permission to access this page`}
    </p>
  </div>
);

const Ministries = () => {
  const { userData } = useUser();
  const role = userData?.role;

  if (!userData) {
    return <LoadingFallback />;
  }

  const RoleComponent = ROLE_COMPONENTS[role];

  if (!RoleComponent) {
    return <UnauthorizedAccess />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoleComponent />
    </Suspense>
  );
};

export default Ministries;
