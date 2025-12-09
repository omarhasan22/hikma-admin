const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'dist', 'hikma-admin', 'browser');
const indexPath = path.join(buildDir, 'index.html');
const four04Path = path.join(buildDir, '404.html');

// SPA routing script for GitHub Pages
const spaScript = `
  <script type="text/javascript">
    // Single Page Apps for GitHub Pages
    // https://github.com/rafgraph/spa-github-pages
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>`;

try {
  // Read the built index.html
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Insert the SPA routing script before the closing </head> tag
  const four04Content = indexContent.replace('</head>', spaScript + '\n</head>');
  
  // Write to 404.html
  fs.writeFileSync(four04Path, four04Content, 'utf8');
  
  console.log('✓ Created 404.html from index.html with SPA routing script');
} catch (error) {
  console.error('Error creating 404.html:', error);
  process.exit(1);
}

