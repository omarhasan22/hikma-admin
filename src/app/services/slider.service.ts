import { Injectable } from '@angular/core';
import { ApiService, ApiResponse } from './api.service';
import { Observable } from 'rxjs';

export interface Slider {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  overlay_color: string;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  constructor(private api: ApiService) {}

  listActiveSliders(): Observable<ApiResponse<Slider[]>> {
    return this.api.get<Slider[]>('/sliders');
  }

  listAllSliders(): Observable<ApiResponse<Slider[]>> {
    return this.api.get<Slider[]>('/sliders/admin/all');
  }

  getSliderById(id: string): Observable<ApiResponse<Slider>> {
    return this.api.get<Slider>(`/sliders/${id}`);
  }

  createSlider(formData: FormData): Observable<ApiResponse<Slider>> {
    return this.api.postFormData<Slider>('/sliders', formData);
  }

  updateSlider(id: string, formData: FormData): Observable<ApiResponse<Slider>> {
    return this.api.putFormData<Slider>(`/sliders/${id}`, formData);
  }

  deleteSlider(id: string): Observable<ApiResponse<{ message: string }>> {
    return this.api.delete<{ message: string }>(`/sliders/${id}`);
  }
}

