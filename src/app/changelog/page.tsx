"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const changelogEntries = [
  {
    version: "v0.3.0",
    date: "March 2024",
    title: "New UI Components",
    badge: "Feature",
    badgeColor: "bg-[#149A9B] text-white",
    description:
      "Introduced a new set of neumorphic UI components, improved accessibility, and updated the brand palette for better consistency.",
    changes: [
      "Added Neumorphic Card component",
      "Enhanced mobile navigation",
      "New icon set integration",
    ],
  },
  {
    version: "v0.2.0",
    date: "February 2024",
    title: "Performance Updates",
    badge: "Fix",
    badgeColor: "bg-[#19213D] text-white",
    description:
      "Optimized bundle size and improved page load times by implementing better code splitting and image optimization strategies.",
    changes: [
      "Reduced main bundle size by 15%",
      "Improved LCP scores",
      "Fixed memory leaks in dashboard charts",
    ],
  },
  {
    version: "v0.1.0",
    date: "January 2024",
    title: "Initial Launch",
    badge: "Breaking",
    badgeColor: "bg-red-500 text-white",
    description:
      "The first official release of Offer Hub, featuring secure escrow payments and marketplace integration tools.",
    changes: [
      "Core escrow protocol implementation",
      "Marketplace API v1 release",
      "Initial landing page and docs",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F7]">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-24 animate-fadeInUp">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#149A9B] mb-4">Evolution</p>
            <h1 className="text-4xl md:text-6xl font-black text-[#19213D] tracking-tighter leading-none mb-6">
              Platform <span className="text-[#149A9B]">Updates</span>
            </h1>
            <p className="text-lg text-[#6D758F] font-medium max-w-2xl mx-auto leading-relaxed">
              Tracking the progress of the Offer Hub ecosystem as we build the foundations of trustless commerce.
            </p>
          </header>

          {/* Timeline Wrapper */}
          <div className="relative">
            {/* Improved Timeline Line */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 transform md:-translate-x-1/2 bg-[#149A9B]/10 rounded-full" />

            <div className="space-y-16 md:space-y-24">
              {changelogEntries.map((entry, index) => (
                <div
                  key={entry.version}
                  className={`relative flex flex-col md:flex-row items-start md:items-center md:justify-between ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                >
                  {/* Neumorphic Dot on timeline */}
                  <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#F1F3F7] shadow-raised-sm z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#149A9B]" />
                  </div>

                  {/* Date (for desktop, alternates side) */}
                  <div
                    className={`hidden md:block w-5/12 ${index % 2 === 0 ? "text-left" : "text-right"}`}
                  >
                    <span className="text-sm font-black text-[#19213D] uppercase tracking-widest opacity-40">
                      {entry.date}
                    </span>
                  </div>

                  {/* Enhanced Card content */}
                  <div className="w-full md:w-5/12 pl-12 md:pl-0">
                    <div className="bg-[#F1F3F7] rounded-[2.5rem] p-8 md:p-10 shadow-raised hover:shadow-raised-hover transition-all duration-500 ease-out group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-[#19213D] tracking-tight group-hover:text-[#149A9B] transition-colors">
                            {entry.version}
                          </span>
                          <span
                            className={`${entry.badgeColor} text-[9px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-raised-sm`}
                          >
                            {entry.badge}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#6D758F] block md:hidden uppercase tracking-widest opacity-60">
                          {entry.date}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#19213D] mb-4">
                        {entry.title}
                      </h3>
                      <p className="text-[#6D758F] text-sm font-medium leading-relaxed mb-6">
                        {entry.description}
                      </p>

                      <ul className="space-y-3">
                        {entry.changes.map((change, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm font-medium text-[#19213D]/80"
                          >
                            <span className="mt-2 h-1 w-1 rounded-full bg-[#149A9B] shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
