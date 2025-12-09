# GitHub Pages Deployment Guide

This guide explains how to deploy the Hikma Admin Panel to GitHub Pages.

## Prerequisites

1. A GitHub repository
2. GitHub Pages enabled in repository settings

## Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

### Setup Steps

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor Deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the workflow run and deploy your site
   - Once complete, your site will be available at:
     `https://[your-username].github.io/hikma-admin/`

## Manual Deployment (Using GitHub Pages Branch)

If you're deploying using GitHub Pages with a branch source (not GitHub Actions):

### Initial Setup

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose the `gh-pages` branch (or your preferred branch)
   - Select `/ (root)` as the folder

### Deploying

Simply run:
```bash
npm run deploy
```

This command will:
1. Build the project with the GitHub Pages configuration
2. Deploy the built files to the `gh-pages` branch
3. GitHub Pages will automatically serve your site from that branch

Your site will be available at:
`https://[your-username].github.io/hikma-admin/`

## Configuration

### Base Href

The base href is configured in `angular.json` under the `github-pages` configuration. 

- **For project pages** (username.github.io/repo-name): Use `/hikma-admin/` (current setting)
- **For user/organization pages** (username.github.io): Change to `/` in `angular.json`

**Important:** If your repository name is different from `hikma-admin`, update the `baseHref` in `angular.json` to match your repository name (e.g., `/your-repo-name/`).

### Custom Domain

If you're using a custom domain:

1. Update the base href in `angular.json` to `/`
2. Add your domain to the repository settings
3. Update the workflow if needed

## Troubleshooting

### 404 Errors on Refresh

The `404.html` file handles SPA routing. If you still get 404 errors:
- Ensure `404.html` is in the root of your repository
- Check that GitHub Pages is serving from the correct branch

### Build Failures

- Check Node.js version (requires Node 20+)
- Ensure all dependencies are installed: `npm ci`
- Check the Actions tab for detailed error messages

### Routing Issues

- Verify the base href matches your repository name
- Check that all routes are properly configured
- Ensure the `404.html` file is present

## Environment Variables

If you need to configure different API URLs for production:

1. Update `src/environments/environment.prod.ts`
2. The build process will use production environment automatically

