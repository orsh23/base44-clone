import React from "react";

// Simplified button component
export function Button({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  ...props 
}) {
  // Define base styles
  let buttonClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  
  // Apply variant styles
  switch(variant) {
    case "destructive":
      buttonClass += " bg-destructive text-destructive-foreground hover:bg-destructive/90";
      break;
    case "outline":
      buttonClass += " border border-input bg-transparent hover:bg-accent hover:text-accent-foreground";
      break;
    case "secondary":
      buttonClass += " bg-secondary text-secondary-foreground hover:bg-secondary/80";
      break;
    case "ghost":
      buttonClass += " hover:bg-accent hover:text-accent-foreground";
      break;
    case "link":
      buttonClass += " text-primary underline-offset-4 hover:underline";
      break;
    default: // "default"
      buttonClass += " bg-primary text-primary-foreground hover:bg-primary/90";
  }
  
  // Apply size styles
  switch(size) {
    case "sm":
      buttonClass += " h-9 px-3 rounded-md text-sm";
      break;
    case "lg":
      buttonClass += " h-11 px-8 rounded-md";
      break;
    case "icon":
      buttonClass += " h-10 w-10";
      break;
    default: // "default"
      buttonClass += " h-10 px-4 py-2 text-sm";
  }

  // Add custom className if provided
  if (className) {
    buttonClass += " " + className;
  }

  return (
    <button
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
}