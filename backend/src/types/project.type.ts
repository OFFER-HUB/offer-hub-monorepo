export interface CreateProjectDTO {
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status?: string;
}
