import { apiClient } from '../../../api/apiClient';
import type { ProfileUpdateRequest, ProfileRequestStatus } from '../types/profile.types';

export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  full_name: 'Full Name',
  phone: 'Phone Number',
  personal_email: 'Personal Email',
  address: 'Residential Address',
  emergency_contact_name: 'Emergency Contact Name',
  emergency_contact_phone: 'Emergency Contact Phone',
  date_of_birth: 'Date of Birth',
  bio: 'Bio',
  skills: 'Skills',
};

export const getFieldDisplayName = (field: string): string => {
  return FIELD_DISPLAY_NAMES[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

class ProfileService {
  public async getAdminProfileRequests(status?: ProfileRequestStatus | 'All'): Promise<ProfileUpdateRequest[]> {
    const params: Record<string, string> = {};
    if (status && status !== 'All') {
      params.status = status;
    }
    const res = await apiClient.get('/profile/admin/update-requests', { params });
    return res.data?.data || [];
  }

  public async approveRequest(id: number): Promise<ProfileUpdateRequest> {
    const res = await apiClient.patch(`/profile/admin/update-requests/${id}/approve`);
    return res.data?.data;
  }

  public async rejectRequest(id: number, rejectionReason: string): Promise<ProfileUpdateRequest> {
    const res = await apiClient.patch(`/profile/admin/update-requests/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return res.data?.data;
  }
}

export const profileService = new ProfileService();
export default profileService;
