export interface Skill {
  name: string;
  color: string;
}

export interface Talent {
  id: number;
  name: string;
  title: string;
  location: string;
  category: string;
  rating: number;
  hourlyRate: number;
  avatar: string;
  skills: Skill[];
  description: string;
  actionText: string;
}

export const talentMockData: Talent[] = [
  {
    id: 1,
    name: "John D",
    title: "UI/UX designer | Brand designer | Figma pro",
    location: "Canada",
    category: "Design",
    rating: 4.8,
    hourlyRate: 85,
    avatar: "/avatar.png",
    skills: [
      { name: "UI/UX", color: "bg-gray-500" },
      { name: "Design", color: "bg-red-500" },
      { name: "Figma", color: "bg-purple-500" },
      { name: "Product design", color: "bg-blue-400" },
      { name: "Framer", color: "bg-yellow-200 text-black" }
    ],
    description: "I am a UI/UX designer with 4 years of experience in creating user-friendly interfaces and enhancing user experiences. My passion lies in understanding user needs and translating them into intuitive designs that dri...",
    actionText: "Message"
  },
  {
    id: 2,
    name: "Alex R",
    title: "Creative Designer | Visual Artist | Figma Specialist",
    location: "Australia",
    category: "Design",
    rating: 4.9,
    hourlyRate: 95,
    avatar: "/avatar.png",
    skills: [
      { name: "User Experience", color: "bg-gray-500" },
      { name: "Creative Solutions", color: "bg-red-500" },
      { name: "Sketch", color: "bg-purple-400" },
      { name: "Interface Design", color: "bg-blue-400" },
      { name: "Webflow", color: "bg-yellow-200 text-black" }
    ],
    description: "I am a UI/UX designer with four years of experience in crafting user-centric interfaces and improving overall user experiences. I thrive on identifying user requirements and transforming them into seamless designs tha...",
    actionText: "Contact Me"
  },
  {
    id: 3,
    name: "Jordan T",
    title: "Innovative Creator | Digital Artist | Figma Expert",
    location: "New Zealand",
    category: "Design", 
    rating: 4.7,
    hourlyRate: 75,
    avatar: "/avatar.png",
    skills: [
      { name: "User Interaction", color: "bg-gray-500" },
      { name: "Inventive Strategies", color: "bg-red-500" },
      { name: "Adobe XD", color: "bg-purple-500" },
      { name: "User Interface Development", color: "bg-blue-400" },
      { name: "Squarespace", color: "bg-yellow-200 text-black" }
    ],
    description: "I am a UI/UX designer with five years of experience in creating user-focused interfaces and enhancing overall user satisfaction. I excel at understanding user needs and translating them into intuitive designs that boost...",
    actionText: "Get in Touch"
  },
  {
    id: 4,
    name: "Sarah M",
    title: "Full Stack Developer | React Specialist",
    location: "United States",
    category: "Development",
    rating: 4.9,
    hourlyRate: 120,
    avatar: "/avatar.png",
    skills: [
      { name: "React", color: "bg-gray-500" },
      { name: "Node.js", color: "bg-red-500" },
      { name: "Python", color: "bg-purple-500" },
      { name: "Full Stack", color: "bg-blue-400" },
      { name: "TypeScript", color: "bg-yellow-200 text-black" }
    ],
    description: "Experienced full-stack developer with 6 years of expertise in React, Node.js, and Python. I specialize in building scalable web applications and have a passion for clean, maintainable code...",
    actionText: "Hire Now"
  },
  {
    id: 5,
    name: "Mike L", 
    title: "SEO Expert | Content Strategist",
    location: "United Kingdom",
    category: "Marketing",
    rating: 4.6,
    hourlyRate: 65,
    avatar: "/avatar.png",
    skills: [
      { name: "SEO", color: "bg-gray-500" },
      { name: "Content Writing", color: "bg-red-500" },
      { name: "Social Media", color: "bg-purple-500" },
      { name: "Analytics", color: "bg-blue-400" },
      { name: "Strategy", color: "bg-yellow-200 text-black" }
    ],
    description: "Digital marketing specialist with 5 years of experience in SEO optimization and content strategy. I help businesses improve their online visibility and drive organic traffic through data-driven approaches...",
    actionText: "Connect"
  },
  {
    id: 6,
    name: "Emma K",
    title: "Technical Writer | Documentation Specialist",
    location: "Germany",
    category: "Writing",
    rating: 4.5,
    hourlyRate: 55,
    avatar: "/avatar.png",
    skills: [
      { name: "Technical Writing", color: "bg-gray-500" },
      { name: "Documentation", color: "bg-red-500" },
      { name: "Content Strategy", color: "bg-purple-500" },
      { name: "API Documentation", color: "bg-blue-400" },
      { name: "User Guides", color: "bg-yellow-200 text-black" }
    ],
    description: "Professional technical writer with 3 years of experience creating clear, user-friendly documentation for software products. I specialize in API documentation, user guides, and developer resources...",
    actionText: "Collaborate"
  },
  {
    id: 7,
    name: "David C",
    title: "Business Consultant | Strategy Expert",
    location: "France",
    category: "Consulting",
    rating: 4.8,
    hourlyRate: 150,
    avatar: "/avatar.png",
    skills: [
      { name: "Business Strategy", color: "bg-gray-500" },
      { name: "Market Research", color: "bg-red-500" },
      { name: "Financial Analysis", color: "bg-purple-500" },
      { name: "Process Optimization", color: "bg-blue-400" },
      { name: "Leadership", color: "bg-yellow-200 text-black" }
    ],
    description: "Senior business consultant with 8 years of experience helping startups and enterprises optimize their operations and growth strategies. I focus on data-driven solutions and sustainable business models...",
    actionText: "Consult"
  },
  {
    id: 8,
    name: "Lisa P",
    title: "Portrait Photographer | Event Specialist",
    location: "Netherlands",
    category: "Photography",
    rating: 4.7,
    hourlyRate: 80,
    avatar: "/avatar.png",
    skills: [
      { name: "Portrait Photography", color: "bg-gray-500" },
      { name: "Event Photography", color: "bg-red-500" },
      { name: "Photo Editing", color: "bg-purple-500" },
      { name: "Lightroom", color: "bg-blue-400" },
      { name: "Creative Direction", color: "bg-yellow-200 text-black" }
    ],
    description: "Professional photographer with 5 years of experience in portrait and event photography. I have a keen eye for capturing authentic moments and creating compelling visual stories...",
    actionText: "Book Session"
  }
];