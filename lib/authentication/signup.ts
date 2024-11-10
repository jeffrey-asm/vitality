"use server";
import validator from "validator";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";

export type Registration = {
  name: string;
  birthday: Date;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone?: string;
};

const registrationSchema = z.object({
   name: z
      .string()
      .trim()
      .min(2, { message: "A name must be at least 2 characters" }),
   birthday: z
      .date({
         required_error: "Birthday for account is required",
         invalid_type_error: "A valid birthday is required"
      })
      .min(new Date(new Date().getFullYear() - 200, 0, 1), {
         message: "A birthday must not be before 200 years ago"
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A birthday must not be after today"
      }),
   username: z
      .string()
      .trim()
      .min(3, { message: "A username must be at least 3 characters" })
      .max(30, { message: "A username must be at most 30 characters" }),
   password: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message:
        "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)"
      }),
   email: z.string().trim().email({ message: "A valid email is required" }),
   phone: z
      .string()
      .trim()
      .refine(validator.isMobilePhone, {
         message: "A valid phone is required if provided"
      })
      .optional()
});

export async function signup(
   registration: Registration,
): Promise<VitalityResponse<null>> {
   if (registration?.phone?.trim().length === 0) {
      delete registration.phone;
   }

   const fields = registrationSchema.safeParse(registration);

   if (!fields.success) {
      return sendErrorMessage(
         "Error",
         "Invalid user registration fields",
         null,
         fields.error.flatten().fieldErrors,
      );
   } else if (!(registration.password === registration.confirmPassword)) {
      return sendErrorMessage("Error", "Invalid user registration fields", null, {
         password: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"]
      });
   }

   try {
      const userRegistration = fields.data;

      const salt = await bcrypt.genSaltSync(10);
      userRegistration.password = await bcrypt.hash(registration.password, salt);

      if (registration.phone) {
         userRegistration["phone"] = registration.phone;
      }

      await prisma.users.create({
         data: {
            username: userRegistration.username,
            name: userRegistration.name,
            email: userRegistration.email,
            password: userRegistration.password,
            birthday: userRegistration.birthday,
            phone: userRegistration.phone
         }
      });

      return sendSuccessMessage("Successfully registered", null);
   } catch (error) {
      console.error(error);

      if (error.code === "P2002" && error.meta?.target?.includes("username")) {
         return sendErrorMessage("Error", "Internal database conflicts", null, {
            username: ["Username already taken"]
         });
      } else if (
         error.code === "P2002" &&
      error.meta?.target?.includes("email")
      ) {
         return sendErrorMessage("Error", "Internal database conflicts", null, {
            email: ["Email already taken"]
         });
      } else if (
         error.code === "P2002" &&
      error.meta?.target?.includes("phone")
      ) {
         return sendErrorMessage("Error", "Internal database conflicts", null, {
            phone: ["Phone number already taken"]
         });
      } else {
         return sendErrorMessage("Failure", error.meta?.message, null, {
            system: error.meta?.message
         });
      }
   }
}
