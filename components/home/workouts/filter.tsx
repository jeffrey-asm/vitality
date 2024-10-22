import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Select from "@/components/global/select";
import { PopUp } from "@/components/global/popup";
import { sendErrorMessage, sendSuccessMessage, VitalityInputState, VitalityProps, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCalendar, faMagnifyingGlass, faArrowsUpDown, faArrowRight, faArrowLeft, faArrowRotateLeft, faTag, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo } from "react";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { Tag } from "@/lib/workouts/tags";

export function filterByTags(tagIds: Set<string>, workout: Workout): boolean {
   // Ensure tags within the given workout cover entire provided set of tag id's
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (tagIds.has(tagId)) {
         size++;
      }
   }

   return size >= tagIds.size;
}

export function filterByDate(globalState: VitalityState, workout: Workout): boolean {
   // Apply date filter using min and/or max date and specific method (before, after, between)
   const dateFilter: string = globalState.type.value;
   const minDate: Date = new Date(globalState.min.value);
   const maxDate: Date = new Date(globalState.max.value);

   switch (dateFilter) {
      case "Is on or after":
         return isNaN(minDate.getTime()) || workout.date >= minDate;
      case "Is on or before":
         return workout.date <= maxDate;
      default:
         return workout.date >= minDate && workout.date <= maxDate;
   }
}


export function filterWorkout(globalState: VitalityState, workout: Workout): boolean {
   const { dateFiltered, tagsFiltered } = globalState.workouts.data;

   const tagIds: Set<string> = new Set(
      globalState.tags.data.selected.map((tag: Tag) => tag.id)
   );

   // Filter by date and/or applied tags, if applicable for either method
   return (!(dateFiltered) || filterByDate(globalState, workout)) && (!(tagsFiltered) || filterByTags(tagIds, workout));
}

export function getFilteredTagsWorkouts(props: VitalityProps): Workout[] | null {
   const { globalState } = props;
   const tagsFiltered: boolean = globalState.workouts.data.tagsFiltered;

   const tagIds: Set<string> = new Set(
      globalState.tags.data.selected.map((tag: Tag) => tag.id)
   );

   const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter((workout: Workout) => {
      return !(tagsFiltered) || filterByTags(tagIds, workout);
   });

   return filteredWorkouts;
}

export function getFilteredDateWorkouts(props: VitalityProps): Workout[] | null {
   const { globalState, globalDispatch } = props;

   // Handle invalid inputs
   const errors = {};

   const filter: string = globalState.type.value;
   const minDate: Date = new Date(globalState.min.value);
   const maxDate: Date = new Date(globalState.max.value);
   const isRange: boolean = filter === "Is between";

   const validateDate = (date: Date, key: string) => {
      if (isNaN(date.getTime())) {
         errors[key] = ["Date must be non-empty"];
      }
   };

   // For range method, both date inputs are validated
   if (isRange || filter === "Is on or after") {
      validateDate(minDate, "min");
   }

   if (isRange || filter === "Is on or before") {
      validateDate(maxDate, "max");
   }

   // Invalid range errors
   if (isRange && !(Object.keys(errors).length) && minDate > maxDate) {
      errors["min"] = errors["max"] = ["Date range must be valid"];
   }

   if (Object.keys(errors).length > 0) {
      // Display all errors
      globalDispatch({
         type: "updateErrors",
         value: sendErrorMessage<null>("Error", "Invalid Date filter(s)", null, errors)
      });
   } else {
      // Remove all errors, if any, and apply filter all available workouts
      globalDispatch({
         type: "updateErrors",
         value: sendSuccessMessage<null>("Success", null)
      });

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter((workout: Workout) => {
         return filterWorkout(globalState, workout);
      });

      return filteredWorkouts;
   }

   return null;
}

interface DateInputProps extends VitalityProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, globalState, globalDispatch } = props;
   const isMinDate = input === globalState.min;
   const icon = isMinDate ? faArrowRight : faArrowLeft;

   return (
      <div className = "flex flex-col justify-center items-center mt-2">
         <div className = "text-primary">
            <FontAwesomeIcon
               icon = {icon}
               className = "text-lg text-primary my-2"
            />
         </div>
         <div className = "w-full mx-auto">
            <Input
               id = {isMinDate ? "min" : "max"}
               type = "date"
               label = "Title"
               icon = {faCalendar}
               input = {input}
               dispatch = {globalDispatch}
               required />
         </div>
      </div>
   );
}

