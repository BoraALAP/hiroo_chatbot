// tailwind.config.js
import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./node_modules/@heroui/theme/dist/components/(alert|avatar|badge|breadcrumbs|button|card|checkbox|chip|divider|drawer|link|listbox|menu|modal|navbar|progress|radio|select|slider|spinner|toggle|table|tabs|toast|user|ripple|form|popover|scroll-shadow|spacer).js"
];
export const theme = {
  extend: {},
};
export const darkMode = "class";
export const plugins = [heroui()];