const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const browser = process.argv[2];
if (!['chrome', 'firefox', 'edge'].includes(browser)) {
  console.error('Please specify browser: chrome, firefox, or edge');
  process.exit(1);
}

console.log(`Packaging extension for ${browser}...`);

// Create dist directory
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy build to temp directory
const tempDir = path.join(distDir, `${browser}-temp`);
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir);

// Copy files
execSync(`cp -r ${path.join(__dirname, '../build')}/* ${tempDir}`);

// Modify manifest for specific browsers
const manifestPath = path.join(tempDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (browser === 'firefox') {
  // Firefox-specific modifications
  manifest.browser_specific_settings = {
    gecko: {
      id: 'extension@productadoption.com',
      strict_min_version: '109.0'
    }
  };
  
  // Firefox doesn't support service_worker in MV3 yet
  manifest.background = {
    scripts: ['src/background/background.js'],
    persistent: false
  };
}

if (browser === 'edge') {
  // Edge-specific modifications
  manifest.browser_specific_settings = {
    edge: {
      browser_action_next_to_addressbar: true
    }
  };
}

// Write modified manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// Create zip file
const zipName = `productadoption-${browser}-${manifest.version}.zip`;
const zipPath = path.join(distDir, zipName);

console.log(`Creating ${zipName}...`);

if (process.platform === 'win32') {
  // Windows
  execSync(`powershell Compress-Archive -Path "${tempDir}/*" -DestinationPath "${zipPath}" -Force`);
} else {
  // macOS/Linux
  execSync(`cd "${tempDir}" && zip -r "${zipPath}" .`);
}

// Clean up temp directory
fs.rmSync(tempDir, { recursive: true });

console.log(`✅ Successfully created ${zipName}`);
console.log(`📦 Package location: ${zipPath}`);

// Create submission notes
const notesPath = path.join(distDir, `${browser}-submission-notes.txt`);
const notes = `ProductAdoption Extension - ${browser.charAt(0).toUpperCase() + browser.slice(1)} Submission Notes

Version: ${manifest.version}
Package: ${zipName}

Description:
${manifest.description}

Permissions Required:
${manifest.permissions.join('\n')}

Host Permissions:
${manifest.host_permissions.join('\n')}

Testing Instructions:
1. Install the extension
2. Click the extension icon to open the popup
3. Connect your ProductAdoption account
4. Navigate to any website
5. Click "Create New Tour" to start creating a tour
6. Click on elements to add them as tour steps
7. Save the tour when complete

Privacy Policy: https://productadoption.com/privacy
Terms of Service: https://productadoption.com/terms

Support: support@productadoption.com
`;

fs.writeFileSync(notesPath, notes);
console.log(`📝 Created submission notes: ${path.basename(notesPath)}`);