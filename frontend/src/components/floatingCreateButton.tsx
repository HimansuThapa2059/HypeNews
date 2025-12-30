import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const SubmitFab = () => {
  return (
    <Link
      to="/submit"
      aria-label="Submit"
      className="
        group fixed bottom-6 right-6 z-40 
        flex h-12 items-center 
        rounded-full border border-primary/20 bg-primary 
        p-0 px-3.5 text-primary-foreground shadow-lg 
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] 
        hover:gap-2 hover:px-5 hover:brightness-110
      "
    >
      <Plus className="size-5 shrink-0" />
      <span
        className="
          grid grid-cols-[0fr] overflow-hidden 
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] 
          group-hover:grid-cols-[1fr]
        "
      >
        <span
          className="
            invisible overflow-hidden whitespace-nowrap 
            text-sm font-bold opacity-0 
            transition-all duration-500 
            group-hover:visible group-hover:opacity-100
          "
        >
          Submit
        </span>
      </span>
    </Link>
  );
};
