"use client";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/app/global.css";

import cx from "classnames";
import { usePathname } from "next/navigation";
import { User as NextAuthUser } from "next-auth";
import { createContext, useCallback, useEffect, useState } from "react";

import { inter, sfPro } from "@/app/fonts";
import Footer from "@/components/global/footer";
import Notification from "@/components/global/notification";
import { NotificationProps } from "@/components/global/notification";
import { SideBar } from "@/components/global/sidebar";
import { getSession } from "@/lib/authentication/session";

interface AuthenticationContextType {
   user: NextAuthUser | undefined;
   theme: "dark" | "light";
   updateTheme: (_theme: "dark" | "light") => void;
   fetched: boolean;
}

interface NotificationContextType {
   notificationQueue: NotificationProps[],
   updateNotifications: (_notification: NotificationProps) => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
   user: undefined,
   theme: null,
   updateTheme: () => {},
   fetched: false
});

export const NotificationContext = createContext<NotificationContextType>({
   notificationQueue: [],
   updateNotifications: (_notification: NotificationProps) => { }
});

export default function Layout({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<NextAuthUser | undefined>(undefined);
   const [theme, setTheme] = useState<"light" | "dark">(null);
   const [fetched, setFetched] = useState<boolean>(false);
   const [notificationQueue, setNotificationQueue] = useState<NotificationProps[]>([]);
   const pathname: string = usePathname();

   const updateNotifications = useCallback((notification: NotificationProps) => {
      // Handle a queue of notifications to ensure all messages are displayed to the user
      if (notification.status !== "Initial") {
         setNotificationQueue((previousQueue) => {
            return [...previousQueue, notification];
         });
      } else if (notification.message === "remove") {
         setTimeout(() => {
            setNotificationQueue(notificationQueue.slice(1));
         }, 1250);
      }
   }, [notificationQueue]);

   const authenticateUser = useCallback(async() => {
      try {
         setUser(await getSession());
      } catch (error) {
         updateNotifications({
            status: "Failure",
            message: error.message
         });

         setUser(undefined);
      }

      setFetched(true);
   }, [updateNotifications]);

   const updateTheme = (theme: "dark" | "light") => {
      window.localStorage.setItem("theme", theme);
      setTheme(theme);
   };

   useEffect(() => {
      if (!fetched) {
         const preferredTheme: string | undefined = window.localStorage.theme;
         const prefersDarkMode: boolean = window.matchMedia("(prefers-color-scheme: dark)").matches;
         const theme = preferredTheme === "dark" || (!preferredTheme && prefersDarkMode) ? "dark" : "light";

         setTheme(theme);
         authenticateUser();
      }

      const handleCloseTopMostModal = (event: MouseEvent) => {
         const modals = document.getElementsByClassName("modal");
         const notification = document.getElementById("notification");
         const topMostModal = modals.length > 0 ? (modals[modals.length - 1] as HTMLDivElement) : null;
         const target = event.target as HTMLElement;

         if (topMostModal && !topMostModal.contains(target) && !notification?.contains(target)) {
            // Close top most modal when clicking outside, but only when the target is outside of any notification
            (topMostModal.getElementsByClassName("modal-close")[0] as SVGElement).dispatchEvent(
               new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window
               }),
            );
         }
      };

      document.body.addEventListener("mousedown", handleCloseTopMostModal);

      return () => {
         document.body.removeEventListener("mousedown", handleCloseTopMostModal);
      };
   }, [
      fetched,
      authenticateUser
   ]);

   return (
      <html
         lang = "en"
         className = { `m-0 w-full overflow-x-hidden p-0 ${theme === "dark" && "dark"}` }
         suppressHydrationWarning = { true }
      >
         <head>
            <title>Vitality</title>
            <link
               rel = "icon"
               type = "image/x-icon"
               href = "/favicon.ico"
            />
            <meta
               name = "description"
               content = "A modern fitness tracker to fuel your fitness goals"
            />
            <meta
               name = "author"
               content = "Jeffrey Cordero"
            />
            <meta
               name = "keywords"
               content = "fitness, tracker, health, wellness, vitality"
            />
            <meta
               name = "robots"
               content = "index, follow"
            />
            <meta
               name = "viewport"
               content = "width=device-width, initial-scale=1.0"
            />
         </head>
         <body
            className = {
               cx(
                  sfPro.variable,
                  inter.variable,
                  "box-border m-0 p-0 overflow-x-hidden max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 text-black dark:text-white"
               )
            }
         >
            {
               fetched && (
                  <AuthenticationContext.Provider value = { { user, theme, updateTheme, fetched } }>
                     <SideBar />
                     <NotificationContext.Provider value = { { notificationQueue, updateNotifications } }>
                        <div className = "flex min-h-screen flex-col items-center justify-start gap-6">
                           { children }
                           {
                              notificationQueue.length > 0 && (
                                 <Notification { ...notificationQueue[0] } />
                              )
                           }
                           {
                              pathname === "/" && (
                                 <Footer />
                              )
                           }
                        </div>
                     </NotificationContext.Provider>
                  </AuthenticationContext.Provider>
               )
            }
         </body>
      </html>
   );
}