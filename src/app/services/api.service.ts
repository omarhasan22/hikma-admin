import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  error: string;
  errorCode: string;
  result: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.getValidToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    // Remove quotes if present, trim whitespace
    let cleaned = token.trim().replace(/^["']|["']$/g, '');

    // Validate JWT format (should have 3 parts separated by dots)
    const parts = cleaned.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format detected, clearing token');
      localStorage.removeItem('accessToken');
      return null;
    }

    return cleaned;
  }

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    });
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, formData, {
      headers
    });
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    });
  }

  putFormData<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, formData, {
      headers
    });
  }

  delete<T>(endpoint: string, body?: any): Observable<ApiResponse<T>> {
    if (body) {
      return this.http.request<ApiResponse<T>>('DELETE', `${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
        body: body
      });
    } else {
      return this.http.delete<ApiResponse<T>>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders()
      });
    }
  }
}

