"use client";
import WorkoutForm from "@/components/home/workouts/form";
import WorkoutTable from "@/components/home/workouts/table";
import WorkoutCards from "@/components/home/workouts/cards";
import Button from "@/components/global/button";
import clsx from "clsx";
import Input from "@/components/global/input";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkouts, Workout } from "@/lib/workouts/workouts";
import { fetchWorkoutTags } from "@/lib/workouts/tags";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import { searchForTitle } from "@/lib/workouts/shared";
import { faTag, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FilterByDate } from "@/components/home/workouts/filter";

const workouts: VitalityState = {
   status: "Initial",
   inputs: {
      title: {
         type: "text",
         id: "title",
         value: "",
         error: null,
         data: {}
      },
      date: {
         type: "date",
         id: "date",
         value: "",
         error: null,
         data: {}
      },
      description: {
         type: "text",
         id: "description",
         value: "",
         error: null,
         data: {}
      },
      image: {
         type: "text",
         id: "image",
         value: "",
         error: null,
         data: {
            handlesChanges: true
         }
      },
      tags: {
         type: null,
         id: "tags",
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
      tagsTitle: {
         type: "text",
         id: "tagsTitle",
         value: "",
         error: null,
         data: {}
      },
      tagsColor: {
         type: "text",
         id: "tagsColor",
         value: null,
         error: null,
         data: {
            handlesChanges: true
         }
      },
      tagsSearch: {
         type: "text",
         id: "tagsSearch",
         value: "",
         error: null,
         data: {}
      },
      workouts: {
         type: null,
         id: "workouts",
         value: [],
         error: null,
         data: {
            fetched: false,
            selected: new Set<Workout>(),
            // Based on search title pattern, data interval, tags, etc.
            visible: []
         }
      },
      workoutsSearch: {
         type: "text",
         id: "workoutsSearch",
         value: "",
         error: null,
         data: {}
      },
      workoutsDateFilter: {
         type: "select",
         value: "Is on or after",
         id: "workoutsDateFilter",
         error: null,
         data: {
            options: ["Is on or after", "Is on or before", "Is between (inclusive)"],
            default: "Is on or after",
         }
      },
      workoutsMinDate: {
         type: "date",
         id: "workoutsMinDate",
         value: "",
         error: null,
         data: {}
      },
      workoutsMaxDate: {
         type: "date",
         id: "workoutsMaxDate",
         value: "",
         error: null,
         data: {}
      }
   },
   response: null
};

export default function Page() {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards">("table");

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return state.inputs.workoutsSearch.value.trim().toLowerCase();
   }, [state.inputs.workoutsSearch]);

   // Differentiate between visible and overall workouts
   const visible: Workout[] = state.inputs.workouts.data.visible;
   const workoutsResults: Workout[] = state.inputs.workouts.value;

   const visibleOptions: Set<Workout> = useMemo(() => {
      return new Set<Workout>(visible);
   }, [visible]);

   const searchOptions = useMemo(() => {
      return workoutsResults.filter((workout: Workout) => !(visibleOptions.has(workout)));
   }, [workoutsResults, visibleOptions]);

   // Search results for workouts
   const workoutSearchResults: Workout[] = useMemo(() => {
      return searchForTitle(searchOptions, search);
   }, [searchOptions, search]);

   const fetchWorkoutsData = useCallback(async() => {
      if (user !== undefined && state.inputs.workouts.data.fetched === false) {
         try {
            const [workoutsData, tagsData] = await Promise.all([
               fetchWorkouts(user.id),
               fetchWorkoutTags(user.id)
            ]);

            dispatch({
               type: "initializeState",
               value: {
                  tags: {
                     ...state.inputs.tags,
                     data: {
                        ...state.inputs.tags.data,
                        options: tagsData,
                        selected: [],
                        dictionary: Object.fromEntries(tagsData.map(tag => [tag.id, tag]))
                     }
                  },
                  workouts: {
                     ...state.inputs.workouts,
                     value: workoutsData,
                     data: {
                        ...state.inputs.workouts.data,
                        fetched: true
                     }
                  }
               }
            });
         } catch (error) {
            console.error("Failed to fetch workouts or tags:", error);
         }
      }
   }, [user, state.inputs.tags, state.inputs.workouts, dispatch]);

   const handleReset = useMemo(() => {
      return () => {
         dispatch({
            // Reset state for new workout form
            type: "resetState",
            value: {
               // Reset selected tags data
               tags: {
                  data: {
                     ...state.inputs.tags.data,
                     selected: []
                  },
                  value: state.inputs.tags.value
               },
               workouts: {
                  data: {
                     ...state.inputs.workouts.data
                  },
                  value: state.inputs.workouts.value
               }
            }
         });
      };
   }, [state.inputs.tags.data, state.inputs.tags.value,
      state.inputs.workouts.data, state.inputs.workouts.value]);


   useEffect(() => {
      if (!(state.inputs.workouts.data.fetched)) {
         fetchWorkoutsData();
      }
   }, [fetchWorkoutsData, state.inputs.workouts.data.fetched, state.inputs.tags, state.inputs.workouts]);

   return (
      <main className = "w-full mx-auto my-6 flex min-h-screen flex-col items-center justify-start gap-4 text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className = "text-lg text-gray-700 mt-4 max-w-[25rem] mx-auto">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div className = "flex justify-center w-full mx-auto">
            <WorkoutForm
               workout = {undefined}
               state = {state}
               dispatch = {dispatch}
               reset = {handleReset}
            />
         </div>
         {
            workoutsResults.length > 0 ? (
               <div className = "w-full mx-auto flex flex-col justify-center items-center">
                  <div className = "relative w-10/12 flex justify-start items-center text-left gap-2 my-2">
                     <div className = "w-full flex flex-col justify-start  gap-2">
                        <Input input = {state.inputs.workoutsSearch} label = "Search" icon = {faPersonRunning} dispatch = {dispatch} />
                        <div className = "w-full flex flex-row justify-start items-center gap-2">
                           <FilterByDate state = {state} dispatch = {dispatch} />
                           <Button
                              type = "button"
                              className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.6rem] text-sm"

                           >
                              <FontAwesomeIcon icon = {faTag} className = "text-xs" />
                              Filter by Tags
                           </Button>
                        </div>
                     </div>
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
                        <WorkoutTable workouts = {workoutSearchResults} state = {state} dispatch = {dispatch} reset = {handleReset} />
                     ) : (
                        <WorkoutCards workouts = {workoutSearchResults} state = {state} dispatch = {dispatch} reset = {handleReset} />
                     )
                  }
               </div>
            ) : (
               null
            )
         }
      </main >
   );
}