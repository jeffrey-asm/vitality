"use client";
import Filtering from "@/components/home/workouts/filtering";
import View from "@/components/home/workouts/view";
import Form from "@/components/home/workouts/form";
import Pagination from "@/components/home/workouts/pagination";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkouts, Workout } from "@/lib/workouts/workouts";
import { fetchWorkoutTags } from "@/lib/workouts/tags";
import {
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useReducer,
   useState
} from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import { searchForTitle } from "@/lib/workouts/shared";

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

   // Lower case search string value for case-insensitive comparison
   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Search results for workouts, accounting for pagination
   const results: Workout[] = useMemo(() => {
      // Visible workouts are based on current applied workout filters
      const filtered: Workout[] = globalState.workouts.data.filtered;

      return searchForTitle(filtered, search);
   }, [
      globalState.workouts.data.filtered,
      search
   ]);

   // Pagination calculations for current page interval
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
      try {
         // Fetch user workouts and workout tags
         const [workoutsData, tagsData] = await Promise.all([
            fetchWorkouts(user.id),
            fetchWorkoutTags(user.id)
         ]);

         // Update global state to maintain up-to-date tags, workouts, and paging
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
                  value: Number.parseInt(window.localStorage.getItem("paging") ?? "10")
               }
            }
         });
      } catch (error) {
         console.error(error);
      }
   }, [
      globalState.tags,
      globalState.workouts,
      globalState.workout,
      globalState.paging,
      user
   ]);

   useEffect(() => {
      if (user && !globalState.workouts.data.fetched) {
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
      <main className = "relative w-full lg:w-11/12 mx-auto mt-8 flex flex-col justify-start items-center text-center">
         <Filtering
            globalState = {globalState}
            globalDispatch = {globalDispatch}
         />
         <View
            view = {view}
            setView = {setView}
            workouts = {workoutsSection}
            globalState = {globalState}
            globalDispatch = {globalDispatch}
         />
         <Form
            globalState = {globalState}
            globalDispatch = {globalDispatch}
         />
         <Pagination
            workouts = {results}
            globalState = {globalState}
            globalDispatch = {globalDispatch}
         />
      </main>
   );
}