import Link from "next/link";
import { Code, BookOpen, PenTool, Bug } from "lucide-react";

const steps = [
    { number: "01", title: "Fork", description: "Fork the repository to your own GitHub account." },
    { number: "02", title: "Clone", description: "Clone the forked repository to your local machine." },
    { number: "03", title: "Create branch", description: "Create a new branch for your feature or bug fix." },
    { number: "04", title: "Make changes", description: "Write your code, commit, and push to your fork." },
    { number: "05", title: "Open PR", description: "Submit a Pull Request to the main repository." },
    { number: "06", title: "Get reviewed", description: "Address any feedback from the maintainers." },
    { number: "07", title: "Merged", description: "Your changes are merged into the project!" },
];

const contributionTypes = [
    { title: "Code", description: "Help us build features, fix bugs, and improve performance.", icon: Code },
    { title: "Docs", description: "Improve our documentation, tutorials, and guides.", icon: BookOpen },
    { title: "Design", description: "Contribute to UI/UX, create assets, and refine the design system.", icon: PenTool },
    { title: "Bug reports", description: "Find issues? Let us know so we can fix them together.", icon: Bug },
];

export default function HowToContribute() {
    return (
        <section id="how-to-contribute" className="py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-16">
                    <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4" style={{ color: "#149A9B" }}>
                        How to Contribute
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6" style={{ color: "#19213D" }}>
                        Join the OFFER HUB Community
                    </h2>
                    <p className="text-lg text-secondary max-w-2xl mx-auto" style={{ color: "#6D758F" }}>
                        We welcome all types of contributions! Here is a step-by-step guide to help you build with us.
                    </p>
                </div>

                {/* Steps */}
                <div className="mb-24">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
                        {steps.map((step) => (
                            <div key={step.number} className="flex flex-col items-center text-center gap-6">
                                <div
                                    className="w-24 h-24 rounded-full shadow-raised flex items-center justify-center flex-shrink-0 relative z-10"
                                    style={{ background: "#F1F3F7" }}
                                >
                                    <span className="text-2xl font-black" style={{ color: "#149A9B" }}>
                                        {step.number}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xl font-bold" style={{ color: "#19213D" }}>{step.title}</h3>
                                    <p className="text-sm font-light leading-relaxed max-w-xs mx-auto" style={{ color: "#6D758F" }}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contribution Types */}
                <div className="mb-24">
                    <h3 className="text-2xl font-bold tracking-tight text-center mb-12" style={{ color: "#19213D" }}>
                        Ways to Contribute
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contributionTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <div
                                    key={type.title}
                                    className="rounded-2xl p-6 shadow-raised flex flex-col gap-4"
                                    style={{ background: "#F1F3F7" }}
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sunken" style={{ background: "#F1F3F7" }}>
                                        <Icon className="w-5 h-5" style={{ color: "#149A9B" }} />
                                    </div>
                                    <h4 className="text-lg font-bold" style={{ color: "#19213D" }}>{type.title}</h4>
                                    <p className="text-sm font-light leading-relaxed" style={{ color: "#6D758F" }}>
                                        {type.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="https://github.com/OFFER-HUB/offer-hub-monorepo/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 rounded-xl font-medium shadow-raised hover:shadow-raised-hover transition-all duration-300 flex items-center gap-2"
                        style={{ background: "#149A9B", color: "#FFFFFF" }}
                    >
                        View open issues
                        <Bug className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/docs"
                        className="px-8 py-4 rounded-xl font-medium shadow-raised hover:shadow-raised-hover transition-all duration-300 flex items-center gap-2"
                        style={{ background: "#F1F3F7", color: "#19213D" }}
                    >
                        Read contribution guide
                        <BookOpen className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
