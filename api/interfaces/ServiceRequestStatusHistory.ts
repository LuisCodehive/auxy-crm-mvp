import { ServiceRequestStatus } from './serviceRequestStatus';

export interface ServiceRequestStatusHistory {
  id: string;
  serviceRequestId: string;

  status: ServiceRequestStatus;

  changedById: string;
  changedByRole: 'USER' | 'DRIVER' | 'PROVIDER' | 'ADMIN';

  createdAt: string;
}
