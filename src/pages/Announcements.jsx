import { Title } from "@/components/Title";
import Announcement from "@/components/Announcements/Announcement";
import useAnnouncements from "@/hooks/useAnnouncements";
import { useUser } from "@/context/useUser";
import useInterObserver from "@/hooks/useInterObserver";
import Loading from "@/components/Loading";
import AnnouncementHeader from "@/components/Announcements/AnnouncementHeader";

const Announcements = () => {
  const { userData } = useUser();

  const {
    fetchNextPage,
    deleteAnnouncementMutation,
    hasNextPage,
    editAnnouncementMutation,
    data,
    isLoading,
  } = useAnnouncements({
    group_id: null,
  });

  const { ref } = useInterObserver(fetchNextPage);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-2 flex w-3/4 items-end justify-between lg:mb-6">
        <div className="">
          <Title className="mb-0 lg:mb-3">Announcements</Title>
        </div>
        {/* 
        {(userData?.role == "coordinator" || userData.role == "volunteer") && (
   
        )} */}
      </div>

      <div className="no-scrollbar flex h-full w-full flex-col-reverse gap-4 overflow-y-scroll lg:flex-row">
        {/* Announcements List */}
        <div className="no-scrollbar flex w-full flex-col items-center overflow-y-scroll rounded-none border-t border-primary-outline p-1 pt-3 md:rounded-xl md:border md:bg-primary md:px-9 md:py-6">
          <div className="w-full lg:w-2/3">
            {(userData?.role === "admin" ||
              userData?.role === "coordinator") && (
              <AnnouncementHeader
                image={userData?.user_image}
                first_name={userData?.first_name}
              />
            )}
            {isLoading && <Loading />}

            {data?.pages?.flatMap((page) => page.items).length === 0 ? (
              <p>No announcements yet.</p>
            ) : (
              data?.pages?.flatMap((page) =>
                page?.items?.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="mb-3 w-full rounded-lg border border-primary-outline bg-[#f9f7f7b9] px-4 pb-6 pt-3 md:bg-white md:px-8 md:pt-5"
                  >
                    <Announcement
                      announcement={announcement}
                      editAnnouncementMutation={editAnnouncementMutation}
                      deleteAnnouncementMutation={deleteAnnouncementMutation}
                    />
                  </div>
                ))
              )
            )}

            {hasNextPage && <div className="mt-20" ref={ref}></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
