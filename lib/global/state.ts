import { produce } from "immer";

export interface VitalityInputState {
  id: string;
  value: any;
  error: string[] | null;
  type: string | null;
  data: { [key: string]: any };
}

export type VitalityInputStates = { [key: string]: VitalityInputState };
export interface VitalityResponse<T> {
  status: "Success" | "Error" | "Failure";
  body: {
    message: string;
    data: T;
    errors: { [key: string]: string[] | undefined };
  };
}

export interface VitalityResetState {
  [key: string]: {
    value: any;
    data: { [key: string]: any };
  };
}

export interface VitalityAction<T> {
  type:
    | "initializeState"
    | "updateInput"
    | "updateStatus"
    | "updateState"
    | "resetState";
  value:
    | VitalityInputStates // User values in table
    | VitalityInputState // Update form, data, etc.
    | VitalityResponse<T> // Backend API responses
    | VitalityState // Complete State Update (complex)
    | VitalityResetState; // Reset state to default values and provided data objects, if any
}

export interface VitalityState {
  status: "Initial" | "Success" | "Error" | "Failure";
  inputs: VitalityInputStates;
  response: VitalityResponse<any> | null;
}

export function formReducer(
   state: VitalityState,
   action: VitalityAction<any>
): VitalityState {
   return produce(state, (draft) => {
      switch (action.type) {
      case "initializeState":
         const inputs = action.value as VitalityInputStates;

         for (const key of Object.keys(inputs)) {
            draft.inputs[key] = inputs[key];
         }

         break;
      case "updateInput":
         const input = action.value as VitalityInputState;
         draft.inputs[input.id] = input;

         break;
      case "updateStatus":
         const response = action.value as VitalityResponse<any>;

         if (response) {
            draft.status = response.status;
            draft.response = response;

            for (const key in state.inputs) {
               draft.inputs[key].error = response?.body.errors[key] ?? null;
            }
         }

         break;
      case "updateState":
         // Manually update properties of draft (complex state)
         Object.assign(draft, action.value as VitalityState);
         break;
      case "resetState":
         const reset = action.value as VitalityResetState;

         for (const key in state.inputs) {
            draft.inputs[key] = {
               ...state.inputs[key],
               value: reset[key]?.value ?? "",
               error: null,
               data: reset[key]?.data ?? state.inputs[key].data
            };
         }

         break;
      default:
         return state;
      }
   });
}

export function sendSuccessMessage<T>(
   message: string,
   data: T
): VitalityResponse<T> {
   return {
      status: "Success",
      body: { message: message, data: data, errors: {} }
   };
}

export function sendErrorMessage<T>(
   status: "Error" | "Failure",
   message: string,
   data: T,
   errors: { [key: string]: string[] }
): VitalityResponse<T> {
   return {
      status: status,
      body: {
         message: message,
         data: data,
         errors: errors ?? {}
      }
   };
}
