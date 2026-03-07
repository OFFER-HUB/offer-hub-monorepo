import { Star, GitFork, Eye, AlertCircle } from "lucide-react";

interface RepoStatsProps {
     stars?: number;
     forks?: number;
     watchers?: number;
     openIssues?: number;
}

const mockStats = {
     stars: 2547,
     forks: 380,
     watchers: 145,
     openIssues: 23,
};

export default function RepoStats({
     stars = mockStats.stars,
     forks = mockStats.forks,
     watchers = mockStats.watchers,
     openIssues = mockStats.openIssues,
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
                                   {stat.value.toLocaleString()}
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
