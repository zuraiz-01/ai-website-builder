import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, hint, className = "", id, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-200 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          className={[
            "w-full rounded-xl border bg-white/[0.03] text-zinc-100 placeholder-zinc-500",
            "border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
            "transition px-3.5 py-2.5 text-sm",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "",
            className,
          ].join(" ")}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {rightIcon}
          </span>
        )}
      </div>
      {(error || hint) && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-red-400" : "text-zinc-500"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default Input;
