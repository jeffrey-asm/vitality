import { ChangeEvent } from "react";
import { Updater } from "use-immer";

export type InputState = {
   label: string;
   type: string;
   isPassword?: boolean;
   id: string;
   value: any;
   error: any | null;
   onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
   setInput?: Updater<FormRepresentation>;
};

export type FormRepresentation = { [key: string]: InputState };

export const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setInputs: Updater<FormRepresentation> ) => {
   const { id, value } = event.target;

   setInputs((input: { [key: string]: InputState; }) => {
      input[id].value = value;
      input[id].error = null;
   });
};

export type SubmissionStatus = {
   state: "Initial" | "Error" | "Success" | "Failure";
   response: { message?: string, data?: any };
   errors: { [key: string]: string[]; };
};

export function sendSuccessMessage (message: string, data?: any): SubmissionStatus {
   return {
      state: "Success",
      response: { message: message, data: data },
      errors: {}
   };
}

export function sendErrorMessage (status: "Error" | "Failure", errors?: { [key: string]: string[] }): SubmissionStatus {
   return {
      state: status,
      response: { message: "Unknown error has occurred when processing your request. Please try again." },
      errors: errors ? errors : { "system" : ["Unknown error has occurred when processing your request. Please try again."] }
   };
}