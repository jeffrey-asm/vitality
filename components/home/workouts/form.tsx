import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { addWorkout, updateWorkout, Workout } from "@/lib/workouts/workouts";
import { Tag } from "@/lib/workouts/tags";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash, faPencil, faPlus, faTrashCan, faSignature, faCalendar, faBook, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useCallback, useContext, useMemo, useRef, useState } from "react";
import { filterWorkout } from "@/components/home/workouts/filter";
import Exercises from "./exercises";
import { PopUp } from "@/components/global/popup";

interface WorkoutFormProps {
   cover?: React.ReactNode;
   workout: Workout | undefined;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | null>>;
   reset: (_filterReset: boolean) => void;
}

function updateWorkouts(currentWorkouts: Workout[], returnedWorkout: Workout, method: "add" | "update" | "delete") {
   let newWorkouts: Workout[] = [];

   switch (method) {
   case "delete":
      newWorkouts = [...currentWorkouts].filter(workout => workout.id !== returnedWorkout.id);
      break;
   case "update":
      newWorkouts = [...currentWorkouts].map(workout => (workout.id === returnedWorkout.id ? returnedWorkout : workout));
      break;
   default:
      newWorkouts = [...currentWorkouts, returnedWorkout];
      break;
   }

   return newWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
};

