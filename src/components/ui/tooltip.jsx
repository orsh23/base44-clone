import * as React from "react"
    import { useState } from "react"; // Added useState import
    import * as TooltipPrimitive from "@radix-ui/react-tooltip"
    import { cn } from "../utils/cn" // Updated path
    
    // Assuming ShadcnTooltip components are correctly imported or defined elsewhere.
    // For this example, I'll use the primitive directly if ShadcnTooltip is not available in this scope.
    // If you have a specific ShadcnTooltip structure, ensure those imports are correct.
    const ShadcnTooltip = TooltipPrimitive.Root;
    const TooltipContent = TooltipPrimitive.Content;
    const TooltipProvider = TooltipPrimitive.Provider;
    const TooltipTrigger = TooltipPrimitive.Trigger;
    
    export default function Tooltip({ 
      children, 
      content, 
      side = "top", 
      align = "center",
      language = "en"
    }) {
      const [isOpen, setIsOpen] = React.useState(false); // Changed to React.useState for consistency
      
      const isRTL = Boolean(language === "he");
      
      const getTooltipSide = () => {
        if (isRTL) {
          if (side === "left") return "right";
          if (side === "right") return "left";
        }
        return side;
      };
    
      return (
        <TooltipProvider>
          <ShadcnTooltip open={isOpen} onOpenChange={setIsOpen}>
            <TooltipTrigger asChild
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }} // Allow click to toggle
            >
              {children}
            </TooltipTrigger>
            <TooltipContent 
              side={getTooltipSide()} 
              align={align} 
              className={cn(
                "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                isRTL ? 'rtl text-right' : 'ltr text-left'
              )}
              sideOffset={5}
            >
              {content}
            </TooltipContent>
          </ShadcnTooltip>
        </TooltipProvider>
      );
    }