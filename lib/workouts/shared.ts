import { Workout } from "./workouts";

export function searchForTitle(array: any[], search: string): any[] {
   // Handle no input for array search
   if (search === "") {
      return array;
   }

   // Simple search for items based on starting with specific pattern
   return array.filter(t => t.title.toLowerCase().startsWith(search));
}

export function getWorkoutDate(date: Date): string {
   // Format: YYYY-MM-DD
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate() + 1).padStart(2, "0");
   const year = date.getFullYear();

   return `${year}-${month}-${day}`;
}

export function formatWorkout(workout): Workout {
   // Turn combined tag and exercise data into a uniform Workout type
   return {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      date: workout.date,
      description: workout.description ?? "",
      image: workout.image ?? "",
      tagIds: workout.workout_applied_tags.map(
         (applied_tag: any) => applied_tag.workout_tags.id
      )
   };
}
