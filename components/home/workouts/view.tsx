import { faMagnifyingGlass, faPhotoFilm, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { Dispatch, useCallback } from "react";

import Button from "@/components/global/button";
import Cards from "@/components/home/workouts/cards";
import Table from "@/components/home/workouts/table";
import { VitalityProps } from "@/lib/global/reducer";
import { Workout } from "@/lib/home/workouts/workouts";

interface ViewProps extends VitalityProps {
  view: "table" | "cards";
  setView: Dispatch<"table" | "cards">;
  workouts: Workout[];
}

export default function View(props: ViewProps): JSX.Element {
   const { view, setView, workouts, globalState, globalDispatch } = props;

   const updateView = useCallback((view: "table" | "cards") => {
      setView(view);
      window.localStorage.setItem("view", view);
   }, [setView]);

   return (
      <div className = "relative mx-auto flex w-full flex-col items-center justify-center">
         <div className = "flex items-center justify-start gap-4 text-left">
            <Button
               icon = { faTable }
               onClick = { () => updateView("table") }
               className = {
                  clsx("text-lg transition duration-300 ease-in-out focus:text-primary focus:ring-transparent xxsm:text-lg", {
                     "scale-105 border-b-4 border-primary rounded-none text-primary": view === "table"
                  })
               }
            >
               Table
            </Button>
            <Button
               icon = { faPhotoFilm }
               onClick = { () => updateView("cards") }
               className = {
                  clsx("text-lg transition duration-300 ease-in-out focus:text-primary focus:ring-transparent xxsm:text-lg", {
                     "scale-105 border-b-4 border-b-primary rounded-none text-primary": view === "cards"
                  })
               }
            >
               Cards
            </Button>
         </div>
         <div
            id = "workoutsView"
            className = "mx-auto flex w-full max-w-7xl flex-col items-center justify-start px-2 min-[550px]:w-11/12 xl:w-10/12 2xl:w-8/12"
         >
            {
               workouts.length === 0 ? (
                  <div className = "mx-auto flex h-[50vh] w-full items-center justify-center text-center">
                     <div className = "flex flex-col gap-6">
                        <FontAwesomeIcon
                           icon = { faMagnifyingGlass }
                           className = "text-4xl text-primary"
                        />
                        <h1 className = "text-base font-bold">No available workouts</h1>
                     </div>
                  </div>
               ) : view === "table" ? (
                  <Table
                     workouts = { workouts }
                     globalState = { globalState }
                     globalDispatch = { globalDispatch }
                  />
               ) : (
                  view === "cards" && (
                     <Cards
                        workouts = { workouts }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                  )
               )
            }
         </div>
      </div>
   );
}