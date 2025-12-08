import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ServiceImageService, ServiceImage } from '../../services/service-image.service';
import { ServiceService, Service } from '../../services/service.service';
import { DataCacheService } from '../../services/data-cache.service';

@Component({
  selector: 'app-service-images',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="service-images-page">
      <div class="page-header">
        <h2>Manage Service Images</h2>
        <button (click)="openCreateModal()" class="btn btn-primary">Add Service Image</button>
      </div>

      <div class="filter-section">
        <label>Select Service:</label>
        <select [(ngModel)]="selectedServiceId" (change)="loadImages()" class="form-control">
          <option value="">All Services</option>
          <option *ngFor="let service of services" [value]="service.id">{{ service.name || 'Unnamed Service' }}</option>
        </select>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="images-grid" *ngIf="images && images.length > 0">
        <div *ngFor="let image of images" class="image-card">
          <img [src]="image.image_url || ''" [alt]="image.alt_text || 'Service image'" />
          <div class="image-info">
            <p><strong>Service:</strong> {{ getServiceName(image.service_id) }}</p>
            <p *ngIf="image.alt_text"><strong>Alt Text:</strong> {{ image.alt_text }}</p>
            <p><strong>Order:</strong> {{ image.display_order || 0 }}</p>
            <div class="image-actions">
              <button (click)="editImage(image)" class="btn btn-sm btn-secondary">Edit</button>
              <button (click)="deleteImage(image.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- <div *ngIf="images.length === 0" class="empty-state">
        <p>No service images found.</p>
      </div> -->

      <!-- Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingImage ? 'Edit Service Image' : 'Create Service Image' }}</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          <form (ngSubmit)="saveImage()" #imageForm="ngForm">
            <div class="form-group">
              <label>Service *</label>
              <select [(ngModel)]="formData.serviceId" name="serviceId" required class="form-control">
                <option value="">Select Service</option>
                <option *ngFor="let service of services" [value]="service.id">{{ service.name || 'Unnamed Service' }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Image *</label>
              <input type="file" accept="image/*" (change)="onFileSelected($event)" class="form-control" [required]="!editingImage" />
              <small *ngIf="editingImage">Leave empty to keep current image</small>
            </div>
            <div class="form-group">
              <label>Alt Text</label>
              <input type="text" [(ngModel)]="formData.altText" name="altText" class="form-control" />
            </div>
            <div class="form-group">
              <label>Display Order</label>
              <input type="number" [(ngModel)]="formData.displayOrder" name="displayOrder" class="form-control" />
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="!imageForm.valid" class="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-section {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .filter-section label {
      font-weight: 500;
    }
    .filter-section .form-control {
      max-width: 300px;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .image-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .image-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .image-info {
      padding: 1rem;
    }
    .image-info p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .image-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
    .btn-danger {
      background: #e74c3c;
      color: white;
    }
    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
    }
    .empty-state, .loading, .error {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
    }
    .error {
      color: #e74c3c;
      background: #fee;
    }
  `]
})
export class ServiceImagesComponent implements OnInit, OnDestroy {
  images: ServiceImage[] = [];
  services: Service[] = [];
  error = '';
  showModal = false;
  editingImage: ServiceImage | null = null;
  selectedServiceId = '';
  selectedFile: File | null = null;
  private routerSubscription?: Subscription;

  formData = {
    serviceId: '',
    altText: '',
    displayOrder: 0
  };

  constructor(
    private serviceImageService: ServiceImageService,
    private serviceService: ServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private dataCache: DataCacheService
  ) { }

  ngOnInit() {
    // Use cached services if available
    const cachedServices = this.dataCache.getServices();
    if (cachedServices.length > 0) {
      this.services = cachedServices;
    } else {
      // Subscribe to cache updates
      this.routerSubscription = this.dataCache.services$.subscribe((services: Service[]) => {
        this.services = services;
      });
    }
    
    // Load images (not cached, as they depend on selected service)
    this.loadImages();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadServices() {
    this.serviceService.listServices().subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          this.services = response.result || [];
        }
      }
    });
  }

  loadImages() {
    if (this.selectedServiceId) {
      this.error = '';

      this.serviceImageService.listServiceImages(this.selectedServiceId).subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            this.images = response.result || [];
          } else {
            this.error = response.error || 'Failed to load images';
          }
        },
        error: (err) => {
          console.error('Error loading images:', err);
          this.error = err.error?.error || 'Failed to load images';
        }
      });
    } else {
      this.images = [];
    }
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service?.name || 'Unknown';
  }

  openCreateModal() {
    this.editingImage = null;
    this.formData = {
      serviceId: this.selectedServiceId || '',
      altText: '',
      displayOrder: 0
    };
    this.selectedFile = null;
    this.showModal = true;
  }

  editImage(image: ServiceImage) {
    this.editingImage = image;
    this.formData = {
      serviceId: image.service_id || '',
      altText: image.alt_text || '',
      displayOrder: image.display_order || 0
    };
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingImage = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveImage() {
    if (!this.selectedFile && !this.editingImage) {
      this.error = 'Please select an image';
      return;
    }

    this.error = '';

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.formData.altText) {
      formData.append('altText', this.formData.altText);
    }
    formData.append('displayOrder', this.formData.displayOrder.toString());

    if (this.editingImage) {
      this.serviceImageService.updateServiceImage(this.editingImage.id, formData).subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            this.loadImages();
            this.closeModal();
          } else {
            this.error = response.error || 'Failed to save image';
          }
        },
        error: (err) => {
          console.error('Error updating image:', err);
          this.error = err.error?.error || 'Failed to save image';
        }
      });
    } else {
      this.serviceImageService.createServiceImage(this.formData.serviceId, formData).subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            this.loadImages();
            this.closeModal();
          } else {
            this.error = response.error || 'Failed to save image';
          }
        },
        error: (err) => {
          console.error('Error creating image:', err);
          this.error = err.error?.error || 'Failed to save image';
        }
      });
    }
  }

  deleteImage(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.serviceImageService.deleteServiceImage(id).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          this.loadImages();
        } else {
          this.error = response.error || 'Failed to delete image';
        }
      },
      error: (err) => {
        console.error('Error deleting image:', err);
        this.error = err.error?.error || 'Failed to delete image';
      }
    });
  }
}

