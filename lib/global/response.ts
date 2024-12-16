import { Dispatch } from "react";
import { VitalityAction } from "@/lib/global/state";
import { NotificationProps } from "@/components/global/notification";

export interface VitalityResponse<T> {
   status: "Success" | "Error" | "Failure";
   body: {
     message: string;
     data: T;
     errors: Record<string, string[] | undefined>;
   };
 }

export function sendSuccessMessage<T>(
   message: string,
   data: T
): VitalityResponse<T> {
   return {
      status: "Success",
      body: {
         data: data,
         message: message,
         errors: {}
      }
   };
}

export function sendErrorMessage<T>(
   message: string,
   errors: Record<string, string[] | undefined>
): VitalityResponse<T> {
   return {
      status: "Error",
      body: {
         data: null,
         message: message,
         errors: errors ?? {}
      }
   };
}

export function sendFailureMessage<T>(
   error: Error
): VitalityResponse<T> {
   // Error logs strictly within a development environment
   process.env.NODE_ENV === "development" && console.error(error);

   return {
      status: "Failure",
      body: {
         data: null,
         message: "Something went wrong. Please try again.",
         errors: {
            system: [error?.message]
         }
      }
   };
}

export function handleResponse(
   response: VitalityResponse<any>,
   dispatch: Dispatch<VitalityAction<any>>,
   updateNotification: (_notification: NotificationProps) => void,
   successMethod: () => void
): void {
   if (response.status === "Success") {
      // Remove existing notification, if any
      updateNotification({
         status: "Initial",
         message: ""
      });

      // Call the success method
      successMethod.call(null);
   } else if (response.status === "Error"
         && Object.keys(response.body.errors).length > 0) {
      // Update state to display all errors found within the response
      dispatch({
         type: "updateErrors",
         value: response
      });

      // Scroll into the first error element within the DOM
      document.getElementsByClassName("input-error")?.item(0)
         ?.scrollIntoView({ behavior: "smooth", block: "center" });
   } else {
      // Display failure notification to the user
      updateNotification({
         status: response.status,
         message: response.body.message,
         timer: undefined
      });
   }
}