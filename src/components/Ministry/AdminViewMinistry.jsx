import Loading from "@/components/Loading";
import CreateMinistry from "@/components/Ministry/CreateMinistry";
import MinistryCard from "@/components/Ministry/MinistryCard";
import { Description, Title } from "@/components/Title";
import useMinistry from "@/hooks/useMinistry";
import { Button } from "../ui/button";

const AdminViewMinistry = () => {
  const { ministries, ministryLoading } = useMinistry({});
  return (
    <div className="relative flex h-full flex-col p-0">
      <div className="flex items-center justify-between border-b border-primary-outline pb-4 lg:pb-[20px] lg:pl-[42px] lg:pr-[48px] lg:pt-[25px]">
        <div>
          <Title>Ministry Management</Title>
          <Description>Manage your ministry.</Description>
        </div>
        <div>
          <CreateMinistry>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg bg-primary px-4 py-2 text-primary-text"
            >
              Create Ministry
            </Button>
          </CreateMinistry>
        </div>
      </div>

      {/* Render loading state while fetching data */}
      {ministryLoading ? (
        <Loading />
      ) : (
        <div className="no-scrollbar h-auto w-full gap-6 space-y-2 overflow-scroll py-6 sm:grid sm:grid-cols-2 md:space-y-0 lg:px-[42px] xl:grid-cols-3 2xl:grid-cols-4">
          {/* Check if ministries exist after loading */}
          {ministries?.length === 0 ? (
            <p>No ministry have been created yet.</p>
          ) : (
            // <p>
            //   {temporaryRole === ROLES[4]
            //     ? "No groups have been created yet."
            //     : "No assigned group yet."}
            // </p>
            ministries?.map((ministry) => (
              <MinistryCard
                key={ministry.id}
                coordinators={ministry.ministry_coordinators}
                ministryId={ministry.id}
                title={ministry.ministry_name}
                image={ministry.image_url}
                description={ministry.ministry_description}
                createdDate={ministry.created_at}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminViewMinistry;
