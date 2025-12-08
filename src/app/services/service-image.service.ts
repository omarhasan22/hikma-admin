import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { Observable } from 'rxjs';

export interface ServiceImage {
  id: string;
  service_id: string;
  image_url: string;
  display_order: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceImageService {
  constructor(private api: ApiService) {}

  listServiceImages(serviceId: string): Observable<ApiResponse<ServiceImage[]>> {
    return this.api.get<ServiceImage[]>(`/service-images/services/${serviceId}`);
  }

  getServiceImageById(id: string): Observable<ApiResponse<ServiceImage>> {
    return this.api.get<ServiceImage>(`/service-images/${id}`);
  }

  createServiceImage(serviceId: string, formData: FormData): Observable<ApiResponse<ServiceImage>> {
    return this.api.postFormData<ServiceImage>(`/service-images/services/${serviceId}`, formData);
  }

  bulkCreateServiceImages(serviceId: string, formData: FormData): Observable<ApiResponse<ServiceImage[]>> {
    return this.api.postFormData<ServiceImage[]>(`/service-images/services/${serviceId}/bulk`, formData);
  }

  updateServiceImage(id: string, formData: FormData): Observable<ApiResponse<ServiceImage>> {
    return this.api.putFormData<ServiceImage>(`/service-images/${id}`, formData);
  }

  deleteServiceImage(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/service-images/${id}`);
  }
}

