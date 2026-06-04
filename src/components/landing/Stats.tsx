const stats = [
  { value: "10x", label: "Faster Website Creation" },
  { value: "100%", label: "Responsive Output" },
  { value: "Clean", label: "Exportable Code" },
];

export default function Stats() {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute inset-0 bg-aurora opacity-50" />
          <div className="relative grid sm:grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl sm:text-5xl font-bold text-gradient">
                  {s.value}
                </div>
                <div className="mt-2 text-sm sm:text-base text-zinc-300">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
