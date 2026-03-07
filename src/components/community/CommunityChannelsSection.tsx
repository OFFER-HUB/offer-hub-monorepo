"use client";

import { ArrowUpRight, Disc3, Github, Send, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/community/SectionHeading";

const channels = [
  {
    name: "Discord",
    description: "Real-time discussions, pairing, and contributor office hours.",
    href: "https://discord.gg/yH4vBNWwc",
    icon: Disc3,
  },
  {
    name: "Telegram",
    description: "Fast async updates for announcements and roadmap drops.",
    href: "https://t.me/offer_hub_contributors",
    icon: Send,
  },
  {
    name: "X",
    description: "Community highlights, release threads, and ecosystem news.",
    href: "https://x.com/offerhub_",
    icon: Twitter,
  },
  {
    name: "GitHub",
    description: "Open source repositories, pull requests, and roadmap items.",
    href: "https://github.com/OFFER-HUB",
    icon: Github,
  },
];

const CommunityChannelsSection = () => {
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
                className="flex h-full flex-col rounded-2xl bg-background p-6 shadow-raised transition-transform duration-300 hover:-translate-y-1"
              >
                <Icon size={18} className="text-primary" />
                <h3 className="mt-4 text-xl font-bold text-text-primary">
                  {channel.name}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                  {channel.description}
                </p>
                <span className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                  Join channel <ArrowUpRight size={16} />
                </span>
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityChannelsSection;