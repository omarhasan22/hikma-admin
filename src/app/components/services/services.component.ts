import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ServiceService, Service, CreateServiceDto } from '../../services/service.service';
import { ServiceImageService, ServiceImage } from '../../services/service-image.service';
import { DataCacheService } from '../../services/data-cache.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="services-page">
      <div class="page-header">
        <h2>Manage Services</h2>
        <button (click)="openCreateModal()" class="btn btn-primary">Add New Service</button>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="services-table" *ngIf="services && services.length > 0">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let service of services">
              <td>{{ service.name || '-' }}</td>
              <td>{{ service.description || '-' }}</td>
              <td>
                <span class="badge" [class.active]="service.is_active" [class.inactive]="!service.is_active">
                  {{ service.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button (click)="editService(service)" class="btn btn-sm btn-secondary">Edit</button>
                <button (click)="manageImages(service)" class="btn btn-sm btn-info">Images</button>
                <button (click)="deleteService(service.id)" class="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Service Images Section -->
      <div *ngIf="selectedServiceForImages" class="images-section">
        <div class="images-header">
          <h3>Images for: {{ getServiceName(selectedServiceForImages) }}</h3>
          <button (click)="openImageModal()" class="btn btn-primary btn-sm">Add Image</button>
          <button (click)="closeImagesSection()" class="btn btn-secondary btn-sm">Close</button>
        </div>
        
        <div *ngIf="imageError" class="error">{{ imageError }}</div>
        
        <div class="images-grid" *ngIf="serviceImages && serviceImages.length > 0">
          <div *ngFor="let image of serviceImages" class="image-card">
            <img [src]="image.image_url || ''" [alt]="image.alt_text || 'Service image'" />
            <div class="image-info">
              <p *ngIf="image.alt_text"><strong>Alt Text:</strong> {{ image.alt_text }}</p>
              <p><strong>Order:</strong> {{ image.display_order || 0 }}</p>
              <div class="image-actions">
                <button (click)="editImage(image)" class="btn btn-sm btn-secondary">Edit</button>
                <button (click)="deleteImage(image.id)" class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingService ? 'Edit Service' : 'Create New Service' }}</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          <form (ngSubmit)="saveService()" #serviceForm="ngForm">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required class="form-control" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="formData.description" name="description" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
                Active
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="!serviceForm.valid" class="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Image Modal -->
      <div *ngIf="showImageModal" class="modal-overlay" (click)="closeImageModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingImage ? 'Edit Service Image' : 'Add Service Image' }}</h3>
            <button (click)="closeImageModal()" class="close-btn">&times;</button>
          </div>
          <form (ngSubmit)="saveImage()" #imageForm="ngForm">
            <div class="form-group">
              <label>Service *</label>
              <select [(ngModel)]="imageFormData.serviceId" name="serviceId" required class="form-control">
                <option value="">Select Service</option>
                <option *ngFor="let service of services" [value]="service.id">{{ service.name || 'Unnamed Service' }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Image *</label>
              <input type="file" accept="image/*" (change)="onImageFileSelected($event)" class="form-control" [required]="!editingImage" />
              <small *ngIf="editingImage">Leave empty to keep current image</small>
            </div>
            <div class="form-group">
              <label>Alt Text</label>
              <input type="text" [(ngModel)]="imageFormData.altText" name="altText" class="form-control" />
            </div>
            <div class="form-group">
              <label>Display Order</label>
              <input type="number" [(ngModel)]="imageFormData.displayOrder" name="displayOrder" class="form-control" />
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeImageModal()" class="btn btn-secondary">Cancel</button>
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
    .services-table table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .services-table th,
    .services-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .services-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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
    .btn-info {
      background: #3498db;
      color: white;
    }
    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
    }
    .images-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .images-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .images-header h3 {
      margin: 0;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .image-card {
      background: #f8f9fa;
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
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .badge.active {
      background: #27ae60;
      color: white;
    }
    .badge.inactive {
      background: #95a5a6;
      color: white;
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
export class ServicesComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  error = '';
  showModal = false;
  editingService: Service | null = null;

  // Service Images
  selectedServiceForImages: string | null = null;
  serviceImages: ServiceImage[] = [];
  imageError = '';
  showImageModal = false;
  editingImage: ServiceImage | null = null;
  selectedImageFile: File | null = null;

  private routerSubscription?: Subscription;

  formData: CreateServiceDto = {
    name: '',
    description: '',
    isActive: true
  };

  imageFormData = {
    serviceId: '',
    altText: '',
    displayOrder: 0
  };

  constructor(
    private serviceService: ServiceService,
    private serviceImageService: ServiceImageService,
    private router: Router,
    private route: ActivatedRoute,
    private dataCache: DataCacheService
  ) { }

  ngOnInit() {
    // Use cached data if available
    const cachedServices = this.dataCache.getServices();
    if (cachedServices.length > 0) {
      this.services = cachedServices;
    } else {
      // Subscribe to cache updates
      this.routerSubscription = this.dataCache.services$.subscribe((services: Service[]) => {
        this.services = services;
      });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadServices() {
    this.error = '';

    this.serviceService.listServices().subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          const services = response.result || [];
          this.dataCache.setServices(services);
          this.services = services;
        } else {
          this.error = response.error || 'Failed to load services';
        }
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = err.error?.error || 'Failed to load services';
      }
    });
  }

  openCreateModal() {
    this.editingService = null;
    this.formData = {
      name: '',
      description: '',
      isActive: true
    };
    this.showModal = true;
  }

  editService(service: Service) {
    this.editingService = service;
    this.formData = {
      name: service.name || '',
      description: service.description || '',
      isActive: service.is_active !== undefined ? service.is_active : true
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingService = null;
  }

  saveService() {
    this.error = '';

    const request = this.editingService
      ? this.serviceService.updateService(this.editingService.id, this.formData)
      : this.serviceService.createService(this.formData);

    request.subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          // Reload to update cache
          this.loadServices();
          this.closeModal();
        } else {
          this.error = response.error || 'Failed to save service';
        }
      },
      error: (err) => {
        console.error('Error saving service:', err);
        this.error = err.error?.error || 'Failed to save service';
      }
    });
  }

  deleteService(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    this.serviceService.deleteService(id).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          // Reload to update cache
          this.loadServices();
        } else {
          this.error = response.error || 'Failed to delete service';
        }
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        this.error = err.error?.error || 'Failed to delete service';
      }
    });
  }

  // Service Images Methods
  manageImages(service: Service) {
    this.selectedServiceForImages = service.id;
    this.loadServiceImages(service.id);
  }

  closeImagesSection() {
    this.selectedServiceForImages = null;
    this.serviceImages = [];
    this.imageError = '';
  }

  loadServiceImages(serviceId: string) {
    this.imageError = '';
    this.serviceImageService.listServiceImages(serviceId).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          this.serviceImages = response.result || [];
        } else {
          this.imageError = response.error || 'Failed to load images';
        }
      },
      error: (err) => {
        console.error('Error loading images:', err);
        this.imageError = err.error?.error || 'Failed to load images';
      }
    });
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service?.name || 'Unknown';
  }

  openImageModal() {
    this.editingImage = null;
    this.imageFormData = {
      serviceId: this.selectedServiceForImages || '',
      altText: '',
      displayOrder: 0
    };
    this.selectedImageFile = null;
    this.showImageModal = true;
  }

  editImage(image: ServiceImage) {
    this.editingImage = image;
    this.imageFormData = {
      serviceId: image.service_id || '',
      altText: image.alt_text || '',
      displayOrder: image.display_order || 0
    };
    this.selectedImageFile = null;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.editingImage = null;
    this.selectedImageFile = null;
  }

  onImageFileSelected(event: any) {
    this.selectedImageFile = event.target.files[0];
  }

  saveImage() {
    if (!this.selectedImageFile && !this.editingImage) {
      this.imageError = 'Please select an image';
      return;
    }

    this.imageError = '';

    const formData = new FormData();
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    if (this.imageFormData.altText) {
      formData.append('altText', this.imageFormData.altText);
    }
    formData.append('displayOrder', this.imageFormData.displayOrder.toString());

    if (this.editingImage) {
      this.serviceImageService.updateServiceImage(this.editingImage.id, formData).subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            if (this.selectedServiceForImages) {
              this.loadServiceImages(this.selectedServiceForImages);
            }
            this.closeImageModal();
          } else {
            this.imageError = response.error || 'Failed to save image';
          }
        },
        error: (err) => {
          console.error('Error updating image:', err);
          this.imageError = err.error?.error || 'Failed to save image';
        }
      });
    } else {
      this.serviceImageService.createServiceImage(this.imageFormData.serviceId, formData).subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            if (this.selectedServiceForImages) {
              this.loadServiceImages(this.selectedServiceForImages);
            }
            this.closeImageModal();
          } else {
            this.imageError = response.error || 'Failed to save image';
          }
        },
        error: (err) => {
          console.error('Error creating image:', err);
          this.imageError = err.error?.error || 'Failed to save image';
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
          if (this.selectedServiceForImages) {
            this.loadServiceImages(this.selectedServiceForImages);
          }
        } else {
          this.imageError = response.error || 'Failed to delete image';
        }
      },
      error: (err) => {
        console.error('Error deleting image:', err);
        this.imageError = err.error?.error || 'Failed to delete image';
      }
    });
  }
}

