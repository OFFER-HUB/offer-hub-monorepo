const stats = [
  { value: "10K+", label: "Active Merchants" },
  { value: "$50M+", label: "Volume Processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50+", label: "Countries" },
];

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-8 rounded-2xl shadow-raised"
              style={{ background: "#F1F3F7" }}
            >
              <span
                className="text-5xl font-black tracking-tight"
                style={{ color: "#149A9B" }}
              >
                {stat.value}
              </span>
              <span
                className="text-sm font-medium mt-3 uppercase tracking-widest"
                style={{ color: "#6D758F" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
