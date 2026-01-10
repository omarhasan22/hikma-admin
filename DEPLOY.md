# GitHub Pages Deployment Guide (Deploy from Branch)

This project is configured to deploy to GitHub Pages using the **"Deploy from a branch"** method.

## Prerequisites

- Node.js and npm installed
- Git repository configured
- GitHub Pages enabled in repository settings

## Setup Steps

### 1. Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **Branch**: `gh-pages`
5. Choose **Folder**: `/` (root)
6. Click **Save**

### 2. Set the Base Path

**Important:** The base path must match your repository name.

If your repository is `https://github.com/username/Admin-Hub`, the base path should be `/Admin-Hub/`.

To change the base path, edit `package.json` and update the `build:gh-pages` script:

```json
"build:gh-pages": "cross-env VITE_BASE_PATH=/YOUR-REPO-NAME/ vite build"
```

**Special cases:**
- If your repository is `username.github.io`, use base path: `/` (root)
- For project pages: `/repository-name/` (must end with `/`)

### 3. Deploy

Run the deployment command:

```bash
npm run deploy
```

This will:
1. Build your project with the correct base path
2. Push the `dist` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve your site

### 4. Access Your Site

After deployment, your site will be available at:
- `https://username.github.io/Admin-Hub/` (for project pages)
- `https://username.github.io/` (for user/organization pages)

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build with correct base path
npm run build:gh-pages

# Or build with custom base path
cross-env VITE_BASE_PATH=/Your-Repo-Name/ npm run build

# Deploy to gh-pages branch
npm run deploy
```

## Troubleshooting

### Base Path Issues

If your assets (CSS, JS, images) are not loading:
- Check that the base path in `package.json` matches your repository name
- The base path must start with `/` and end with `/`
- After changing the base path, rebuild and redeploy

### 404 Errors

If you get 404 errors on routes:
- Make sure your router is configured to work with the base path
- Check that `vite.config.ts` has the correct base path configuration

### Deployment Fails

If `npm run deploy` fails:
- Make sure you're authenticated with GitHub
- Check that you have push access to the repository
- Verify that `dist` folder exists after building

## Environment Variables

If you need environment variables for production, create a `.env.production` file:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_BASE_PATH=/Admin-Hub/
```

Then build with:
```bash
cross-env VITE_BASE_PATH=/Admin-Hub/ vite build
```

## Notes

- The `dist` folder is gitignored (it shouldn't be committed to your main branch)
- Only the `gh-pages` branch contains the built files
- After deployment, GitHub Pages may take a few minutes to update

