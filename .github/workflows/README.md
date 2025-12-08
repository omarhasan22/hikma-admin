# GitHub Actions Workflows

## deploy.yml

This workflow automatically builds and deploys the Angular application to GitHub Pages when you push to the `main` or `master` branch.

### What it does:

1. **Builds the application** using the `github-pages` configuration
2. **Deploys to GitHub Pages** using the official GitHub Pages deployment action

### Requirements:

- GitHub Pages must be enabled in repository settings
- Source must be set to "GitHub Actions" in Pages settings
- Repository must have Actions enabled

### Manual Trigger:

You can also manually trigger the deployment by going to:
- **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

