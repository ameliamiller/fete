"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full py-4 font-bold text-base tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-900 active:bg-gray-800",
    outline:
      "border-2 border-black text-black hover:bg-black hover:text-white active:bg-gray-900",
    ghost: "text-black underline-offset-4 hover:underline",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "⏳ Loading…" : children}
    </button>
  );
}
