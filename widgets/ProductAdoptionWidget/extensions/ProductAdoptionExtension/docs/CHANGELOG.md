# Changelog

All notable changes to the ProductAdoption Browser Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-language support for tours
- AI-powered tour suggestions
- Mobile app tour support (beta)

### Changed
- Improved element detection algorithm
- Updated to Manifest V3 for all browsers

### Fixed
- Memory leak in tour renderer
- Tooltip positioning on scrollable elements

## [1.0.0] - 2024-01-01

### Added
- Initial release of ProductAdoption Browser Extension
- Visual tour creation interface
- Element picker with smart selector generation
- Real-time tour preview
- Multi-step tour support
- Tour analytics dashboard
- Team collaboration features
- Chrome, Firefox, and Edge support
- OAuth authentication
- Tour import/export functionality
- Keyboard shortcuts
- Dark mode support

### Security
- Implemented secure token storage
- Added Content Security Policy
- Encrypted API communications

## [0.9.0] - 2023-12-15 (Beta)

### Added
- Beta release for testing
- Basic tour creation
- Element selection
- Tour preview
- Chrome support only

### Known Issues
- Occasional issues with dynamic content
- Limited browser support
- No team features yet

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
New features added to the extension

#### Changed
Changes to existing functionality

#### Deprecated
Features that will be removed in future versions

#### Removed
Features removed in this release

#### Fixed
Bug fixes

#### Security
Security-related changes

---

## Upgrade Guide

### From 0.9.0 to 1.0.0

1. **Breaking Changes**
   - Tour data structure updated
   - API endpoints changed
   - Authentication flow revised

2. **Migration Steps**
   ```bash
   # Export existing tours
   npm run migrate:export
   
   # Update extension
   # Re-import tours
   npm run migrate:import
   ```

3. **New Features to Configure**
   - Enable team collaboration in settings
   - Configure keyboard shortcuts
   - Set up analytics preferences

---

*For detailed release notes, visit [releases.productadoption.com](https://releases.productadoption.com)*