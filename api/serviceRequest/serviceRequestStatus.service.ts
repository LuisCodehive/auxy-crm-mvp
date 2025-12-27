import { ServiceRequest } from '../interfaces/serviceRequest';
import { ServiceRequestStatus } from '../interfaces/serviceRequestStatus';
import { ServiceRequestStatusHistory } from '../interfaces/ServiceRequestStatusHistory';

//const API_URL = import.meta.env.VITE_API_URL;

export const ServiceRequestStatusService = {
  getStatus: async (id: string): Promise<ServiceRequest> => {
    const res = await fetch(`/service-requests/${id}`);
    return res.json();
  },

  getTimeline: async (
    id: string
  ): Promise<ServiceRequestStatusHistory[]> => {
    const res = await fetch(
      `/service-requests/${id}/status-history`
    );
    return res.json();
  },

  updateStatus: async (
    id: string,
    status: ServiceRequestStatus
  ): Promise<ServiceRequest> => {
    const res = await fetch(
      `/service-requests/${id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );
    return res.json();
  },
};
