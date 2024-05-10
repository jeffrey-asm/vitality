"use client";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { FormItems } from "@/lib/form";
import { login } from "@/lib/login";
import { signup, Registration } from "@/lib/signup";
import Heading from "@/components/landing/heading";
import { Input } from "@/components/global/form";
import Button from "@/components/global/button";



function Form (): JSX.Element {
   const [registration, setRegistration] = useImmer<FormItems>(
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
         }, confirmPassword: {
            label: "Confirm Password *",
            type: "password",
            isPassword: true,
            id: "confirmPassword",
            value: "",
            error: null,
         }, name: {
            label: "Name *",
            type: "text",
            id: "name",
            value: "",
            error: null,
         }, birthday: {
            label: "Birthday *",
            type: "date",
            id: "birthday",
            value: "",
            error: null,
         },
         email: {
            label: "Email *",
            type: "email",
            id: "email",
            value: "",
            error: null,
         }, phone: {
            label: "Phone",
            type: "tel",
            id: "phone",
            value: "",
            error: null,
         }
      });

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         const payload : Registration = {
            name: registration.name.value,
            birthday: new Date(registration.birthday.value),
            username: registration.username.value,
            password: registration.password.value,
            confirmPassword: registration.confirmPassword.value,
            email: registration.email.value,
            phone: registration.phone.value,
         };

         if (payload.phone === "") {
            delete payload.phone;
         }

         const response = await signup(payload);

         const errors = {}

         // Show error inputs
         for (const error of Object.keys(response.errors)) {
            errors[error] = true;
            setRegistration((registration) => {
               registration[error].error = response.errors[error][0];
            });
         }

         // Hide fixed error inputs
         for (const input of Object.keys(registration)) {
            if (!(errors[input]) && registration[input].error !== null) {
               setRegistration((registration) => {
                  registration[input].error = null;
               });
            }
         }

         // Login successfully registered users
         // TODO -> Use props for login and show notification to user
         const userCredentials = new FormData();
         userCredentials.append("username", payload.name.trim());
         userCredentials.append("password", payload.password);

         if (response.state === "Success") {
            await login("credentials", userCredentials);
         }

      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-full mx-auto">
         <form className = "w-1/2 mx-auto flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <Input input = {registration.username} setInputs = {setRegistration} />
            <Input input = {registration.password} setInputs = {setRegistration} />
            <Input input = {registration.confirmPassword} setInputs = {setRegistration} />
            <Input input = {registration.name} setInputs = {setRegistration} />
            <Input input = {registration.birthday} setInputs = {setRegistration} />
            <Input input = {registration.email} setInputs = {setRegistration} />
            <Input input = {registration.phone} setInputs = {setRegistration} />
            <Button type = "submit" className = "bg-primary text-white">
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function SignUpForm (): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center">
            <Heading title = "Sign up" description = "Create an account to get started"/>
            <Form />
         </div>
      </>
   );
}