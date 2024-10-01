"use client";
import clsx from "clsx";
import { useContext } from "react";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotificationContext } from "@/app/layout";

export interface NotificationProps extends React.HTMLAttributes<any> {
   children?: React.ReactNode;
   status: "Initial" | "Success" | "Error" | "Failure";
   message: string;
}

export default function Notification(props: NotificationProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const icon = props.status === "Success" ? faCircleCheck : faTriangleExclamation;

   return (
      <div>
         {<div
            className = "fixed w-[30rem] max-w-[90%] min-h-[4.5rem] top-0 left-1/2 transform -translate-x-1/2 max-w-4/5 mx-auto mt-4 opacity-0 notification animate-fadeIn z-50"
            {...props}
         >
            <div className = "text-left">
               <div className = {clsx("w-full border-stroke flex items-center rounded-lg border border-l-[8px] bg-white pl-4", {
                  "border-l-green-600": props.status === "Success",
                  "border-l-red-600": props.status !== "Success"
               })}>
                  <div className = "flex items-center justify-center rounded-full">
                     <FontAwesomeIcon icon = {icon} className = {clsx("text-3xl", {
                        "text-green-600": props.status === "Success",
                        "text-red-600": props.status !== "Success"
                     })} />
                  </div>
                  <div className = "flex w-full items-center justify-between p-4">
                     <div>
                        <div className = "my-2 flex flex-col gap-2 font-bold">
                           <p>{props.message}</p>
                           {props.children}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className = "absolute top-0 right-0 m-[10px]">
               <a
                  className = "hover:text-danger hover:cursor-pointer text-red-600"
                  onClick = {() => {
                     // Remove from the DOM and reset notification context
                     updateNotification({
                        status: "Initial",
                        message: ""
                     });
                  }}
               >
                  <svg
                     width = {25}
                     height = {25}
                     viewBox = "0 0 24 24"
                     className = "fill-current"
                  >
                     <path
                        fillRule = "evenodd"
                        clipRule = "evenodd"
                        d = "M18.8839 5.11612C19.372 5.60427 19.372 6.39573 18.8839 6.88388L6.88388 18.8839C6.39573 19.372 5.60427 19.372 5.11612 18.8839C4.62796 18.3957 4.62796 17.6043 5.11612 17.1161L17.1161 5.11612C17.6043 4.62796 18.3957 4.62796 18.8839 5.11612Z"
                     />
                     <path
                        fillRule = "evenodd"
                        clipRule = "evenodd"
                        d = "M5.11612 5.11612C5.60427 4.62796 6.39573 4.62796 6.88388 5.11612L18.8839 17.1161C19.372 17.6043 19.372 18.3957 18.8839 18.8839C18.3957 19.372 17.6043 19.372 17.1161 18.8839L5.11612 6.88388C4.62796 6.39573 4.62796 5.60427 5.11612 5.11612Z"
                     />
                  </svg>
               </a>
            </div>
         </div>
         }</div>
   );
}