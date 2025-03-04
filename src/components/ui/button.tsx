// MyButton.tsx
import {extendVariants, Button} from "@heroui/react";

export const MyButton = extendVariants(Button, {
  variants: {
    // <- modify/add variants
    color: {
      primaryCustom: "text-white bg-primary-400",
      secondaryCustom: "text-white bg-secondary-400",
    },
    isDisabled: {
      true: "bg-[#eaeaea] text-[#000] opacity-50 cursor-not-allowed",
    }
  },
  defaultVariants: { // <- modify/add default variants
    color: "secondaryCustom",
    size: "md",
  },
  compoundVariants: [ // <- modify/add compound variants
    {
      isDisabled: true,
      
      
    },
  ],
});