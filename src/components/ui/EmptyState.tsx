import type { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl p-10 text-center flex flex-col items-center">
      {icon && (
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-4 text-violet-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-zinc-400 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button
            variant="primary"
            size="md"
            onClick={action.onClick}
            {...(action.href ? {} : {})}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
