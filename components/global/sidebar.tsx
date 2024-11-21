"use client";
import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
   faAnglesRight,
   faPlaneArrival,
   faUserPlus,
   faDoorOpen,
   faHouse,
   faUtensils,
   faBrain,
   faHeartCircleBolt,
   faBullseye,
   faShuffle,
   faPeopleGroup,
   faHandshakeAngle,
   faGears,
   faBarsStaggered,
   faDumbbell
} from "@fortawesome/free-solid-svg-icons";
import { AuthenticationContext } from "@/app/layout";

interface SideBarProps {
  name: string;
  href: string;
  icon: IconDefinition;
}

const landingLinks: SideBarProps[] = [
   { name: "Landing", href: "/", icon: faPlaneArrival },
   { name: "Log In", href: "/login", icon: faDoorOpen },
   { name: "Sign Up", href: "/signup", icon: faUserPlus }
];

const homeLinks: SideBarProps[] = [
   { name: "Home", href: "/home", icon: faHouse },
   { name: "Workouts", href: "/home/workouts", icon: faDumbbell },
   { name: "Nutrition", href: "/home/nutrition", icon: faUtensils },
   { name: "Mood", href: "/home/mood", icon: faBrain },
   { name: "Health", href: "/home/health", icon: faHeartCircleBolt },
   { name: "Goals", href: "/home/goals", icon: faBullseye },
   { name: "Progress", href: "/home/progress", icon: faShuffle },
   { name: "Community", href: "/home/community", icon: faPeopleGroup },
   { name: "Support", href: "/home/support", icon: faHandshakeAngle },
   { name: "Settings", href: "/home/settings", icon: faGears }
];

function SideBarLinks(): JSX.Element {
   const pathname = usePathname();
   const { user, fetched } = useContext(AuthenticationContext);
   // Initialize links based on localStorage or pathname
   const [links, setLinks] = useState<SideBarProps[]>(homeLinks);

   // Update links based on user state and store in localStorage on unmount
   useEffect(() => {
      // Determine the new links based on user presence
      const newLinks = user === undefined ? landingLinks : homeLinks;

      if (fetched) {
         setLinks(newLinks);
      }
   }, [
      user,
      fetched,
      links
   ]);

   return (
      <>
         {links.map((link) => {
            return (
               <Link
                  key = {link.name}
                  href = {link.href}
                  className = {clsx(
                     "flex h-[50px] w-full items-center justify-start gap-10 rounded-md text-black bg-gray-50 text-sm font-medium hover:text-primary z-40",
                     {
                        "bg-sky-100 text-primary": pathname === link.href
                     },
                  )}>
                  <div className = "w-[30px] pl-[10px]">
                     <FontAwesomeIcon
                        icon = {link.icon}
                        className = "text-2xl"
                     />
                  </div>
                  <p className = "whitespace-nowrap">{link.name}</p>
               </Link>
            );
         })}
      </>
   );
}

export function SideBar(): JSX.Element {
   const [visibleSideBar, setVisibleSideBar] = useState<boolean>(false);

   return (
      <div>
         <div className = "absolute top-0 left-0 z-30">
            <div className = "relative top-0 left-0 transform translate-x-[10px] translate-y-[20px] z-30">
               <FontAwesomeIcon
                  id = "sideBarButton"
                  icon = {visibleSideBar ? faAnglesRight : faBarsStaggered}
                  className = "text-3xl text-black font-extrabold hover:cursor-pointer"
                  onClick = {() => {
                     setVisibleSideBar(!visibleSideBar);
                  }}
               />
            </div>
         </div>
         <div className = "absolute z-20">
            <div
               id = "sideBarLinks"
               className = {clsx(
                  "relative m-0 top-[10px] w-[4.5rem] hover:w-64 focus:w-64 transition-all duration-1000 ease-in-out",
                  {
                     "left-[-5rem]": !visibleSideBar,
                     "left-[10px]": visibleSideBar
                  },
               )}>
               <div
                  className = "flex h-auto mt-20 flex-col px-3 py-4 bg-gray-50 shadow-md rounded-2xl overflow-hidden"
                  onMouseEnter = {() => {
                     setVisibleSideBar(true);
                  }}>
                  <div className = "flex flex-col space-x-2 space-y-2 justify-center text-center">
                     <div className = "flex flex-col w-full h-full items-center justify-between text-center">
                        <SideBarLinks />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
