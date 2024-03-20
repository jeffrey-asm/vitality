import { useState } from "react";
import clsx from 'clsx';

export function Carousel({ items, slideWidth, slideHeight }: { items: JSX.Element[], slideWidth: number, slideHeight: number }): JSX.Element {
   const [currentIndex, setCurrentIndex] = useState(0);

   const nextSlide = () => {
      setCurrentIndex((currentIndex + (100 / slideWidth)) % items.length);
   };

   const prevSlide = () => {
      setCurrentIndex((currentIndex - (100 / slideWidth) + items.length) % items.length);
   };

   return (
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: slideHeight }}>
         <div
            className="carousel-inner flex transition-transform duration-500"
            style={{
               transform: `translateX(-${currentIndex * slideWidth}%)`
            }}
         >
            {items.map((slide, index) => (
               <div
                  key={index}
                  className={clsx("carousel-item flex-shrink-0", {
                     'w-full': index === currentIndex || index === currentIndex - 1 || index === currentIndex + 1,
                     'opacity-50': index !== currentIndex && index !== currentIndex - 1 && index !== currentIndex + 1,
                  })}
                  style={{ width: `${slideWidth}%` }}
               >
                  {slide}
               </div>
            ))}
         </div>


         <div className="carousel-buttons">
            <button type="button" className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" onClick={prevSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                  </svg>
                  <span className="sr-only">Previous</span>
               </span>
            </button>
            <button type="button" className="absolute top-1/2 -translate-y-1/2 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next onClick={nextSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                  </svg>
                  <span className="sr-only">Next</span>
               </span>
            </button>
         </div>
      </div>
   );
}
