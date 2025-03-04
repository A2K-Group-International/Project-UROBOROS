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

const UserViewMinistry = lazy(
  () => import("@/components/Ministry/UserViewMinistry")
);

const ROLE_COMPONENTS = {
  [ROLES[0]]: CoordinatorViewMinistry,
  [ROLES[4]]: AdminViewMinistry,
  [ROLES[1]]: UserViewMinistry, // Volunteer
  [ROLES[2]]: UserViewMinistry, // Parishioner
  [ROLES[3]]: UserViewMinistry, // Co-parent
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
