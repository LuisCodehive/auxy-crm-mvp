import { ServiceRequestStatus } from './serviceRequestStatus';



export interface ServiceRequest {
  id: string;
  userId: string;

  status: ServiceRequestStatus;

  createdAt: string;
  updatedAt: string;
}
