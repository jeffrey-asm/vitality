import clsx from "clsx";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconProp;
  iconClassName?: string
}

export default function Button(props: ButtonProps): JSX.Element {
   const { children, className, icon, iconClassName } = props;

   return (
      <button
         { ...props }
         tabIndex = { 0 }
         disabled = { false }
         className = {
            clsx(
               "flex items-center justify-center gap-2 rounded-lg text-base font-bold outline-none hover:cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
               className
            )
         }
      >
         {
            icon && (
               <FontAwesomeIcon
                  className = { iconClassName }
                  icon = { icon }

               />
            )
         }
         { children }
      </button>
   );
}