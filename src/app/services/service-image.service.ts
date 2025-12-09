import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { ServiceService, Service } from './service.service';
import { Observable, map } from 'rxjs';

export interface ServiceImage {
  id?: string;
  service_id?: string;
  image_url: string;
  display_order?: number;
  alt_text?: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceImageService {
  constructor(
    private api: ApiService,
    private serviceService: ServiceService
  ) { }

  /**
   * List images for a service
   * Images are nested in the service response as a single object (never an array)
   */
  listServiceImages(serviceId: string): Observable<ApiResponse<ServiceImage[]>> {
    return this.serviceService.getServiceById(serviceId).pipe(
      map((response: ApiResponse<Service>) => {
        console.log('Full API response:', response);
        if (response.status === 'ok' && response.result) {
          const service = response.result as any;
          console.log('Service object:', service);
          console.log('service.images:', service.images);
          console.log('Type of service.images:', typeof service.images);
          console.log('Is service.images null?', service.images === null);
          console.log('Is service.images undefined?', service.images === undefined);

          const imageObj = service.images; // Always a single object, never an array

          // Convert single image object to array for UI consistency
          const images = imageObj ? [{
            ...imageObj,
            service_id: service.id || serviceId
          }] : [];

          console.log('Final images array:', images);
          console.log('Images array length:', images.length);

          return {
            status: 'ok' as const,
            error: '',
            errorCode: '',
            result: images as ServiceImage[]
          };
        } else {
          console.log('Response status not ok or no result:', response);
          return {
            status: 'error' as const,
            error: response.error || 'Failed to load images',
            errorCode: response.errorCode || '',
            result: [] as ServiceImage[]
          };
        }
      })
    );
  }

  /**
   * Add images to a service (admin only)
   * POST /services/:serviceId/images
   */
  addServiceImages(serviceId: string, formData: FormData): Observable<ApiResponse<ServiceImage[]>> {
    return this.api.postFormData<ServiceImage[]>(`/services/${serviceId}/images`, formData);
  }

  /**
   * Remove an image from a service (admin only)
   * DELETE /services/:serviceId/images
   * Requires imageUrl in request body
   */
  removeServiceImage(serviceId: string, imageUrl: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/services/${serviceId}/images`, { imageUrl });
  }
}

