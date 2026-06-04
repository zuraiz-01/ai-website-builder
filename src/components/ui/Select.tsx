import type { SelectHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className = "", id, children, ...rest },
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
      <select
        {...rest}
        id={inputId}
        ref={ref}
        className={[
          "w-full rounded-xl border bg-white/[0.03] text-zinc-100",
          "border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
          "transition px-3.5 py-2.5 text-sm appearance-none",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat pr-10",
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
            : "",
          className,
        ].join(" ")}
      >
        {children}
      </select>
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

export default Select;
