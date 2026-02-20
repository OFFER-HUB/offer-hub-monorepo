"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

const changelogEntries = [
  {
    version: "v0.3.0",
    date: "March 2024",
    title: "New UI Components",
    badge: "Feature",
    badgeColor: "bg-primary text-white",
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
    badgeColor: "bg-warning text-white",
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
    badgeColor: "bg-error text-white",
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-text-primary mb-4"
            >
              Changelog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-secondary text-lg"
            >
              Keep track of our latest updates and improvements.
            </motion.p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-primary transform md:-translate-x-1/2 hidden sm:block opacity-20" />

            <div className="space-y-12">
              {changelogEntries.map((entry, index) => (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center md:justify-between ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 hidden sm:block" />

                  {/* Date (for desktop, alternates side) */}
                  <div
                    className={`hidden md:block w-5/12 ${index % 2 === 0 ? "text-left" : "text-right"}`}
                  >
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {entry.date}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="w-full md:w-5/12">
                    <div className="bg-background rounded-2xl p-6 shadow-raised hover:shadow-raised-hover transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-text-primary">
                            {entry.version}
                          </span>
                          <span
                            className={`${entry.badgeColor} text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider`}
                          >
                            {entry.badge}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary block md:hidden">
                          {entry.date}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-text-primary mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        {entry.description}
                      </p>

                      <ul className="space-y-2">
                        {entry.changes.map((change, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-text-secondary"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
