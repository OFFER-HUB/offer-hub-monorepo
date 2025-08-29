export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ServiceRequest {
  id: string;
  service_id: string;
  client_id: string;
  freelancer_id: string;
  message: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequestDTO {
  service_id: string;
  client_id: string;
  message: string;
}

export interface UpdateServiceRequestDTO {
  status: RequestStatus;
}
