"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, MouseEventHandler, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonCommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonLinkProps = ButtonCommonProps &
  { href: string } &
  Omit<ComponentProps<typeof Link>, keyof ButtonCommonProps | "href">;

type ButtonNativeProps = ButtonCommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps> &
  { href?: never };

export type ButtonProps = ButtonLinkProps | ButtonNativeProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  secondary: "bg-bg-base text-content-primary",
  ghost: "bg-transparent text-content-primary hover:bg-bg-sunken",
  danger: "bg-theme-error text-bg-elevated hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-5",
};

const baseClasses =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-neu-raised-sm transition-[background-color,box-shadow,color,filter] duration-200 ease-out motion-reduce:transition-none hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50";

function buttonContents(
  children: ReactNode,
  leadingIcon: ReactNode,
  trailingIcon: ReactNode,
  loading: boolean,
) {
  return (
    <>
      {loading ? (
        <LoaderCircle size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </>
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const {
      href,
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      loading = false,
      disabled = false,
      className,
      children,
      onClick,
      tabIndex,
      ...linkProps
    } = props;
    const isDisabled = disabled || loading;
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      isDisabled && "cursor-not-allowed opacity-50",
      className,
    );
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    return (
      <Link
        {...linkProps}
        href={href}
        className={classes}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabled ? -1 : tabIndex}
        onClick={handleClick}
      >
        {buttonContents(children, leadingIcon, trailingIcon, loading)}
      </Link>
    );
  }

  const {
    type,
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled = false,
    className,
    children,
    ...buttonProps
  } = props;
  const isDisabled = disabled || loading;
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  return (
    <button
      {...buttonProps}
      type={type ?? "button"}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {buttonContents(children, leadingIcon, trailingIcon, loading)}
    </button>
  );
}
