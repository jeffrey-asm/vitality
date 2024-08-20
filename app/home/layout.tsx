"use client";

import { usePathname } from "next/navigation";

function useValidateHomeURL(): void {
   const pathname = usePathname();

   if (!(pathname.startsWith("/home"))) {
      window.location.reload();
   }
}

export default function Layout({
   children
}: {
   children: React.ReactNode;
}) {
   useValidateHomeURL();

   return (
      <>
         <div className = "flex flex-col">
            <div className = "flex-grow md:overflow-y-auto p-2sig">
               {children}
            </div>
         </div>
      </>
   );
}
