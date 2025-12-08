import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Slider } from './slider.service';
import { Service } from './service.service';

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private slidersSubject = new BehaviorSubject<Slider[]>([]);
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  
  public sliders$ = this.slidersSubject.asObservable();
  public services$ = this.servicesSubject.asObservable();

  private slidersLoaded = false;
  private servicesLoaded = false;

  setSliders(sliders: Slider[]) {
    this.slidersSubject.next(sliders);
    this.slidersLoaded = true;
  }

  getSliders(): Slider[] {
    return this.slidersSubject.value;
  }

  isSlidersLoaded(): boolean {
    return this.slidersLoaded;
  }

  setServices(services: Service[]) {
    this.servicesSubject.next(services);
    this.servicesLoaded = true;
  }

  getServices(): Service[] {
    return this.servicesSubject.value;
  }

  isServicesLoaded(): boolean {
    return this.servicesLoaded;
  }

  refreshSliders() {
    this.slidersLoaded = false;
  }

  refreshServices() {
    this.servicesLoaded = false;
  }
}

