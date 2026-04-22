import { Star, GitFork, Eye, AlertCircle } from "lucide-react";

interface RepoStatsProps {
     stars?: number;
     forks?: number;
     watchers?: number;
     openIssues?: number;
}

export default function RepoStats({
     stars,
     forks,
     watchers,
     openIssues,
}: RepoStatsProps) {
     const stats = [
          {
               icon: Star,
               value: stars,
               label: "Stars",
          },
          {
               icon: GitFork,
               value: forks,
               label: "Forks",
          },
          {
               icon: Eye,
               value: watchers,
               label: "Watchers",
          },
          {
               icon: AlertCircle,
               value: openIssues,
               label: "Open Issues",
          },
     ];

     const hasData = stats.some((s) => s.value != null);

     if (!hasData) {
          return (
               <div className="flex flex-col items-center justify-center p-12 rounded-2xl shadow-raised" style={{ background: "#F1F3F7" }}>
                    <AlertCircle size={24} style={{ color: "#6D758F" }} />
                    <p className="mt-3 text-sm font-semibold" style={{ color: "#6D758F" }}>
                         Stats temporarily unavailable
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                         Check back soon — we&apos;re fetching live data from GitHub.
                    </p>
               </div>
          );
     }

     return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                         <div
                              key={stat.label}
                              className="flex flex-col items-center text-center p-6 rounded-2xl shadow-raised"
                              style={{ background: "#F1F3F7" }}
                         >
                              <Icon size={20} style={{ color: "#149A9B" }} />
                              <span
                                   className="text-3xl font-black tracking-tight mt-3"
                                   style={{ color: "#149A9B" }}
                              >
                                   {(stat.value ?? 0).toLocaleString()}
                              </span>
                              <span
                                   className="text-sm uppercase tracking-widest mt-2"
                                   style={{ color: "#6D758F" }}
                              >
                                   {stat.label}
                              </span>
                         </div>
                    );
               })}
          </div>
     );
}
