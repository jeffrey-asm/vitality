"use client";
import WorkoutFiltering from "@/components/home/workouts/filter";
import WorkoutForm from "@/components/home/workouts/form";
import WorkoutTable from "@/components/home/workouts/table";
import WorkoutCards from "@/components/home/workouts/cards";
import Button from "@/components/global/button";
import Pagination from "@/components/home/workouts/pagination";
import clsx from "clsx";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkouts, Workout } from "@/lib/workouts/workouts";
import { fetchWorkoutTags } from "@/lib/workouts/tags";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import { searchForTitle } from "@/lib/workouts/shared";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const workouts: VitalityState = {
   // Global filtering inputs
   search: {
      value: "",
      error: null,
      data: {}
   },
   type: {
      value: "Is on or after",
      error: null,
      data: {}
   },
   min: {
      value: "",
      error: null,
      data: {}
   },
   max: {
      value: "",
      error: null,
      data: {}
   },
   // User tags
   tags: {
      value: null,
      error: null,
      data: {
         // [tag.id] -> tag
         dictionary: {},
         options: [],
         selected: [],
         handlesChanges: true
      }
   },
   // Current editing workout
   workout: {
      value: {
         id: "",
         user_id: "",
         title: "",
         date: new Date(),
         image: "",
         description: "",
         tagIds: [],
         exercises: []
      },
      error: null,
      data: {}
   },
   // User workouts
   workouts: {
      value: [],
      error: null,
      data: {
         fetched: false,
         selected: new Set<Workout>(),
         dateFiltered: false,
         tagsFiltered: false,
         // Based on search title pattern, data interval, tags, etc.
         filtered: []
      }
   },
   paging: {
      value: 10,
      error: null,
      data: {
         page: 0,
         handlesChanges: true
      }
   },
   // Exercise form
   exerciseTitle: {
      value: "",
      error: null,
      data: {
         id: "",
         edit: false
      }
   },
   weight: {
      value: "",
      error: null,
      data: {}
   },
   repetitions: {
      value: "",
      error: null,
      data: {}
   },
   hours: {
      value: "",
      error: null,
      data: {}
   },
   minutes: {
      value: "",
      error: null,
      data: {}
   },
   seconds: {
      value: "",
      error: null,
      data: {}
   },
   text: {
      value: "",
      error: null,
      data: {}
   },
   // Store editing exercise ID to control interning inputs
   exerciseId: {
      value : null,
      error: null,
      data: {
         // Editing set ID to display potential inputs for
         setId: ""
      }
   }
};

export default function Page(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards">("table");

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Filtered based on selected tags or date intervals
   const filtered: Workout[] = globalState.workouts.data.filtered;

   // Search results for workouts, accounting for pagination
   const results: Workout[] = useMemo(() => {
      return searchForTitle(filtered, search);
   }, [filtered, search]);

   const pages: number = globalState.paging.value;
   const page: number = globalState.paging.data.page;

   const low: number = page * pages;
   const high = low + pages - 1;

   const workoutsSection: Workout[] = useMemo(() => {
      return results.slice(low, high + 1);
   }, [results, low, high]);

   const fetchWorkoutsData = useCallback(async() => {
      if (user !== undefined && globalState.workouts.data.fetched === false) {
         try {
            const [workoutsData, tagsData] = await Promise.all([
               fetchWorkouts(user.id),
               fetchWorkoutTags(user.id)
            ]);

            globalDispatch({
               type: "initializeState",
               value: {
                  tags: {
                     ...globalState.tags,
                     data: {
                        ...globalState.tags.data,
                        options: tagsData,
                        selected: [],
                        filteredSelected: [],
                        dictionary: Object.fromEntries(tagsData.map(tag => [tag.id, tag]))
                     }
                  },
                  workout: {
                     data: {
                        ...globalState.workout.data
                     },
                     value: {
                        ...globalState.workout.value,
                        user_id: user.id
                     }
                  },
                  workouts: {
                     ...globalState.workouts,
                     value: workoutsData,
                     data: {
                        ...globalState.workouts.data,
                        filtered: workoutsData,
                        dateFiltered: false,
                        tagsFiltered: false,
                        fetched: true
                     }
                  }
               }
            });
         } catch (error) {
            console.error(error);
         }
      }
   }, [globalState.tags, globalState.workout.data, globalState.workout.value, globalState.workouts, user]);

   useEffect(() => {
      if (!(globalState.workouts.data.fetched)) {
         fetchWorkoutsData();
      }
   }, [fetchWorkoutsData, globalState.workouts.data.fetched, globalState.tags, globalState.workouts]);

   return (
      <main className = "w-full mx-auto my-6 flex min-h-screen flex-col items-center justify-start gap-4 text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className = "text-lg text-gray-700 mt-4 max-w-[25rem] mx-auto">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div className = "flex justify-center w-full mx-auto">
            <WorkoutForm
               workout = {globalState.workout.value}
               globalState = {globalState}
               globalDispatch = {globalDispatch}
               cover = {
                  <Button
                     type = "button"
                     className = "bg-primary text-white w-full h-[2.6rem] p-4"
                     icon = {faPlus}
                     onClick = {() => {
                        globalDispatch({
                           type: "updateState",
                           value: {
                              id: "workout",
                              input: {
                                 ...globalState.workout,
                                 value: {
                                    id: "",
                                    user_id: user?.id ?? "",
                                    title: "",
                                    date: new Date(),
                                    image: "",
                                    description: "",
                                    tagIds: [],
                                    exercises: []
                                 }
                              }
                           }
                        });
                     }}
                  >
                     New Workout
                  </Button>
               }
            />
         </div>
         {
            <div className = "w-full mx-auto flex flex-col justify-center items-center">
               <div className = "relative w-10/12 flex justify-start items-center text-left gap-2 my-2">
                  <WorkoutFiltering
                     globalState = {globalState}
                     globalDispatch = {globalDispatch} />
               </div>
               <div className = "relative w-10/12 flex justify-start items-center text-left gap-2 mt-2">
                  <Button
                     onClick = {() => setView("table")}
                     className = {clsx("transition duration-300 ease-in-out", {
                        "scale-105 border-b-4 border-b-primary rounded-none": view === "table"
                     })}>
                     Table
                  </Button>
                  <Button
                     onClick = {() => setView("cards")}
                     className = {clsx("transition duration-300 ease-in-out", {
                        "scale-105  border-b-4 border-b-primary rounded-none": view === "cards"
                     })}>
                     Cards
                  </Button>
               </div>
               {
                  view === "table" ? (
                     <WorkoutTable
                        workouts = {workoutsSection}
                        globalState = {globalState}
                        globalDispatch = {globalDispatch} />
                  ) : (
                     <WorkoutCards
                        workouts = {workoutsSection}
                        globalState = {globalState}
                        globalDispatch = {globalDispatch} />
                  )
               }
               {
                  results.length > 0 && (
                     <Pagination
                        workouts = {results}
                        globalState = {globalState}
                        globalDispatch = {globalDispatch} />
                  )
               }
            </div>
         }
      </main >
   );
}