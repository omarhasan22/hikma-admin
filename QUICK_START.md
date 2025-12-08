# Quick Start Guide

## Setup

1. **Navigate to the project:**
   ```bash
   cd C:\Users\omar hasan\Desktop\hikma-admin
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   - Edit `src/environments/environment.ts`
   - Update `apiUrl` to match your backend API:
     ```typescript
     apiUrl: 'http://localhost:3000/api'
     ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Access the admin panel:**
   - Open browser to: `http://localhost:4200`
   - Login with admin credentials

## Features

### 🔐 Authentication
- Login page with email/password
- JWT token-based authentication
- Protected routes with auth guard

### 📊 Dashboard
- Overview statistics (sliders count, services count)
- Navigation sidebar

### 🖼️ Slider Management
- View all sliders
- Create new slider (with image upload)
- Edit slider (replace image)
- Delete slider
- Images saved to Supabase Storage: `uploads/sliders/`

### 🏥 Service Management
- View all services (specialties)
- Create new service
- Edit service details
- Delete service
- Services are global/predefined

### 🎨 Service Images Management
- View service images (filtered by service)
- Upload images for services (logos)
- Edit service images
- Delete service images
- Images saved to Supabase Storage: `uploads/services/`

## API Integration

The admin panel communicates with your Hikma API backend. Make sure:
- API is running on the configured URL
- CORS is enabled in the API
- Admin email is in `ADMIN_EMAILS` environment variable

## Project Structure

```
hikma-admin/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Dashboard layout
│   │   │   ├── sliders/        # Slider management
│   │   │   ├── services/       # Service management
│   │   │   └── service-images/ # Service image management
│   │   ├── services/           # API services
│   │   ├── guards/             # Route guards
│   │   └── environments/       # Environment configs
│   └── styles.css              # Global styles
└── README.md
```

## Notes

- All file uploads use `multipart/form-data`
- Images are automatically uploaded to Supabase Storage
- Old images are deleted when updating/deleting records
- All admin routes require authentication

