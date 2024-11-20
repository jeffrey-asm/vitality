"use server";
import prisma from "@/client";
import { z } from "zod";
import {
   sendSuccessMessage,
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";
import { formatWorkout } from "@/lib/home/workouts/shared";
import { Exercise } from "@/lib/home/workouts/exercises";
import { uuidSchema } from "@/lib/global/zod";
import { getAppliedWorkoutTagUpdates } from "@/lib/home/workouts/tags";

export type Workout = {
  id: string;
  user_id: string;
  title: string;
  date: Date;
  image: string;
  description: string;
  tagIds: string[];
  exercises: Exercise[];
};

const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))$/i;
const nextMediaRegex =
  /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

const workoutsSchema = z.object({
   user_id: uuidSchema("user", "required"),
   id: uuidSchema("workout", "required"),
   title: z
      .string()
      .trim()
      .min(1, { message: "Title must be at least 1 character" })
      .max(50, { message: "Title must be at most 50 characters" }),
   date: z
      .date({
         required_error: "Date is required",
         invalid_type_error: "Date is required"
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "Date must not be after today"
      }),
   description: z.string().optional().or(z.literal("")),
   image: z
      .string()
      .refine((value) => urlRegex.test(value) || nextMediaRegex.test(value), {
         message: "Image URL must be valid"
      }).or(z.literal("")),
   tags: z.array(z.string()).optional()
});

const newWorkoutSchema = workoutsSchema.extend({
   id: uuidSchema("workout", "new")
});

export async function fetchWorkouts(user_id: string): Promise<Workout[]> {
   try {
      const workouts = await prisma.workouts.findMany({
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         },
         where: {
            user_id: user_id
         },
         orderBy: {
            date: "desc"
         }
      });

      return workouts.map((workout) => formatWorkout(workout));
   } catch (error) {
      return [];
   }
}

export async function addWorkout(
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      const fields = newWorkoutSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage("Invalid workout fields",
            fields.error.flatten().fieldErrors,
         );
      }

      // Create new workout with basic properties and an additional nested create operation for applied workout tags
      const newWorkout = await prisma.workouts.create({
         data: {
            user_id: workout.user_id,
            title: workout.title.trim(),
            date: workout.date,
            description: workout.description?.trim(),
            image: workout.image?.trim(),
            workout_applied_tags: {
               create: workout.tagIds.map((tagId: string) => ({ tag_id: tagId }))
            }
         },
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         }
      });

      return sendSuccessMessage("Added new workout", formatWorkout(newWorkout));
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateWorkout(
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      const fields = workoutsSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage("Invalid workout fields",
            fields.error.flatten().fieldErrors,
         );
      } else {
         // Fetch existing tags first for data integrity
         const existingWorkout = await prisma.workouts.findFirst({
            where: {
               id: workout.id,
               user_id: workout.user_id
            },
            include: {
               workout_applied_tags: {
                  select: {
                     workout_id: true,
                     tag_id: true
                  }
               },
               exercises: {
                  include: {
                     sets: true
                  },
                  orderBy: {
                     exercise_order: "asc"
                  }
               }
            }
         });

         if (!existingWorkout) {
            return sendErrorMessage(
               "Workout does not exist based on user and/or workout ID",
               null
            );
         }

         const { adding, removing } = await getAppliedWorkoutTagUpdates(existingWorkout, workout);

         const updatedWorkout = await prisma.workouts.update({
            where: {
               id: workout.id,
               user_id: workout.user_id
            },
            data: {
               title: workout.title.trim(),
               date: workout.date,
               description: workout.description?.trim(),
               image: workout.image?.trim(),
               workout_applied_tags: {
                  // Disconnect existing applied tags
                  deleteMany: {
                     tag_id: { in: removing }
                  },
                  // Create new applied tags
                  createMany: {
                     data: adding.map((tagId: string) => ({
                        tag_id: tagId
                     }))
                  }
               }
            },
            include: {
               workout_applied_tags: {
                  select: {
                     workout_id: true,
                     tag_id: true
                  }
               },
               exercises: {
                  include: {
                     sets: true
                  },
                  orderBy: {
                     exercise_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated workout",
            formatWorkout(updatedWorkout),
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function deleteWorkouts(
   workouts: Workout[],
   user_id: string,
): Promise<VitalityResponse<number>> {
   const errors = {};

   if (!uuidSchema("user", "required").safeParse(user_id).success) {
      errors["user_id"] = ["ID for user must be in UUID format"];
   }

   try {
      const ids: string[] = [];

      for (const workout of workouts) {
         if (!uuidSchema("workout", "required").safeParse(workout.id).success) {
            errors["id"] = ["ID for all workouts must be in UUID format"];
            break;
         }

         ids.push(workout.id);
      }

      if (Object.keys(errors).length > 0) {
         return sendErrorMessage("Invalid workout ID fields", errors);
      }

      const response = await prisma.workouts.deleteMany({
         where: {
            id: {
               in: ids
            },
            user_id: user_id
         }
      });

      return sendSuccessMessage(
         `Deleted ${response.count} workout${response.count === 1 ? "" : "s"}`,
         response.count,
      );
   } catch (error) {
      return sendFailureMessage(error);
   }
}