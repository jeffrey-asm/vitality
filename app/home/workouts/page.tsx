"use client";
import Main from "@/components/global/main";
import View from "@/components/home/workouts/view";
import Filtering from "@/components/home/workouts/filtering";
import Form from "@/components/home/workouts/form";
import Pagination from "@/components/home/workouts/pagination";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkoutTags } from "@/lib/home/workouts/tags";
import { formReducer, VitalityState } from "@/lib/global/state";
import { fetchWorkouts, Workout } from "@/lib/home/workouts/workouts";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

const workouts: VitalityState = {
   search: {
      value: "",
      error: null,
      data: {}
   },
   dateFilter: {
      value: "Is on or after",
      error: null,
      data: {}
   },
   minDate: {
      value: "",
      error: null,
      data: {}
   },
   maxDate: {
      value: "",
      error: null,
      data: {}
   },
   tags: {
      value: null,
      error: null,
      data: {
         options: [],
         selected: [],
         filtered: [],
         dictionary: {},
         fetched: false
      },
      handlesOnChange: true
   },
   workouts: {
      value: [],
      error: null,
      data: {
         selected: new Set<Workout>(),
         appliedDateFiltering: false,
         appliedTagsFiltering: false,
         filtered: [],
         fetched: false
      }
   },
   workout: {
      value: {
         id: "",
         user_id: "",
         title: "",
         date: new Date(),
         image: "",
         description: "",
         exercises: [],
         tagIds: []
      },
      error: null,
      data: {
         display: false
      }
   },
   paging: {
      value: 10,
      error: null,
      data: {},
      handlesOnChange: true
   },
   page: {
      value: 0,
      error: null,
      data: {},
      handlesOnChange: true
   }
};

export default function Page(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards">("table");

   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Case-insensitive title comparison for workouts search
   const results: Workout[] = useMemo(() => {
      const filtered: Workout[] = globalState.workouts.data.filtered;
      const lower = search.toLowerCase();

      return search === "" ?
         filtered : filtered.filter((w) => w.title.toLowerCase().includes(lower));
   }, [
      globalState.workouts.data.filtered,
      search
   ]);

   // Pagination calculations
   const paging: number = globalState.paging.value;
   const page: number = globalState.page.value;

   const workoutsSection: Workout[] = useMemo(() => {
      const low: number = page * paging;
      const high = low + paging;

      return results.slice(low, high);
   }, [
      results,
      paging,
      page
   ]);

   const fetchWorkoutsData = useCallback(async() => {
      // Fetch user workouts and workout tags for global state from database and localStorage
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
                  filtered: [],
                  dictionary: Object.fromEntries(
                     tagsData.map((tag) => [tag.id, tag]),
                  ),
                  fetched: true
               }
            },
            workouts: {
               ...globalState.workouts,
               value: workoutsData,
               data: {
                  ...globalState.workouts.data,
                  filtered: workoutsData,
                  appliedDateFiltering: false,
                  appliedTagsFiltering: false,
                  fetched: true
               }
            },
            workout: {
               ...globalState.workout,
               value: {
                  ...globalState.workout.value,
                  user_id: user.id
               }
            },
            paging: {
               ...globalState.paging,
               value: Number.parseInt(
                  window.localStorage.getItem("paging") ?? "10"
               )
            },
            page: {
               ...globalState.page,
               value: Number.parseInt(
                  window.localStorage.getItem("page") ?? "0"
               )
            }
         }
      });
   }, [
      globalState.tags,
      globalState.workouts,
      globalState.workout,
      globalState.paging,
      globalState.page,
      user
   ]);

   useEffect(() => {
      if (!globalState.workouts.data.fetched) {
         setView(
            window.localStorage.getItem("view") === "cards" ? "cards" : "table",
         );

         fetchWorkoutsData();
      }
   }, [
      user,
      fetchWorkoutsData,
      globalState.workouts.data.fetched,
      globalState.tags,
      globalState.workouts,
      view
   ]);

   return (
      <Main className = "mb-12">
         <Filtering
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <View
            view = { view }
            setView = { setView }
            workouts = { workoutsSection }
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <Form
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <Pagination
            workouts = { results }
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
      </Main>
   );
}