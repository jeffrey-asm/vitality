"use client";
import Link from "next/link";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faKey, faUnlockKeyhole, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import { VitalityState, formReducer, VitalityResponse, handleResponse } from "@/lib/global/state";
import { login, Credentials } from "@/lib/authentication/login";
import { AuthenticationContext, NotificationContext } from "@/app/layout";

const credentials: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   }, password: {
      value: "",
      error: null,
      data: {}
   }
};

export default function LoginForm(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, credentials);

   if (user !== undefined) {
      // Ensure after a successful logout, the URL is updated accordingly
      window.location.reload();
   }

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const credentials: Credentials = {
            username: state.username.value.trim(),
            password: state.password.value.trim()
         };

         const response: VitalityResponse<null> = await login(credentials);

         const successMethod = () => {
            window.location.reload();
         };

         handleResponse(dispatch, response, successMethod, updateNotification);
      } catch (error) {
         console.error(error);
      }
   };

   return (
      <div className = "w-full mx-auto mt-8 flex flex-col items-center justify-center text-center">
         <Heading
            title = "Log In"
            description = "Enter valid credentials to enter" />
         <div className = "w-10/12 lg:w-1/2 mx-auto mt-4">
            <form
               className = "relative w-full flex flex-col justify-center align-center gap-3"
               onSubmit = {handleSubmit}>
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => dispatch({
                     type: "resetState", value: {}
                  })}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Input
                  id = "username"
                  type = "text"
                  label = "Username"
                  autoComplete = "username"
                  icon = {faUserSecret}
                  input = {state.username}
                  dispatch = {dispatch}
                  autoFocus
                  required />
               <Input
                  id = "password"
                  type = "password"
                  label = "Password"
                  autoComplete = "current-password"
                  icon = {faKey}
                  input = {state.password}
                  dispatch = {dispatch}
                  required />
               <Button
                  type = "submit"
                  className = "bg-primary text-white h-[2.6rem]"
                  icon = {faUnlockKeyhole}>
                  Log In
               </Button>
            </form>
            <p className = "mt-4">Don&apos;t have an account? <Link
               href = "/signup"
               className = "text-primary font-bold">Register</Link></p>
         </div>
      </div>
   );
}