function updateFilteredWorkouts(state: VitalityState, currentFiltered: Workout[],
   returnedWorkout: Workout, method: "add" | "update" | "delete") {
   let newFiltered = [...currentFiltered];

   if (method === "delete") {
      newFiltered = newFiltered.filter(workout => workout.id !== returnedWorkout.id);
   } else {
      newFiltered = newFiltered.filter(workout => workout.id !== returnedWorkout.id);

      if (filterWorkout(state, returnedWorkout)) {
         // New workout passes current filters
         newFiltered.push(returnedWorkout);
      }
   }

   return newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function WorkoutForm(props: WorkoutFormProps): JSX.Element {
   const { workout, cover, state, dispatch, reset } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>(workout);
   const deletePopUpRef = useRef<{ close: () => void }>(null);

   const defaultDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

   const handleWorkoutSubmission = useCallback(async(method: "add" | "update" | "delete", displayNotification: boolean) => {
      const { selected, dictionary } = state.tags.data;

      const payload: Workout = {
         user_id: user.id,
         id: editingWorkout?.id ?? "",
         title: state.title.value.trim(),
         date: new Date(state.date.value),
         image: state.image.value,
         description: state.description.value.trim(),
         // Ensure only existing tag id's are sent to the backend (in case of removal)
         tagIds: selected.map((tag: Tag) => tag?.id).filter((id: string) => dictionary[id] !== undefined),
         exercises: editingWorkout?.exercises ?? []
      };

      // Request to either add or update the workout instance
      const response: VitalityResponse<Workout> = editingWorkout === undefined
         ? await addWorkout(payload)
         : await updateWorkout(payload);

      // Handle successful response
      if (response.status === "Success") {
         const returnedWorkout: Workout = response.body.data;

         const newWorkouts: Workout[] = updateWorkouts(state.workouts.value, returnedWorkout, method);
         const newFiltered: Workout[] = updateFilteredWorkouts(state, state.workouts.data.filtered, returnedWorkout, method);

         // Dispatch the new state with updated workouts
         dispatch({
            type: "updateState",
            value: {
               ...state.workouts,
               data: {
                  ...state.workouts.data,
                  filtered: newFiltered
               },
               value: newWorkouts
            }
         });

         // Display success or failure notification to the user
         if (displayNotification) {
            // Updating exercises should not always display a notification
            updateNotification({
               status: response.status,
               message: response.body.message,
               timer: 1250
            });
         }

         if (method === "add") {
            // Allow workout to be edited
            setEditingWorkout(returnedWorkout);
         }
      } else {
         // Display errors
         dispatch({
            type: "displayErrors",
            value: response
         });
      }
   }, [dispatch, state, updateNotification, user?.id, editingWorkout]);

   const handleInitializeWorkoutState = useCallback(() => {
      // Update input states based on current workout or new workout
      dispatch({
         type: "initializeState",
         value: {
            title: {
               ...state.title,
               value: workout?.title ?? ""
            },
            date: {
               ...state.date,
               // Convert to form MM-DD-YYYY for input value
               value: workout?.date.toISOString().split("T")[0] ?? defaultDate
            },
            image: {
               ...state.image,
               value: workout?.image ?? ""
            },
            description: {
               ...state.description,
               value: workout?.description ?? ""
            },
            tags: {
               ...state.tags,
               data: {
                  ...state.tags.data,
                  // Display all existing tags by their id
                  selected: workout?.tagIds.map((tagId: string) => state.tags.data.dictionary[tagId]) ?? []
               }
            },
            tagsSearch: {
               ...state.tagsSearch,
               value: ""
            }
         }
      });
   }, [defaultDate, dispatch, state.date, state.description, state.image, state.tags,
      state.tagsSearch, state.title, workout]);

   return (
      <PopUp
         text = {editingWorkout !== undefined ? "Edit Workout" : "New Workout"}
         className = "max-w-3xl"
         buttonClassName = "w-[9.5rem] h-[2.9rem] text-white text-md font-semibold bg-primary hover:scale-[1.05] transition duration-300 ease-in-out"
         icon = {faPlus}
         onClose = {() => {
            if (workout === undefined) {
               // Cleanup new workout form component for future "New Workout" usage
               setEditingWorkout(undefined);
            }
         }}
         onClick = {handleInitializeWorkoutState}
         cover = {
            cover ?? <FontAwesomeIcon icon = {faPencil} className = "text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" />
         }
      >
         <div className = "relative">
            <div className = "flex flex-col justify-center align-center text-center gap-3">
               <FontAwesomeIcon
                  icon = {faPersonRunning}
                  className = "text-6xl text-primary mt-1"
               />
               <h1 className = "text-3xl font-bold text-black mb-2">
                  {editingWorkout !== undefined ? "Edit" : "New"} Workout
               </h1>
            </div>
            <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset(false)}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Input id = "title" type = "text" label = "Title" icon = {faSignature} input = {state.title} dispatch = {dispatch} autoFocus required />
               <Input id = "date" type = "date" label = "Title" icon = {faCalendar} input = {state.date} dispatch = {dispatch} autoFocus required />

               <TagSelection input = {state.tags} label = "Tags " dispatch = {dispatch} state = {state} />
               <TextArea id = "description" type = "text" label = "Description" icon = {faBook} input = {state.description} dispatch = {dispatch} />
               <ImageSelection input = {state.image} label = "URL" icon = {faLink} dispatch = {dispatch} />
               {
                  workout !== undefined && editingWorkout !== undefined && (
                     <PopUp
                        className = "max-w-xl"
                        ref = {deletePopUpRef}
                        cover = {
                           <Button
                              type = "button"
                              className = "w-full bg-red-500 text-white h-[2.6rem]"
                              icon = {faTrash}
                           >
                              Delete
                           </Button>
                        }
                     >
                        <div className = "flex flex-col justify-center items-center gap-4">
                           <FontAwesomeIcon icon = {faTrashCan} className = "text-red-500 text-4xl" />
                           <p className = "font-bold">
                              Are you sure you want to delete this workout?
                           </p>
                           <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                              <Button
                                 type = "button"
                                 className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {() => {
                                    // Close the popup for deletion confirmation
                                    if (deletePopUpRef.current) {
                                       deletePopUpRef.current.close();
                                    }
                                 }}
                              >
                                 No, cancel
                              </Button>
                              <Button
                                 type = "button"
                                 className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {async() => handleWorkoutSubmission("delete", true)}
                              >
                                 Yes, I&apos;m sure
                              </Button>
                           </div>
                        </div>
                     </PopUp>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white h-[2.6rem]"
                  icon = {props !== undefined ? faCloudArrowUp : faSquarePlus}
                  onClick = {() => handleWorkoutSubmission(editingWorkout === undefined ? "add" : "update", true)}
               >
                  {
                     editingWorkout !== undefined ? "Save" : "Create"
                  }
               </Button>
               {
                  editingWorkout !== undefined && (
                     <Exercises workout = {editingWorkout} globalState = {state} globalDispatch = {dispatch} setEditingWorkout = {setEditingWorkout} />
                  )
               }
            </div>
         </div>
      </PopUp>
   );
};