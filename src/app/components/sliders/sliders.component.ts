import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SliderService, Slider } from '../../services/slider.service';
import { DataCacheService } from '../../services/data-cache.service';

@Component({
  selector: 'app-sliders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sliders-page">
      <div class="page-header">
        <h2>Manage Sliders</h2>
        <button (click)="openCreateModal()" class="btn btn-primary">Add New Slider</button>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="sliders-grid" *ngIf="sliders">
        <div *ngFor="let slider of sliders" class="slider-card">
          <div class="slider-image">
            <img [src]="slider.image_url || ''" [alt]="slider.title || 'Slider image'" />
          </div>
          <div class="slider-info">
            <h3>{{ slider.title || 'Untitled' }}</h3>
            <p *ngIf="slider.description">{{ slider.description }}</p>
            <div class="slider-meta">
              <span class="badge" [class.active]="slider.is_active" [class.inactive]="!slider.is_active">
                {{ slider.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="order">Order: {{ slider.display_order || 0 }}</span>
            </div>
            <div class="slider-actions">
              <button (click)="editSlider(slider)" class="btn btn-sm btn-secondary">Edit</button>
              <button (click)="deleteSlider(slider.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- <div *ngIf="sliders.length === 0" class="empty-state">
        <p>No sliders found. Create your first slider!</p>
      </div> -->

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingSlider ? 'Edit Slider' : 'Create New Slider' }}</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          <form (ngSubmit)="saveSlider()" #sliderForm="ngForm">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="formData.title" name="title" required class="form-control" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="formData.description" name="description" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Image *</label>
              <input type="file" accept="image/*" (change)="onFileSelected($event)" class="form-control" [required]="!editingSlider" />
              <small *ngIf="editingSlider">Leave empty to keep current image</small>
            </div>
            <div class="form-group">
              <label>Overlay Color</label>
              <input type="color" [(ngModel)]="formData.overlayColor" name="overlayColor" class="form-control" />
            </div>
            <div class="form-group">
              <label>Display Order</label>
              <input type="number" [(ngModel)]="formData.displayOrder" name="displayOrder" class="form-control" />
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
                Active
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="!sliderForm.valid" class="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .sliders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .slider-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .slider-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
    .slider-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .slider-info {
      padding: 1rem;
    }
    .slider-info h3 {
      margin: 0 0 0.5rem 0;
    }
    .slider-meta {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
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
    .slider-actions {
      display: flex;
      gap: 0.5rem;
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
export class SlidersComponent implements OnInit, OnDestroy {
  sliders: Slider[] = [];
  error = '';
  showModal = false;
  editingSlider: Slider | null = null;
  selectedFile: File | null = null;
  private routerSubscription?: Subscription;

  formData = {
    title: '',
    description: '',
    overlayColor: '#4A90E2',
    displayOrder: 0,
    isActive: true
  };

  constructor(
    private sliderService: SliderService,
    private router: Router,
    private route: ActivatedRoute,
    private dataCache: DataCacheService
  ) { }

  ngOnInit() {
    // Use cached data if available
    const cachedSliders = this.dataCache.getSliders();
    if (cachedSliders.length > 0) {
      this.sliders = cachedSliders;
    } else {
      // Subscribe to cache updates
      this.routerSubscription = this.dataCache.sliders$.subscribe((sliders: Slider[]) => {
        this.sliders = sliders;
      });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadSliders() {
    this.error = '';

    this.sliderService.listAllSliders().subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          const sliders = response.result || [];
          this.dataCache.setSliders(sliders);
          this.sliders = sliders;
        } else {
          this.error = response.error || 'Failed to load sliders';
        }
      },
      error: (err) => {
        console.error('Error loading sliders:', err);
        this.error = err.error?.error || 'Failed to load sliders';
      }
    });
  }

  openCreateModal() {
    this.editingSlider = null;
    this.formData = {
      title: '',
      description: '',
      overlayColor: '#4A90E2',
      displayOrder: 0,
      isActive: true
    };
    this.selectedFile = null;
    this.showModal = true;
  }

  editSlider(slider: Slider) {
    this.editingSlider = slider;
    this.formData = {
      title: slider.title || '',
      description: slider.description || '',
      overlayColor: slider.overlay_color || '#4A90E2',
      displayOrder: slider.display_order || 0,
      isActive: slider.is_active !== undefined ? slider.is_active : true
    };
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingSlider = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveSlider() {
    if (!this.selectedFile && !this.editingSlider) {
      this.error = 'Please select an image';
      return;
    }

    this.error = '';

    const formData = new FormData();
    formData.append('title', this.formData.title);
    if (this.formData.description) {
      formData.append('description', this.formData.description);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    formData.append('overlayColor', this.formData.overlayColor);
    formData.append('displayOrder', this.formData.displayOrder.toString());
    formData.append('isActive', this.formData.isActive.toString());

    const request = this.editingSlider
      ? this.sliderService.updateSlider(this.editingSlider.id, formData)
      : this.sliderService.createSlider(formData);

    request.subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          // Reload to update cache
          this.loadSliders();
          this.closeModal();
        } else {
          this.error = response.error || 'Failed to save slider';
        }
      },
      error: (err) => {
        console.error('Error saving slider:', err);
        this.error = err.error?.error || 'Failed to save slider';
      }
    });
  }

  deleteSlider(id: string) {
    if (!confirm('Are you sure you want to delete this slider?')) {
      return;
    }

    this.sliderService.deleteSlider(id).subscribe({
      next: (response) => {
        if (response.status === 'ok') {
          // Reload to update cache
          this.loadSliders();
        } else {
          this.error = response.error || 'Failed to delete slider';
        }
      },
      error: (err) => {
        console.error('Error deleting slider:', err);
        this.error = err.error?.error || 'Failed to delete slider';
      }
    });
  }
}

