import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
   shouldDetach(route: ActivatedRouteSnapshot): boolean {
      return false;
   }

   store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
      // Don't store routes
   }

   shouldAttach(route: ActivatedRouteSnapshot): boolean {
      return false;
   }

   retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
      return null;
   }

   shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
      // Prevent reuse of child routes (sliders, services, service-images)
      // This ensures components are recreated on navigation and ngOnInit runs again
      const futurePath = future.routeConfig?.path;
      const currPath = curr.routeConfig?.path;

      // If navigating between different child routes, don't reuse
      if (futurePath && currPath && futurePath !== currPath) {
         // Check if either is a child route that should be recreated
         const childRoutes = ['sliders', 'services', 'service-images', 'dashboard'];
         if (childRoutes.includes(futurePath) || childRoutes.includes(currPath)) {
            return false;
         }
      }

      // For same route or parent routes, allow reuse
      return future.routeConfig === curr.routeConfig;
   }
}

