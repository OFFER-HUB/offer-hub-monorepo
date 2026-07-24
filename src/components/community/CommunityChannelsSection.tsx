"use client";

import { ArrowUpRight, Disc3, Github, Send, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/community/SectionHeading";
import { SOCIAL_DISCORD, SOCIAL_TELEGRAM, SOCIAL_X } from "@/constants/social";
import { GITHUB_ORG_URL } from "@/constants/github";

const channels = [
  {
    name: "Discord",
    description: "Real-time discussions, pairing, and contributor office hours.",
    href: SOCIAL_DISCORD,
    icon: Disc3,
  },
  {
    name: "Telegram",
    description: "Fast async updates for announcements and roadmap drops.",
    href: SOCIAL_TELEGRAM,
    icon: Send,
  },
  {
    name: "X",
    description: "Community highlights, release threads, and ecosystem news.",
    href: SOCIAL_X,
    icon: Twitter,
  },
  {
    name: "GitHub",
    description: "Open source repositories, pull requests, and roadmap items.",
    href: GITHUB_ORG_URL,
    icon: Github,
  },
];

export const CommunityChannelsSection = () => {
  return (
    <section id="community-channels" className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community Channels"
          title="Join conversations across every channel"
          subtitle="Find us where the conversation is happening."
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-3xl bg-bg-base p-8 shadow-neu-raised transition-all duration-300 hover:-translate-y-1 hover:shadow-neu-raised-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={20} className="text-theme-primary" />
                </div>
                <h3 className="text-xl font-black text-content-primary tracking-tight">
                  {channel.name}
                </h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-content-secondary">
                  {channel.description}
                </p>
                <span className="mt-8 pt-6 border-t border-theme-border/10 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-theme-primary group-hover:gap-3 transition-all">
                  Join channel <ArrowUpRight size={14} />
                </span>
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

