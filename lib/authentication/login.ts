"use server";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

export type Credentials = {
  username: string;
  password: string;
};

export async function login(credentials: Credentials): Promise<VitalityResponse<null>> {
   try {
      const userCredentials = new FormData();

      userCredentials.append("username", credentials.username.trim());
      userCredentials.append("password", credentials.password);

      await signIn("credentials", userCredentials);
   } catch (error) {
      console.error(error);

      if (error instanceof AuthError) {
         switch (error.type) {
            case "CallbackRouteError":
            case "CredentialsSignin":
               return sendErrorMessage("Invalid credentials", {
                  username: ["Invalid credentials"],
                  password: ["Invalid credentials"]
               });
            default:
               return sendFailureMessage(error);
         }
      }
   }

   return sendSuccessMessage("Successfully logged in", null);
}