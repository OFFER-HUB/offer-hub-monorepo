import { Github, FolderGit2 } from "lucide-react";

const repos = [
    {
        name: "OFFER-HUB Core",
        url: "https://github.com/OFFER-HUB/OFFER-HUB",
        description: "The decentralized payment engine",
    },
    {
        name: "OFFER-HUB UI",
        url: "https://github.com/OFFER-HUB/OFFER-HUB-Frontend",
        description: "The primary workspace portal",
    },
    {
        name: "OFFER-HUB Mono",
        url: "https://github.com/OFFER-HUB/offer-hub-monorepo",
        description: "Modern marketplace orchestrator",
    },
];

export default function RepoLinksSection() {
    return (
        <section id="repo-links" className="py-12 bg-transparent">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-1 rounded-full bg-[#149A9B]/20 mb-12" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        {repos.map((repo) => (
                            <a
                                key={repo.name}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex items-center gap-5 p-6 rounded-3xl bg-[#F1F3F7] shadow-raised transition-all duration-300 active:shadow-sunken hover:scale-[1.02]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#F1F3F7] shadow-raised-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-sunken transition-all duration-500">
                                    <Github size={24} className="text-[#149A9B]" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#19213D] flex items-center gap-2">
                                        {repo.name}
                                        <FolderGit2 size={12} className="text-[#6D758F]/40" />
                                    </h3>
                                    <p className="text-[11px] font-medium text-[#6D758F] mt-1 truncate">
                                        {repo.description}
                                    </p>
                                </div>

                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#149A9B] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
