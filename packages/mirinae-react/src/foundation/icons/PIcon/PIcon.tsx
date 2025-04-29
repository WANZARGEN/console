import { twMerge } from "tailwind-merge";

import type { IconProps } from "./type";

export const PIcon = ({
  name,
  size = 16,
  color = "currentColor",
  className,
}: IconProps) => {
  // TODO: SVG icons should be imported from mirinae-foundation
  return (
    <span
      className={twMerge("inline-flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        color,
      }}
    >
      <i className={name} />
    </span>
  );
};
