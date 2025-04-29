import { twMerge } from "tailwind-merge";

import type { SpinnerProps } from "./type";

export const PSpinner = ({
  size = "md",
  styleType = "gray",
  className,
}: SpinnerProps) => {
  const sizeStyle = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  }[size];

  const colorStyle = {
    white: "text-white",
    gray: "text-gray-400",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  }[styleType];

  return (
    <div
      data-testid="spinner"
      className={twMerge(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeStyle,
        colorStyle,
        className,
      )}
    />
  );
};
