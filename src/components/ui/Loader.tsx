interface LoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export default function Loader({
  size = "md",
  label,
  fullScreen = false,
}: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <span
        className={`${sizes[size]} rounded-full border-white/15 border-t-violet-400 animate-spin`}
      />
      {label && <p className="text-sm text-zinc-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    );
  }
  return spinner;
}
