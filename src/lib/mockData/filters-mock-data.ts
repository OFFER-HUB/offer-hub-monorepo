export interface FilterOptions {
  categories: string[];
  skills: string[];
  locations: string[];
  ratings: number[];
  priceRange: {
    min: number;
    max: number;
  };
}

export const filterMockData: FilterOptions = {
  categories: [
    "Design",
    "Development",
    "Marketing",
    "Writing",
    "Consulting",
    "Photography",
  ],
  skills: [
    // Design Skills
    "UI/UX",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Design",
    "Product design",
    "Framer",
    "User Experience",
    "Creative Solutions",
    "Interface Design",
    "Webflow",
    "User Interaction",
    "Inventive Strategies",
    "User Interface Development",
    "Squarespace",

    // Development Skills
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Python",
    "Full Stack",
    "TypeScript",
    "JavaScript",
    "PHP",
    "Java",
    "C#",

    // Marketing Skills
    "SEO",
    "Content Writing",
    "Social Media",
    "Analytics",
    "Strategy",
    "Digital Marketing",
    "PPC",
    "Email Marketing",
    "Brand Management",

    // Writing Skills
    "Technical Writing",
    "Documentation",
    "Content Strategy",
    "API Documentation",
    "User Guides",
    "Copywriting",
    "Blog Writing",

    // Consulting Skills
    "Business Strategy",
    "Market Research",
    "Financial Analysis",
    "Process Optimization",
    "Leadership",
    "Project Management",

    // Photography Skills
    "Portrait Photography",
    "Event Photography",
    "Photo Editing",
    "Lightroom",
    "Creative Direction",
    "Product Photography",
    "Wedding Photography",
  ],
  locations: [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "New Zealand",
    "Singapore",
    "Remote",
  ],
  ratings: [1, 2, 3, 4, 5],
  priceRange: {
    min: 0,
    max: 1000,
  },
};

export type Filters = {
  categories: string[];
  skills: string[];
  locations: string[];
  rating: number | null;
  priceRange: {
    min: number;
    max: number;
  };
};
