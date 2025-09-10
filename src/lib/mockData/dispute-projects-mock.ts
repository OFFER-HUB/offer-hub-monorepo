export type DisputedProject = {
  id: string;
  projectName: string;
  status: "Active" | "Completed" | "In Dispute";
  clientName: string;
  freelancerName: string;
};

export const mockDisputedProjects: DisputedProject[] = [
  {
    id: "proj-001",
    projectName: "E-commerce Platform",
    status: "In Dispute",
    clientName: "Tech Solutions Inc.",
    freelancerName: "John Doe",
  },
  {
    id: "proj-002",
    projectName: "Marketing Campaign Assets",
    status: "Completed",
    clientName: "Marketing Gurus",
    freelancerName: "Jane Smith",
  },
  {
    id: "proj-003",
    projectName: "Company Website Redesign",
    status: "Active",
    clientName: "Innovate Co.",
    freelancerName: "Alex Ray",
  },
];
