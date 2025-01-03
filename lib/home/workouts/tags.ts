"use server";
import { workout_applied_tags } from "@prisma/client";
import { z } from "zod";

import { authorizeAction } from "@/lib/authentication/session";
import prisma from "@/lib/database/client";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { uuidSchema } from "@/lib/global/zod";
import { Workout } from "@/lib/home/workouts/workouts";

const colors = new Set([
   "rgb(55, 55, 55)",
   "rgb(90, 90, 90)",
   "rgb(96, 59, 44)",
   "rgb(133, 76, 29)",
   "rgb(131, 94, 51)",
   "rgb(43, 89, 63)",
   "rgb(40, 69, 108)",
   "rgb(73, 47, 100)",
   "rgb(105, 49, 76)",
   "rgb(110, 54, 48)"
]);

export type Tag = {
  user_id: string;
  id: string;
  title: string;
  color: string;
};

const workoutTagSchema = z.object({
   user_id: uuidSchema("user", "required"),
   id: uuidSchema("workout tag", "required"),
   title: z
      .string()
      .trim()
      .min(3, {
         message: "Title must be at least 3 characters"
      })
      .max(30, {
         message: "Title must be at most 30 characters"
      }),
   color: z.string().trim().refine((string) => colors.has(string), {
      message: "Color must be one of the default options"
   })
});

const newWorkoutTagSchema = workoutTagSchema.extend({
   id: uuidSchema("workout tag", "new")
});

export async function fetchWorkoutTags(user_id: string): Promise<Tag[]> {
   try {
      await authorizeAction(user_id);

      return await prisma.workout_tags.findMany({
         where: {
            user_id: user_id
         }
      });
   } catch (error) {
      console.error(error);

      return [];
   }
}

export async function addWorkoutTag(user_id: string, tag: Tag): Promise<VitalityResponse<Tag>> {
   try {
      await authorizeAction(user_id);

      const fields = newWorkoutTagSchema.safeParse(tag);

      if (!fields.success) {
         const errors = fields.error.flatten().fieldErrors;
         return sendErrorMessage("Invalid workout tag fields", errors);
      }

      // Workout tags are unique based on their titles
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            title: tag.title.trim(),
            user_id: user_id
         }
      });

      if (existingTag) {
         return sendErrorMessage("Workout tag title already exists", {
            title: ["Workout tag title already exists"]
         });
      }

      const newTag: Tag = await prisma.workout_tags.create({
         data: {
            user_id: user_id,
            title: tag.title.trim(),
            color: tag.color.trim()
         }
      });

      return sendSuccessMessage("Successfully created workout tag", newTag);
   } catch (error) {
      console.error(error);

      return sendFailureMessage(error);
   }
}

export async function updateWorkoutTag(user_id: string, tag: Tag, method: "update" | "delete"): Promise<VitalityResponse<Tag>> {
   try {
      await authorizeAction(user_id);

      const fields = workoutTagSchema.safeParse(tag);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid workout tag fields",
            fields.error.flatten().fieldErrors
         );
      }

      // Ensure the workout tag exists
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            id: tag.id.trim(),
            user_id: user_id.trim()
         }
      });

      if (!existingTag) {
         return sendErrorMessage(
            "Workout tag does not exist based on user and/or tag ID",
            null
         );
      }

      // Update or remove the provided workout tag
      switch (method) {
         case "update":
            // Ensure updating title with a different ID doesn't already exist
            const conflict = await prisma.workout_tags.findFirst({
               where: {
                  title: tag.title.trim(),
                  user_id: user_id,
                  NOT: {
                     id: tag.id
                  }
               }
            });

            if (conflict) {
               return sendErrorMessage(
                  "Workout tag title already exists", {
                     title: ["Workout tag title already exists"]
                  }
               );
            } else {
               const newTag = await prisma.workout_tags.update({
                  where: {
                     id: tag.id,
                     user_id: user_id
                  },
                  data: {
                     title: tag.title.trim(),
                     color: tag.color.trim()
                  }
               });

               return sendSuccessMessage("Successfully updated workout tag", newTag);
            }
         case "delete":
            const deletedTag = await prisma.workout_tags.delete({
               where: {
                  id: tag.id,
                  user_id: user_id
               }
            });

            return sendSuccessMessage(
               "Successfully deleted workout tag",
               deletedTag
            );
      }
   } catch (error) {
      console.error(error);

      return sendFailureMessage(error);
   }
}

export async function getAppliedTagUpdates(
   existingWorkout: any,
   newWorkout: Workout
): Promise<{existing: string[], adding: string[]; removing: string[]}> {
   // Extract existing applied workout tag IDs
   const existing: Set<string> = new Set(
      existingWorkout.workout_applied_tags.map(
         (tag: workout_applied_tags) => tag.tag_id
      )
   );

   // Format adding, removing, and existing tags arrays
   const adding: Set<string> = new Set(newWorkout.tagIds);

   const addingTags: string[] = Array.from(adding).filter(
      (id: string) => !existing.has(id)
   );

   const removingTags: string[] = Array.from(existing).filter(
      (id: string)  => !adding.has(id)
   );

   const existingTags: string[] = Array.from(existing).filter(
      (id: string)  => existing.has(id) && adding.has(id)
   );

   // Return formatted tag ID arrays
   return {
      existing: existingTags,
      adding: addingTags,
      removing: removingTags
   };
}