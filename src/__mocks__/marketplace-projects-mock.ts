import { Project } from "@/types/project.types";

/**
 * Mock data for marketplace projects testing
 * These projects have status 'open' or 'published' to be visible in the marketplace
 */
export const mockMarketplaceProjects: Project[] = [
  {
    id: "proj-marketplace-001",
    client_id: "client-001",
    title: "Full Stack Developer for DeFi Dashboard",
    description: "We're looking for an experienced full-stack developer to build a comprehensive DeFi dashboard. The project involves creating a real-time dashboard that displays cryptocurrency prices, portfolio tracking, and DeFi protocol analytics. You'll work with React, TypeScript, Node.js, and integrate with multiple blockchain APIs. Experience with Web3 libraries and DeFi protocols is a plus.",
    category: "Web Development",
    subcategory: "Full Stack",
    budget: 5000,
    budgetType: "fixed",
    status: "open",
    visibility: "public",
    projectType: "on-time",
    experienceLevel: "expert",
    duration: "2-3 months",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    skills: ["React", "TypeScript", "Node.js", "Web3", "Blockchain", "DeFi"],
    tags: ["DeFi", "Blockchain", "Dashboard", "Crypto"],
    attachments: [],
    milestones: [
      {
        id: "milestone-1",
        title: "Design & Architecture",
        description: "Complete system design and architecture documentation",
        amount: 1500,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-2",
        title: "Frontend Development",
        description: "Build React dashboard with real-time data",
        amount: 2000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-3",
        title: "Backend & API Integration",
        description: "Implement Node.js backend and blockchain API integrations",
        amount: 1500,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    requirements: [
      {
        id: "req-1",
        title: "5+ years of full-stack development",
        description: "Proven experience with React and Node.js",
        type: "mandatory",
        category: "experience"
      },
      {
        id: "req-2",
        title: "Web3/Blockchain experience",
        description: "Previous work with DeFi protocols or blockchain APIs",
        type: "preferred",
        category: "experience"
      },
      {
        id: "req-3",
        title: "Portfolio of similar projects",
        description: "Showcase of dashboard or financial applications",
        type: "preferred",
        category: "portfolio"
      }
    ],
    location: {
      remote: true,
      country: "United States",
      timezone: "EST"
    },
    version: 1,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-001",
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "/person2.png",
      rating: 4.8,
      totalProjects: 12,
      verified: true,
      location: "New York, USA"
    }
  },
  {
    id: "proj-marketplace-002",
    client_id: "client-002",
    title: "Mobile App UI/UX Design - E-commerce",
    description: "We need a talented UI/UX designer to create beautiful and intuitive designs for our mobile e-commerce application. The app will serve customers shopping for fashion and accessories. You'll be responsible for creating wireframes, high-fidelity mockups, and interactive prototypes. The design should focus on conversion optimization and excellent user experience. Experience with Figma, Sketch, and mobile design patterns is required.",
    category: "Design",
    subcategory: "UI/UX",
    budget: 2500,
    budgetType: "fixed",
    status: "published",
    visibility: "public",
    projectType: "on-time",
    experienceLevel: "intermediate",
    duration: "4-6 weeks",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping", "User Research"],
    tags: ["Mobile", "E-commerce", "UI/UX", "Design"],
    attachments: [],
    milestones: [
      {
        id: "milestone-2-1",
        title: "Research & Wireframes",
        description: "User research and initial wireframes",
        amount: 800,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-2-2",
        title: "High-Fidelity Designs",
        description: "Complete high-fidelity mockups for all screens",
        amount: 1200,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-2-3",
        title: "Prototype & Handoff",
        description: "Interactive prototype and design handoff",
        amount: 500,
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    requirements: [
      {
        id: "req-2-1",
        title: "3+ years UI/UX design experience",
        description: "Strong portfolio of mobile app designs",
        type: "mandatory",
        category: "experience"
      },
      {
        id: "req-2-2",
        title: "Figma proficiency",
        description: "Expert level in Figma for design and prototyping",
        type: "mandatory",
        category: "skill"
      }
    ],
    location: {
      remote: true,
      country: "Canada",
      timezone: "PST"
    },
    version: 1,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-002",
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/person4.png",
      rating: 4.9,
      totalProjects: 8,
      verified: true,
      location: "Vancouver, Canada"
    }
  },
  {
    id: "proj-marketplace-003",
    client_id: "client-003",
    title: "Content Writing & SEO for Tech Blog",
    description: "We're looking for a skilled content writer with SEO expertise to create high-quality blog posts for our tech startup. You'll write about topics related to software development, AI, and technology trends. Each article should be well-researched, SEO-optimized, and engaging. We need 10 articles per month. Experience with tech writing and SEO tools (Ahrefs, SEMrush) is required.",
    category: "Writing",
    subcategory: "Content Writing",
    budget: 50,
    budgetType: "hourly",
    status: "open",
    visibility: "public",
    projectType: "ongoing",
    experienceLevel: "intermediate",
    duration: "Ongoing",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ["Content Writing", "SEO", "Tech Writing", "Research", "WordPress"],
    tags: ["Content", "SEO", "Blog", "Tech"],
    attachments: [],
    milestones: [],
    requirements: [
      {
        id: "req-3-1",
        title: "2+ years content writing experience",
        description: "Portfolio of published articles",
        type: "mandatory",
        category: "experience"
      },
      {
        id: "req-3-2",
        title: "SEO certification or proven results",
        description: "Experience with keyword research and optimization",
        type: "preferred",
        category: "certification"
      }
    ],
    location: {
      remote: true,
      country: "United Kingdom",
      timezone: "GMT"
    },
    version: 1,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-003",
      name: "David Brown",
      email: "david@example.com",
      avatar: "/person2.png",
      rating: 4.7,
      totalProjects: 15,
      verified: false,
      location: "London, UK"
    }
  },
  {
    id: "proj-marketplace-004",
    client_id: "client-004",
    title: "Brand Identity Design Package",
    description: "Complete brand identity design for a new fintech startup. This includes logo design, color palette, typography selection, brand guidelines document, and basic marketing materials (business cards, letterhead). The brand should convey trust, innovation, and professionalism. We're looking for a modern, clean aesthetic that works well in digital and print formats.",
    category: "Design",
    subcategory: "Branding",
    budget: 1800,
    budgetType: "fixed",
    status: "published",
    visibility: "public",
    projectType: "on-time",
    experienceLevel: "entry",
    duration: "3-4 weeks",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ["Logo Design", "Branding", "Adobe Illustrator", "Brand Guidelines"],
    tags: ["Branding", "Logo", "Identity", "Fintech"],
    attachments: [],
    milestones: [
      {
        id: "milestone-4-1",
        title: "Logo Concepts",
        description: "3-5 logo concept variations",
        amount: 600,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-4-2",
        title: "Brand Guidelines",
        description: "Complete brand guidelines document",
        amount: 800,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-4-3",
        title: "Marketing Materials",
        description: "Business cards and letterhead designs",
        amount: 400,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    requirements: [
      {
        id: "req-4-1",
        title: "Portfolio of brand identity work",
        description: "Showcase of previous branding projects",
        type: "mandatory",
        category: "portfolio"
      }
    ],
    location: {
      remote: true,
      country: "Australia",
      timezone: "AEST"
    },
    version: 1,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-004",
      name: "Lisa Wilson",
      email: "lisa@example.com",
      avatar: "/person6.png",
      rating: 4.6,
      totalProjects: 5,
      verified: true,
      location: "Sydney, Australia"
    }
  },
  {
    id: "proj-marketplace-005",
    client_id: "client-005",
    title: "Social Media Management - Monthly",
    description: "We need a social media manager to handle our Instagram, Twitter, and LinkedIn accounts. Responsibilities include creating content calendars, writing engaging posts, scheduling content, engaging with followers, and analyzing performance metrics. We're a B2B SaaS company, so experience with tech/SaaS social media is preferred. This is an ongoing monthly engagement.",
    category: "Marketing",
    subcategory: "Social Media",
    budget: 800,
    budgetType: "fixed",
    status: "open",
    visibility: "public",
    projectType: "ongoing",
    experienceLevel: "intermediate",
    duration: "Ongoing",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ["Social Media Management", "Content Creation", "Analytics", "SaaS Marketing"],
    tags: ["Social Media", "Marketing", "SaaS", "Content"],
    attachments: [],
    milestones: [],
    requirements: [
      {
        id: "req-5-1",
        title: "2+ years social media management",
        description: "Experience managing B2B social accounts",
        type: "mandatory",
        category: "experience"
      },
      {
        id: "req-5-2",
        title: "SaaS/Tech industry experience",
        description: "Previous work with tech or SaaS companies",
        type: "preferred",
        category: "experience"
      }
    ],
    location: {
      remote: true,
      country: "United States",
      timezone: "PST"
    },
    version: 1,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-005",
      name: "Maria Garcia",
      email: "maria@example.com",
      avatar: "/person4.png",
      rating: 4.5,
      totalProjects: 20,
      verified: true,
      location: "San Francisco, USA"
    }
  },
  {
    id: "proj-marketplace-006",
    client_id: "client-006",
    title: "React Native Mobile App Development",
    description: "We're building a fitness tracking mobile app using React Native. The app will track workouts, nutrition, and progress. Features include user authentication, workout logging, progress charts, social sharing, and premium subscription integration. You'll work with our existing backend API. Experience with React Native, Redux, and mobile app deployment is required.",
    category: "Mobile Development",
    subcategory: "React Native",
    budget: 7500,
    budgetType: "fixed",
    status: "published",
    visibility: "public",
    projectType: "on-time",
    experienceLevel: "expert",
    duration: "4-5 months",
    deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    skills: ["React Native", "TypeScript", "Redux", "Mobile Development", "App Store", "Play Store"],
    tags: ["Mobile", "React Native", "Fitness", "App"],
    attachments: [],
    milestones: [
      {
        id: "milestone-6-1",
        title: "MVP Development",
        description: "Core features and authentication",
        amount: 3000,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-6-2",
        title: "Advanced Features",
        description: "Charts, social features, and premium integration",
        amount: 3000,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      },
      {
        id: "milestone-6-3",
        title: "Testing & Deployment",
        description: "QA, testing, and app store submission",
        amount: 1500,
        dueDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        created_at: new Date().toISOString()
      }
    ],
    requirements: [
      {
        id: "req-6-1",
        title: "5+ years mobile development",
        description: "Proven React Native experience",
        type: "mandatory",
        category: "experience"
      },
      {
        id: "req-6-2",
        title: "Published apps in stores",
        description: "At least 2 apps published to App Store/Play Store",
        type: "mandatory",
        category: "portfolio"
      }
    ],
    location: {
      remote: true,
      country: "Germany",
      timezone: "CET"
    },
    version: 1,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: "client-006",
      name: "Thomas Mueller",
      email: "thomas@example.com",
      avatar: "/person3.png",
      rating: 4.9,
      totalProjects: 25,
      verified: true,
      location: "Berlin, Germany"
    }
  }
];

/**
 * Get a project by ID from mock data
 */
export function getMockProjectById(id: string): Project | undefined {
  return mockMarketplaceProjects.find(project => project.id === id);
}

/**
 * Get all open/published projects (for marketplace)
 */
export function getMockOpenProjects(): Project[] {
  return mockMarketplaceProjects.filter(
    project => project.status === 'open' || project.status === 'published'
  );
}

/**
 * Search projects by query
 */
export function searchMockProjects(query: string): Project[] {
  const lowerQuery = query.toLowerCase();
  return mockMarketplaceProjects.filter(
    project =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
  );
}
