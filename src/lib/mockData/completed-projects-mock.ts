export interface CompletedProjectItem {
  id: string;
  title: string;
  freelancer: {
    name: string;
    avatar: string;
  };
  startDate: string; // ISO or human-readable
  endDate: string; // e.g., "present" | ISO
  status: 'completed';
}

export const completedProjectsMock: CompletedProjectItem[] = [
  {
    id: 'cproj-001',
    title: 'Mobile App UI/UX design',
    freelancer: { name: 'John Doe', avatar: '/avatar_olivia.jpg' },
    startDate: 'Jan 22, 2025',
    endDate: 'present',
    status: 'completed',
  },
  {
    id: 'cproj-002',
    title: 'Creative Mobile App UI/UX Solutions',
    freelancer: { name: 'Emily Johnson', avatar: '/avatar_olivia.jpg' },
    startDate: 'Mar 10, 2024',
    endDate: 'current',
    status: 'completed',
  },
  {
    id: 'cproj-003',
    title: 'Innovative Mobile Application User Interface and Experience Design',
    freelancer: { name: 'Alex Smith', avatar: '/avatar_olivia.jpg' },
    startDate: 'February 15, 2023',
    endDate: 'ongoing',
    status: 'completed',
  },
];


