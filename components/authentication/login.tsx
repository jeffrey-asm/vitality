"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { FormItems, SubmissionStatus } from "@/lib/form";
import { login, Credentials } from '@/lib/login';

function Form(): JSX.Element {
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });
   const [credentials, setCredentials] = useImmer<FormItems>(
      {
         username: {
            label: "Username *",
            type: "text",
            id: "username",
            value: "",
            error: null,
         }, password: {
            label: "Password *",
            type: "password",
            isPassword: true,
            id: "password",
            value: "",
            error: null,
         }
      });

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Credentials = {
            username: credentials.username.value,
            password: credentials.password.value
         };


         const response = await login(payload);
         const errors = {};

         // Show error inputs
         for (const error of Object.keys(response.errors)) {
            errors[error] = true;

            setCredentials((credentials) => {
               credentials[error].error = response.errors[error][0];
            });
         }

         // Hide fixed error inputs
         for (const input of Object.keys(credentials)) {
            if (!(errors[input]) && credentials[input].error !== null) {
               setCredentials((credentials) => {
                  credentials[input].error = null;
               });
            }
         }

         // Update current status of form to show potential success notification
         setStatus(response);
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className="w-full mx-auto">
         <form className="w-1/2 mx-auto flex flex-col justify-center align-center gap-3" onSubmit={handleSubmit}>
            <Input input={credentials.username} updater={setCredentials} />
            <Input input={credentials.password} updater={setCredentials} />
            <Button type="submit" className="bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function LoginForm (): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center">
            <Heading title = "Log in" description = "Enter valid credentials to enter" />
            <Form />
         </div>
      </>
   );
}