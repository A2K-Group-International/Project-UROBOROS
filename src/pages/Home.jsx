import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ParishionerRegister from "@/components/Home/Profile-Registration/ParishionerRegister";
import Login from "@/components/Login";
// import WalkInRegistration from "@/components/Home/WalkInRegistration";
// import EditRegistration from "@/components/Home/EditRegistration";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

const Home = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [showVideo, setShowVideo] = useState(false);

  const toggleVideo = () => {
    if (showVideo) {
      setShowVideo(false);
    } else {
      setShowVideo(true);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          // show screen to update user's password
          navigate("/reset-password");
          return;
        }
      });

      // Navigate to /announcements if there is an active session
      if (session) {
        navigate("/announcements");
      }
    };

    getSession();
  }, [navigate]);

  return (
    <>
      <div className="relative flex h-[calc(100dvh_-_10rem)] items-center justify-center overflow-hidden bg-[#FFDECE] bg-[url('@/assets/svg/backdrop_clean.svg')] bg-right-bottom bg-no-repeat sm:h-[calc(100dvh_-_1.8rem)] md:bg-bottom lg:bg-cover">
        <div className="absolute bottom-[5dvw] right-[8dvw] z-20 h-[30dvw] w-[12dvw] bg-[url('@/assets/svg/st_laurence.svg')] bg-contain bg-center bg-no-repeat transition-all duration-500 hover:scale-105">
          <a
            href="https://www.saintlaurence.org.uk/"
            className="absolute z-10 h-full w-full"
            target="_blank"
          ></a>
        </div>
        <div className="absolute bottom-[2.5dvw] right-[8.4dvw] z-30 h-[6dvw] w-[12dvw] bg-[url('@/assets/svg/mud.svg')] bg-contain bg-center bg-no-repeat"></div>
        <div className="absolute top-10 z-50 lg:right-20">
          {/* <div className="order-2 mx-auto max-w-xl justify-center rounded-[1.8rem] bg-white/60 backdrop-blur-sm sm:flex sm:space-x-3 sm:rounded-full md:order-1 md:col-span-2"> */}
          <div className="grid grid-cols-2 gap-2 p-2">
            <ParishionerRegister />
            <Login />
            {/* <WalkInRegistration />
              <EditRegistration /> */}
            {/* </div> */}
          </div>
        </div>
        <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 lg:left-[27%]">
          <img
            src="/jubilee.png"
            alt="jubilee"
            className="w-[60dvw] lg:w-[35dvw]"
          />
        </div>
        {/* <p className="absolute top-[12rem] w-screen max-w-[80dvw] whitespace-pre text-[9.4dvw] font-black leading-[10dvw] text-accent sm:top-[20dvh] sm:max-w-xl sm:text-[4.4rem] sm:leading-[5.4rem] lg:bottom-[50dvh] lg:top-auto lg:ml-[24dvw] lg:max-w-full lg:text-[8dvh] lg:leading-[9dvh]">
          {"Growing in Faith\nTogether"}
        </p>
        <p className="absolute top-[calc(12rem_+_24dvw)] w-screen max-w-[80dvw] whitespace-pre text-[5.8dvw] font-medium text-accent sm:top-[calc(20dvh_+_12rem)] sm:max-w-xl sm:text-[2.6rem] lg:bottom-[calc(50dvh_-_14dvh)] lg:top-auto lg:ml-[24.2dvw] lg:max-w-full lg:text-[4.6dvh]">
          {"Engaging our Parishioners \nin the Joy of the Gospel"}
        </p> */}
        {/* <div className="z-99 absolute bottom-0 left-1 h-32 w-64 md:bottom-48 md:left-12 md:h-60 md:w-96 lg:bottom-10 lg:left-72 lg:w-[30rem] lg:h-64">
          <iframe
            className="rounded-lg"
            src="https://www.youtube.com/embed/3pAuz0TTVn0?controls=1"
            title="Creating a Parishioner Account"
            style={{
              border: "1px solid #663F30 ",
              width: "100%",
              height: "100%",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div> */}
      </div>
      <div className="absolute bottom-6 left-0 z-50 w-full sm:bottom-10 sm:left-5 sm:w-auto">
        <div className="flex justify-center">
          <Button
            className="h-8 bg-pink py-2 text-xs text-primary-text md:rounded-full"
            variant="primary"
            onClick={() => navigate("/send-feedback")}
          >
            <div>
              <Icon icon="mingcute:edit-4-line" />
            </div>
            Feedback
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex h-[10rem] w-full items-end border-t border-gray/10 bg-[#663F30] pb-2 pl-4 sm:h-[1.8rem]">
        <p className="font-regular text-[0.8rem] text-[#FBCCC0]/40">
          Developed by{" "}
          <a href="http://a2kgroup.org" target="_blank">
            A2K Group Corporation <span> © {currentYear}</span>
          </a>
        </p>
      </div>
      <div className="fixed bottom-12 left-[calc(50%_-_10.5rem)] z-40 flex h-[11rem] w-[21rem] origin-bottom scale-[85%] flex-col items-center gap-4 rounded-[1rem] bg-[#FBCCC0] px-[2rem] py-[0.8rem] text-[1.05rem] font-medium text-accent shadow-xl shadow-black/20 transition-all duration-200 sm:bottom-[-8rem] sm:z-0 sm:h-[13rem] sm:scale-100 sm:shadow-2xl sm:shadow-black sm:hover:bottom-[-1.6rem] sm:hover:scale-[150%]">
        <p className="whitespace-nowrap">
          Need <span className="font-bold">help</span> creating an account?
        </p>
        <div
          className="flex h-[6rem] w-full cursor-pointer rounded-md border border-accent/30 bg-accent/10 p-2 transition-all hover:bg-accent/20"
          onClick={toggleVideo}
        >
          <div className="flex h-full w-[6rem] items-end justify-end rounded-md bg-white/80 bg-[url('@/assets/images/slide-thumbnail.png')] bg-contain bg-center p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <rect width="24" height="24" fill="none" />
              <g fill="none">
                <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                <path
                  fill="currentColor"
                  d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2M8.964 8.65l-.053.5l-.03.333l-.042.6l-.024.46l-.018.505l-.01.549v.578l.01.549l.018.506l.024.46l.042.6l.071.73l.013.102a1.192 1.192 0 0 0 1.651.954l.456-.202l.651-.309l.39-.196l.43-.224l.466-.253l.498-.282l.493-.29l.231-.14l.43-.27l.388-.25l.342-.229l.653-.46l.177-.131a1.192 1.192 0 0 0-.001-1.908l-.406-.297l-.275-.193l-.32-.218l-.565-.368l-.428-.268l-.47-.282l-.499-.288l-.478-.265l-.447-.238l-.41-.21l-.54-.263l-.439-.202l-.23-.102l-.095-.04a1.192 1.192 0 0 0-1.654.952"
                />
              </g>
            </svg>
          </div>
          <div className="flex h-full w-full flex-1 flex-col gap-3 py-[0.4rem] pl-[0.8rem]">
            <p className="text-[0.8rem] font-bold leading-[0.9rem]">
              Creating a Parishioner Account
            </p>
            <div className="flex w-[3.6rem] justify-center rounded-full bg-accent px-2 py-1">
              <p className="text-[0.6rem] font-normal text-white">Tutorial</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`fixed left-0 right-0 z-[99] flex flex-col items-center justify-center gap-4 bg-black/90 transition-none duration-300 sm:gap-8 ${
          showVideo
            ? "bottom-0 top-0 opacity-100"
            : "bottom-[-100%] top-[100%] opacity-0"
        }`}
      >
        {" "}
        <div className="h-[56dvw] w-[99dvw] sm:h-[80dvh] sm:w-[75dvw]">
          <iframe
            className="rounded-2xl"
            src={
              showVideo
                ? "https://www.youtube.com/embed/3pAuz0TTVn0?controls=1&mute=1&autoplay=1"
                : ""
            }
            title="Creating a Parishioner Account"
            style={{
              border: "1px solid",
              width: "100%",
              height: "100%",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <p
          className="cursor-pointer rounded-full bg-accent px-12 py-3 text-[1rem] font-medium text-white/80 hover:underline sm:text-[1.2rem]"
          onClick={toggleVideo}
        >
          Close
        </p>
      </div>
    </>
  );
};

export default Home;
