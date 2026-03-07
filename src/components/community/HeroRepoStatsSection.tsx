import { Star, GitFork, Users, AlertCircle } from "lucide-react";

interface RepoStats {
  stars: string;
  forks: string;
  contributors: string;
  openIssues: string;
}

interface HeroRepoStatsSectionProps {
  stats: RepoStats;
}

const HeroRepoStatsSection = ({ stats }: HeroRepoStatsSectionProps) => {
  const repoStats = [
    { label: "Stars", value: stats.stars, icon: Star, color: "text-[#149A9B]" },
    { label: "Forks", value: stats.forks, icon: GitFork, color: "text-[#19213D]" },
    { label: "Contributors", value: stats.contributors, icon: Users, color: "text-[#149A9B]" },
    { label: "Open Issues", value: stats.openIssues, icon: AlertCircle, color: "text-[#19213D]" },
  ];

  return (
    <section id="hero-repo-stats" className="py-20 overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <p className="mb-6 text-[11px] font-black uppercase tracking-[0.4em] text-[#149A9B]">
              Community Network
            </p>
            <h1 className="text-5xl font-black tracking-tighter text-[#19213D] md:text-7xl leading-[1.05]">
              Building the Future <br />of <span className="text-[#149A9B]">Payments</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-[#6D758F]">
              A global decentralized community of {stats.contributors} contributors
              shipping modular infrastructure every day.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://github.com/OFFER-HUB/offer-hub-monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-[#19213D] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[#19213D]/20 hover:bg-black transition-all"
              >
                Star on GitHub
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-6">
              {repoStats.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-3xl bg-[#F1F3F7] p-6 shadow-raised transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#F1F3F7] shadow-sunken-subtle">
                      <stat.icon size={18} className={`${stat.color} transition-transform group-hover:scale-110`} />
                    </div>
                    <div className="h-1 w-4 rounded-full bg-black/5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6D758F]/60">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#19213D] tracking-tight">
                    {stats[stat.label.toLowerCase().replace(" ", "") as keyof typeof stats] || stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroRepoStatsSection;
