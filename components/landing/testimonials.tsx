import clsx from "clsx";
import Image from "next/image";
import testimonials from "@/lib/landing/testimonials";
import Heading from "@/components/global/heading";
import Carousel from "@/components/landing/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";

interface TestimonialProps {
  testimonial: string;
  name: string;
  stars: number[];
  image: string;
}

function Testimonial(props: TestimonialProps): JSX.Element {
   const { testimonial, name, stars, image } = props;

   return (
      <div className = "relative flex flex-col box-border gap-1 justify-center align-center w-full min-h-[27rem] sm:min-h-[20rem] max-h-full mx-auto py-4">
         <FontAwesomeIcon
            icon = { faQuoteLeft }
            className = "text-3xl text-primary"
         />
         <p className = "font-medium text-md w-3/4 px-2 mx-auto mt-3">
            { testimonial }
         </p>
         <div>
            <div className = "flex flex-col sm:flex-row gap-3 justify-center items-center w-full mx-auto px-4 pt-4">
               <Image
                  priority
                  width = { 200 }
                  height = { 200 }
                  quality = { 100 }
                  className = "rounded-full w-[4.5rem] h-[4.5rem] object-cover object-center shadow-inner"
                  src = { image }
                  alt = "Rounded avatar"
               />
               <div>
                  <p className = "font-semibold">{ name }</p>
                  {
                     stars.map((rating, index) => {
                        return (
                           <FontAwesomeIcon
                              key = { index }
                              icon = { faStar }
                              className = {
                                 clsx("text-md sm:text-sm my-2", {
                                    "text-yellow-500": rating,
                                    "text-slate-500": !rating
                                 })
                              }
                           />
                        );
                     })
                  }
               </div>
            </div>
         </div>
      </div>
   );
}

export default function Testimonials(): JSX.Element {
   const elements: JSX.Element[] = testimonials.map((person, index) => {
      return (
         <Testimonial
            { ...person }
            key = { index }
         />
      );
   });

   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Testimonials"
            description = "Explore firsthand stories from our users, sharing their fitness journeys with our app"
         />
         <div className = "w-10/12 sm:w-7/12 mx-auto py-6">
            <Carousel
               items = { elements }
               columns = { 1 }
            />
         </div>
      </div>
   );
}