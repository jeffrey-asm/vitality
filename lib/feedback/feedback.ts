"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export interface Feedback {
   name: string;
   email: string;
   message: string;
}

const feedbackSchema = z.object({
   name: z.string().trim().min(1, { message: "A valid name is required." }),
   email: z.string().trim().email({ message: "A valid email is required." }),
   message: z.string().trim().min(1, { message: "Message is required." })
});

export async function sendFeedback(feedback: Feedback): Promise<SubmissionStatus>  {
   // Validate the feedback form first
   const fields = feedbackSchema.safeParse(feedback);

   if (!(fields.success)) {
      return sendErrorMessage("Error", "Message.", fields.error.flatten().fieldErrors);
   }

   try {
      const userFeedback = fields.data;

      // Add new feedback into the database for further improvement of the application
      await prisma.feedback.create({
         data: userFeedback
      });

      return sendSuccessMessage("Successfully received your feedback!");
   } catch (err) {
      console.error(err);
   }

   return sendErrorMessage("Failure", "Message.");
}
