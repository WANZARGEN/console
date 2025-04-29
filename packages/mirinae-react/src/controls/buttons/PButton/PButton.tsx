import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import { PIcon } from "../../../foundation/icons/PIcon";
import { PSpinner } from "../../../feedbacks/loading/PSpinner";
import type { ButtonProps } from "./type";

const SPINNER_SIZE = {
  sm: "xs",
  md: "sm",
  lg: "sm",
} as const;

export const PButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      styleType = "primary",
      size = "md",
      loading = false,
      block = false,
      disabled = false,
      readonly = false,
      active = false,
      iconLeft,
      iconRight,
      onClick,
      className,
      children,
      href,
      target,
    },
    ref,
  ) => {
    const baseStyle =
      "font-bold inline-flex justify-center items-center cursor-pointer text-center border border-transparent rounded transition-colors transition-shadow";
    const sizeStyle = {
      sm: "min-w-[3.25rem] h-6 px-2 text-xs leading-[0.875rem]",
      md: "min-w-[6rem] h-8 px-3.5 text-sm leading-8",
      lg: "min-w-[7.5rem] h-10 px-4 text-base leading-[1.125rem]",
    }[size];

    const styleVariants = {
      primary:
        "bg-primary-dark text-white hover:bg-violet-900 active:bg-violet-900",
      substitutive:
        "bg-primary1 text-white hover:bg-violet-500 active:bg-primary",
      secondary:
        "bg-white text-primary border-primary1 hover:bg-primary3 active:bg-primary2",
      tertiary:
        "bg-white text-gray-900 border-gray-300 hover:bg-gray-100 active:bg-gray-300",
      transparent:
        "bg-transparent text-gray-900 hover:bg-blue-200 hover:text-blue-600 active:bg-blue-300",
      highlight: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      positive:
        "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
      "negative-primary":
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
      "negative-secondary":
        "bg-white text-gray-900 border-gray-300 hover:bg-red-100 hover:text-red-500 hover:border-red-200 active:bg-red-200",
      "negative-transparent":
        "bg-transparent text-gray-900 hover:bg-red-400 hover:border-red-400 hover:text-white active:text-white",
    }[styleType];

    const disabledStyle =
      "bg-gray-200 text-gray-400 border-transparent cursor-not-allowed hover:bg-gray-200 active:bg-gray-200 focus:bg-gray-200";
    const blockStyle = "w-full min-w-full flex";
    const activeStyle = active ? "bg-opacity-80" : "";
    const focusStyle = "focus:outline focus:outline-blue-500";

    const buttonStyle = twMerge(
      baseStyle,
      sizeStyle,
      styleVariants,
      block && blockStyle,
      active && activeStyle,
      (disabled || loading || readonly) && disabledStyle,
      focusStyle,
      className,
    );

    const spinnerStyleType = [
      "primary",
      "substitutive",
      "highlight",
      "positive",
      "negative-primary",
    ].includes(styleType)
      ? "white"
      : "gray";
    const iconSize = {
      sm: 16,
      md: 20,
      lg: 24,
    }[size];

    const buttonContent = (
      <>
        {loading && (
          <PSpinner
            size={SPINNER_SIZE[size]}
            styleType={spinnerStyleType}
            className="mr-1"
          />
        )}
        {iconLeft && !loading && (
          <PIcon
            name={iconLeft}
            size={iconSize}
            className="mr-1 flex-shrink-0"
          />
        )}
        {children}
        {iconRight && !loading && (
          <PIcon
            name={iconRight}
            size={iconSize}
            className="ml-1 flex-shrink-0"
          />
        )}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          target={target}
          className={buttonStyle}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
          }
          ref={ref as React.RefObject<HTMLAnchorElement>}
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={buttonStyle}
        disabled={disabled || loading || readonly}
        onClick={
          onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
        }
        type="button"
      >
        {buttonContent}
      </button>
    );
  },
);

PButton.displayName = "PButton";
