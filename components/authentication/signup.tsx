"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Notification from "@/components/global/notification";
import Button from "@/components/global/button";
import Link from "next/link";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { FormItems, handleFormErrors, SubmissionStatus } from "@/lib/global/form";
import { login } from "@/lib/authentication/login";
import { signup, Registration } from "@/lib/authentication/signup";

function Form(): JSX.Element {
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });
   const [registration, setRegistration] = useImmer<FormItems>(
      {
         username: {
            label: "Username *",
            type: "text",
            id: "username",
            value: "",
            error: null
         }, password: {
            label: "Password *",
            type: "password",
            isPassword: true,
            id: "password",
            value: "",
            error: null
         }, confirmPassword: {
            label: "Confirm Password *",
            type: "password",
            isPassword: true,
            id: "confirmPassword",
            value: "",
            error: null
         }, name: {
            label: "Name *",
            type: "text",
            id: "name",
            value: "",
            error: null
         }, birthday: {
            label: "Birthday *",
            type: "date",
            id: "birthday",
            value: "",
            error: null
         },
         email: {
            label: "Email *",
            type: "email",
            id: "email",
            value: "",
            error: null
         }, phone: {
            label: "Phone",
            type: "tel",
            id: "phone",
            value: "",
            error: null
         }
      });

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Registration = {
            name: registration.name.value,
            birthday: new Date(registration.birthday.value),
            username: registration.username.value,
            password: registration.password.value,
            confirmPassword: registration.confirmPassword.value,
            email: registration.email.value,
            phone: registration.phone.value
         };

         if (payload.phone === "") {
            delete payload.phone;
         }

         // Update current status of form to show potential success notification
         const response = await signup(payload);
         setStatus(response);
         handleFormErrors(response, registration, setRegistration);
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto">
         <form className = "w-full mx-auto flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <Input input = {registration.username} updater = {setRegistration} />
            <Input input = {registration.password} updater = {setRegistration} />
            <Input input = {registration.confirmPassword} updater = {setRegistration} />
            <Input input = {registration.name} updater = {setRegistration} />
            <Input input = {registration.birthday} updater = {setRegistration} />
            <Input input = {registration.email} updater = {setRegistration} />
            <Input input = {registration.phone} updater = {setRegistration} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
         <p className = "mt-4">Already have an account? <Link href = "/login" className = "text-primary font-bold underline">Log In</Link></p>
         {
            (status.state === "Success" || status.state === "Failure") && (
               <Notification status = {status}>
                  {(status.state === "Success") &&
                     <Link href = "/home">
                        <Button
                           type = "button"
                           className = "bg-green-600 text-white p-4 text-sm h-[2rem]"
                           onClick = {async() => {
                              await login({
                                 username: registration.username.value,
                                 password: registration.password.value
                              });
                           }}
                        >
                           Log In
                        </Button>
                     </Link>
                  }
               </Notification>
            )
         }
      </div>
   );
}

export default function SignUpForm(): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center text-center">
            <Heading title = "Sign Up" description = "Create an account to get started" />
            <Form />
         </div>
      </>
   );
}