function FilterByDate(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const type: string = globalState.type.value;

   const inputs: { [key: string]: VitalityInputState | undefined } = useMemo(() => {
      return {
         "Is between": undefined,
         "Is on or after": globalState.min,
         "Is on or before": globalState.max
      };
   }, [globalState.min, globalState.max]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[type];
   }, [inputs, type]);

   const handleApplyFilterClick = useCallback(() => {
      // Apply date filter
      const filteredWorkouts: Workout[] | null = getFilteredDateWorkouts(props);

      if (filteredWorkouts !== null) {
         // Update filtered state for global state
         globalDispatch({
            type: "updateState",
            value: {
               id: "workouts",
               input: {
                  ...globalState.workouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: filteredWorkouts,
                     dateFiltered: true
                  }
               }
            }
         });
      }
   }, [props, globalState.workouts, globalDispatch]);

   const handleReset = useCallback(() => {
      // Resetting the date filter should fall back to tags filtered view, if applied
      const tagsFiltered: boolean = globalState.workouts.data.tagsFiltered;
      const tagIds: Set<string> = new Set(
         globalState.tags.data.selected.map((tag: Tag) => tag.id)
      );

      // All selected and filtered workouts remain the same, but additional filtered may be added as date filter is removed
      const newFiltered: Workout[] = [...globalState.workouts.value].filter((workout) => {
         return !(tagsFiltered) || filterByTags(tagIds, workout);
      });

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset global filtered workouts
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  dateFiltered: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Reset date filtering inputs
            type: {
               ...globalState.type,
               value: "Is on or after"
            },
            min: {
               ...globalState.min,
               value: ""
            },
            max: {
               ...globalState.max,
               value: ""
            },
            // Reset to first page view
            paging: {
               data: {
                  ...globalState.paging.data,
                  page: 0
               },
               value: globalState.paging.value
            }
         }
      });
   }, [globalDispatch, globalState.max, globalState.min, globalState.tags.data.selected,
      globalState.type, globalState.workouts.data, globalState.workouts.value,
      globalState.paging.data, globalState.paging.value]);

   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.9rem] text-sm"
            >
               <FontAwesomeIcon
                  icon = {faCalendar}
                  className = "text-xs" />
               Filter by Date
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = {faCalendar}
               className = "text-3xl text-primary mt-1"
            />
            <h1 className = "text-2xl font-bold text-black mb-2">
               Filter by Date
            </h1>
            <div className = "relative">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {handleReset}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Select
                  id = "type"
                  type = "select"
                  values = {["Is on or after", "Is on or before", "Is between"]}
                  input = {globalState.type}
                  label = "Type"
                  icon = {faCalendar}
                  dispatch = {globalDispatch} />
               {
                  input !== undefined ? (
                     // Min or max
                     <div>
                        <DateInput
                           {...props}
                           input = {input} />
                     </div>
                  ) : (
                     // Range (Min and Max Date Input's)
                     <div className = "my-2">
                        <Input
                           id = "min"
                           type = "date"
                           label = "Min"
                           icon = {faCalendar}
                           input = {globalState.min}
                           dispatch = {globalDispatch}
                           required />
                        <FontAwesomeIcon
                           icon = {faArrowsUpDown}
                           className = "text-lg text-primary my-2"
                        />
                        <Input
                           id = "max"
                           type = "date"
                           label = "Max"
                           icon = {faCalendar}
                           input = {globalState.max}
                           dispatch = {globalDispatch}
                           required />
                     </div>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white font-bold w-full h-[2.6rem] text-sm mt-3"
                  icon = {faMagnifyingGlass}
                  onClick = {handleApplyFilterClick}
               >
                  Apply
               </Button>
            </div>
         </div>
      </PopUp>
   );
}

function FilterByTags(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;

   const handleInitializeFilteredTags = useCallback(() => {
      // Selected tags are applied from prior filter form selection
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  selected: globalState.tags.data.filteredSelected
               }
            }
         }
      });
   }, [globalState.tags, globalDispatch]);

   const handleApplyFilterClick = useCallback(() => {
      // Apply tag filter
      const filteredWorkouts: Workout[] | null = getFilteredTagsWorkouts(props);

      if (filteredWorkouts !== null) {
         globalDispatch({
            type: "updateStates",
            value: {
               // Update filtered workouts state after applying tags filtering
               workouts: {
                  ...globalState.workouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: filteredWorkouts,
                     tagsFiltered: true
                  }
               },
               // Cache filtered tags selection
               tags: {
                  ...globalState.tags,
                  data: {
                     ...globalState.tags.data,
                     filteredSelected: globalState.tags.data.selected
                  }
               }
            }
         });
      }
   }, [globalDispatch, globalState.tags, globalState.workouts, props]);

   const handleReset = useCallback(() => {
      // Resetting the tags filter should fall back to date filtered view, if applied
      const dateFiltered: boolean = globalState.workouts.data.dateFiltered;

      // All selected and filtered workouts remain the same, but additional filtered may be added as tag filter is removed
      const newFiltered: Workout[] = [...globalState.workouts.value].filter((workout) => {
         return !(dateFiltered) || filterByDate(globalState, workout);
      });

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset global filtered workouts
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  tagsFiltered: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Selected and filtered selected should reset to empty lists
            tags: {
               data: {
                  ...globalState.tags.data,
                  selected: [],
                  filteredSelected: []
               },
               value: globalState.tags.value
            }
         }
      });
   }, [globalDispatch, globalState]);

   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.9rem] text-sm"
               onClick = {handleInitializeFilteredTags}
            >
               <FontAwesomeIcon
                  icon = {faTag}
                  className = "text-xs" />
               Filter by Tags
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = {faTag}
               className = "text-3xl text-primary mt-1"
            />
            <h1 className = "text-2xl font-bold text-black mb-2">
               Filter by Tags
            </h1>
            <div className = "relative">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {handleReset}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <div className = "w-full mx-auto my-2">
                  <TagSelection {...props} />

                  <Button
                     type = "button"
                     className = "bg-primary text-white font-bold w-full h-[2.6rem] text-sm mt-3"
                     icon = {faMagnifyingGlass}
                     onClick = {handleApplyFilterClick}
                  >
                     Apply
                  </Button>
               </div>
            </div>
         </div>
      </PopUp>
   );
}

export default function WorkoutFiltering(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;

   return (
      <div className = "w-full flex flex-col justify-start  gap-2">
         <Input
            id = "search"
            type = "text"
            label = "Search"
            icon = {faPersonRunning}
            input = {globalState.search}
            dispatch = {globalDispatch}
            autoFocus />
         <div className = "w-full flex flex-row justify-between items-center gap-2">
            <div className = "flex flex-row gap-2">
               <FilterByDate {...props} />
               <FilterByTags {...props} />
            </div>
         </div>
      </div>
   );
}