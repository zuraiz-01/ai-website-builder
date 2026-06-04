import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className = "", id, ...rest },
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
        <textarea
          {...rest}
          id={inputId}
          ref={ref}
          className={[
            "w-full rounded-xl border bg-white/[0.03] text-zinc-100 placeholder-zinc-500",
            "border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
            "transition px-3.5 py-2.5 text-sm resize-y min-h-[120px]",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "",
            className,
          ].join(" ")}
        />
        {(error || hint) && (
          <p
            className={`mt-1.5 text-xs ${error ? "text-red-400" : "text-zinc-500"}`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

export default Textarea;
