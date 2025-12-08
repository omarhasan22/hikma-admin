import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SliderService } from '../../services/slider.service';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { DataCacheService } from '../../services/data-cache.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="dashboard">
      <nav class="sidebar">
        <div class="logo">
          <h2>Hikma Admin</h2>
        </div>
        <ul class="nav-menu">
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="/sliders" routerLinkActive="active">Sliders</a></li>
          <li><a routerLink="/services" routerLinkActive="active">Services</a></li>
          <li><a (click)="logout()" class="logout">Logout</a></li>
        </ul>
      </nav>
      <div class="main-content">
        <header class="header">
          <h1>Dashboard</h1>
        </header>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Sliders</h3>
            <p class="stat-number">{{ sliderCount }}</p>
          </div>
          <div class="stat-card">
            <h3>Services</h3>
            <p class="stat-number">{{ serviceCount }}</p>
          </div>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      padding: 1rem 0;
    }
    .logo {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-menu li {
      margin: 0;
    }
    .nav-menu a {
      display: block;
      padding: 1rem;
      color: white;
      text-decoration: none;
      transition: background 0.3s;
    }
    .nav-menu a:hover,
    .nav-menu a.active {
      background: #34495e;
    }
    .logout {
      cursor: pointer;
      color: #e74c3c !important;
    }
    .main-content {
      flex: 1;
      padding: 2rem;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header h1 {
      margin: 0;
      color: #2c3e50;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #7f8c8d;
      font-size: 0.9rem;
      text-transform: uppercase;
    }
    .stat-number {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }
  `]
})
export class DashboardComponent implements OnInit {
  sliderCount = 0;
  serviceCount = 0;

  constructor(
    private sliderService: SliderService,
    private serviceService: ServiceService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dataCache: DataCacheService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Load sliders if not already loaded
    if (!this.dataCache.isSlidersLoaded()) {
      this.sliderService.listAllSliders().subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            const sliders = response.result || [];
            this.dataCache.setSliders(sliders);
            this.sliderCount = sliders.length;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Error loading sliders:', err);
          this.sliderCount = 0;
          this.cdr.markForCheck();
        }
      });
    } else {
      // Use cached data
      const sliders = this.dataCache.getSliders();
      this.sliderCount = sliders.length;
    }

    // Load services if not already loaded
    if (!this.dataCache.isServicesLoaded()) {
      this.serviceService.listServices().subscribe({
        next: (response) => {
          if (response.status === 'ok') {
            const services = response.result || [];
            this.dataCache.setServices(services);
            this.serviceCount = services.length;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Error loading services:', err);
          this.serviceCount = 0;
          this.cdr.markForCheck();
        }
      });
    } else {
      // Use cached data
      const services = this.dataCache.getServices();
      this.serviceCount = services.length;
    }
  }

  logout() {
    this.authService.logout();
  }
}

