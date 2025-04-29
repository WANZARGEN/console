import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  styleType?:
    | "primary"
    | "substitutive"
    | "secondary"
    | "tertiary"
    | "transparent"
    | "highlight"
    | "positive"
    | "negative-primary"
    | "negative-secondary"
    | "negative-transparent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  active?: boolean;
  iconLeft?: string;
  iconRight?: string;
  href?: string;
  target?: string;
}
