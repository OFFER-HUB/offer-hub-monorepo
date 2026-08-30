import { Github, FolderGit2 } from "lucide-react";
import { GITHUB_CORE_URL, GITHUB_UI_URL, GITHUB_REPO_URL } from "@/constants/github";

const repos = [
    {
        name: "OFFER-HUB Core",
        url: GITHUB_CORE_URL,
        description: "The decentralized payment engine",
    },
    {
        name: "OFFER-HUB UI",
        url: GITHUB_UI_URL,
        description: "The primary workspace portal",
    },
    {
        name: "OFFER-HUB Mono",
        url: GITHUB_REPO_URL,
        description: "Modern marketplace orchestrator",
    },
];

export function RepoLinksSection() {
    return (
        <section id="repo-links" className="py-12 bg-transparent w-full min-w-0 max-w-full overflow-hidden">
            <div className="mx-auto max-w-7xl w-full min-w-0 px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-1 rounded-full bg-theme-primary/20 mb-12" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full min-w-0 max-w-full">
                        {repos.map((repo) => (
                            <a
                                key={repo.name}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex min-w-0 w-full items-center gap-5 overflow-hidden p-6 rounded-3xl bg-bg-elevated shadow-neu-raised transition-[box-shadow,transform] duration-300 active:shadow-neu-sunken hover:scale-[1.02]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-bg-sunken shadow-neu-sunken flex items-center justify-center flex-shrink-0 group-hover:shadow-neu-sunken-subtle transition-shadow duration-500">
                                    <Github size={24} className="text-theme-primary" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-content-primary flex min-w-0 max-w-full flex-wrap items-center gap-2">
                                        <span className="truncate break-all">{repo.name}</span>
                                        <FolderGit2 size={12} className="text-content-secondary/40" />
                                    </h3>
                                    <p className="text-[11px] font-medium text-content-secondary mt-1 truncate">
                                        {repo.description}
                                    </p>
                                </div>

                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-theme-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
