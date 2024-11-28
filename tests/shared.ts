import { prismaMock } from "@/tests/singleton";

// Helper function to simulate database error situations
export const simulateDatabaseError = async(
   table: "workouts" | "workout_tags" | "users",
   databaseMethod: "create" | "delete" | "update" | "deleteMany",
   backendMethod: (..._args: any[]) => any) => {
   // @ts-ignore
   prismaMock[table][databaseMethod].mockRejectedValue(
      new Error("Database Error")
   );

   expect(await backendMethod()).toEqual({
      status: "Failure",
      body: {
         data: null,
         message: "Something went wrong. Please try again.",
         errors: {
            system: ["Database Error"]
         }
      }
   });
   expect(prismaMock[table][databaseMethod]).toHaveBeenCalled();
};

export const MOCK_ID = "33b33227-56b1-4f10-844a-660b523e546c";