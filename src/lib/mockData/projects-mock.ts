export interface MockProject {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'in-progress' | 'pending';
  budget: string;
  freelancer: {
    id: string;
    name: string;
    avatar: string;
  };
  client: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  deadline: string;
}

export const mockProjects: MockProject[] = [
  {
    id: 'proj-001',
    title: 'Mobile App UI/UX design',
    description: 'Design a modern mobile application interface with user experience optimization',
    status: 'in-progress',
    budget: '$2,500',
    freelancer: {
      id: 'freelancer-001',
      name: 'Sarah Johnson',
      avatar: '/person1.png'
    },
    client: {
      id: 'client-001',
      name: 'John Smith',
      avatar: '/person2.png'
    },
    createdAt: '2024-01-15',
    deadline: '2024-02-15'
  },
  {
    id: 'proj-002',
    title: 'E-commerce Website Development',
    description: 'Full-stack development of an e-commerce platform with payment integration',
    status: 'active',
    budget: '$5,000',
    freelancer: {
      id: 'freelancer-002',
      name: 'Mike Chen',
      avatar: '/person3.png'
    },
    client: {
      id: 'client-002',
      name: 'Emily Davis',
      avatar: '/person4.png'
    },
    createdAt: '2024-01-10',
    deadline: '2024-03-10'
  },
  {
    id: 'proj-003',
    title: 'Brand Identity Design',
    description: 'Complete brand identity package including logo, colors, and guidelines',
    status: 'pending',
    budget: '$1,800',
    freelancer: {
      id: 'freelancer-003',
      name: 'Alex Rodriguez',
      avatar: '/person5.png'
    },
    client: {
      id: 'client-003',
      name: 'Lisa Wilson',
      avatar: '/person6.png'
    },
    createdAt: '2024-01-20',
    deadline: '2024-02-20'
  },
  {
    id: 'proj-004',
    title: 'Content Writing & SEO',
    description: 'Blog content creation and SEO optimization for tech startup',
    status: 'completed',
    budget: '$1,200',
    freelancer: {
      id: 'freelancer-004',
      name: 'Rachel Green',
      avatar: '/person1.png'
    },
    client: {
      id: 'client-004',
      name: 'David Brown',
      avatar: '/person2.png'
    },
    createdAt: '2023-12-01',
    deadline: '2024-01-01'
  },
  {
    id: 'proj-005',
    title: 'Social Media Management',
    description: 'Monthly social media content creation and management',
    status: 'active',
    budget: '$800',
    freelancer: {
      id: 'freelancer-005',
      name: 'Tom Anderson',
      avatar: '/person3.png'
    },
    client: {
      id: 'client-005',
      name: 'Maria Garcia',
      avatar: '/person4.png'
    },
    createdAt: '2024-01-05',
    deadline: '2024-02-05'
  }
];

export const getProjectById = (id: string): MockProject | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getActiveProjects = (): MockProject[] => {
  return mockProjects.filter(project => project.status === 'active' || project.status === 'in-progress');
};

export const getProjectsByClient = (clientId: string): MockProject[] => {
  return mockProjects.filter(project => project.client.id === clientId);
};