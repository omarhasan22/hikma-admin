import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { Observable } from 'rxjs';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  is_predefined: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  images?: any[]; // Service images nested in service response
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private api: ApiService) { }

  listServices(): Observable<ApiResponse<Service[]>> {
    return this.api.get<Service[]>('/services');
  }

  getServiceById(id: string): Observable<ApiResponse<Service>> {
    return this.api.get<Service>(`/services/${id}`);
  }

  createService(service: CreateServiceDto): Observable<ApiResponse<Service>> {
    return this.api.post<Service>('/services', service);
  }

  updateService(id: string, service: Partial<CreateServiceDto>): Observable<ApiResponse<Service>> {
    return this.api.put<Service>(`/services/${id}`, service);
  }

  deleteService(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/services/${id}`);
  }
}

