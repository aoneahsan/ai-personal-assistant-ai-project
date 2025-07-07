# Contributing to ProductAdoption Extension

Thank you for your interest in contributing to ProductAdoption! We welcome contributions from the community and are excited to work with you.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [Community](#community)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Harassment of any kind
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could be considered inappropriate

### Enforcement

Instances of unacceptable behavior may be reported to conduct@productadoption.com. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 16.x or higher
- npm 8.x or higher
- Git
- A GitHub account
- Basic knowledge of browser extensions

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Go to https://github.com/productadoption/browser-extension
   # Click "Fork" button
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/browser-extension.git
   cd browser-extension
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/productadoption/browser-extension.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Set Up Development Environment**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your settings
   ```

6. **Run Development Build**
   ```bash
   npm run dev
   ```

### Project Structure Overview

```
browser-extension/
├── src/                 # Source code
│   ├── background/     # Background scripts
│   ├── content/        # Content scripts
│   ├── popup/          # Extension popup
│   ├── options/        # Options page
│   └── shared/         # Shared utilities
├── tests/              # Test files
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
└── public/             # Static assets
```

## Development Process

### Branching Strategy

We use Git Flow for our branching strategy:

```
main (production)
  └── develop (active development)
       ├── feature/your-feature
       ├── bugfix/issue-description
       └── hotfix/critical-fix
```

### Creating a Feature Branch

```bash
# Update your local develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/amazing-new-feature

# Make your changes
# ...

# Commit your changes
git add .
git commit -m "feat: add amazing new feature"

# Push to your fork
git push origin feature/amazing-new-feature
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
feat(popup): add dark mode toggle
fix(content): resolve element selection on SPAs
docs(api): update authentication section
test(background): add OAuth flow tests
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

**Bug Report Template:**
```markdown
## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- Browser: [e.g., Chrome 98]
- Extension Version: [e.g., 1.2.3]
- OS: [e.g., Windows 10]

## Additional Context
Any other relevant information.
```

### Suggesting Features

**Feature Request Template:**
```markdown
## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like to see it implemented?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any mockups, examples, or additional information.
```

### Your First Code Contribution

Start with issues labeled `good first issue`:

1. **Find an Issue**
   - Browse [issues labeled "good first issue"](https://github.com/productadoption/browser-extension/labels/good%20first%20issue)
   - Comment on the issue to claim it

2. **Understand the Codebase**
   - Read relevant documentation
   - Study similar features
   - Ask questions in the issue thread

3. **Make Your Changes**
   - Write clean, tested code
   - Follow coding standards
   - Update documentation

4. **Submit Pull Request**
   - Link to the issue
   - Describe your changes
   - Request review

## Coding Standards

### JavaScript Style Guide

We use ESLint with custom rules:

```javascript
// ✅ Good
const calculateTourProgress = (currentStep, totalSteps) => {
  if (totalSteps === 0) {
    return 0;
  }
  
  return Math.round((currentStep / totalSteps) * 100);
};

// ❌ Bad
function calc_progress(step, total) {
  if(total == 0) return 0
  return Math.round(step / total * 100)
}
```

### Key Guidelines

1. **Use ES6+ Features**
   ```javascript
   // Use arrow functions for callbacks
   array.map(item => item.id);
   
   // Use destructuring
   const { name, email } = user;
   
   // Use template literals
   const message = `Welcome, ${name}!`;
   ```

2. **Async/Await over Promises**
   ```javascript
   // ✅ Good
   async function fetchTours() {
     try {
       const tours = await api.getTours();
       return tours;
     } catch (error) {
       console.error('Failed to fetch tours:', error);
     }
   }
   
   // ❌ Avoid
   function fetchTours() {
     return api.getTours()
       .then(tours => tours)
       .catch(error => console.error(error));
   }
   ```

3. **Error Handling**
   ```javascript
   // Always handle errors appropriately
   try {
     await riskyOperation();
   } catch (error) {
     // Log error with context
     console.error('Context for debugging:', { 
       operation: 'riskyOperation',
       error: error.message,
       stack: error.stack 
     });
     
     // Handle gracefully
     showUserFriendlyError();
   }
   ```

4. **Comments and Documentation**
   ```javascript
   /**
    * Generates a CSS selector for the given element
    * @param {Element} element - DOM element to generate selector for
    * @param {Object} options - Configuration options
    * @param {boolean} options.preferIds - Prefer ID selectors
    * @param {boolean} options.includeNth - Include nth-child selectors
    * @returns {string} CSS selector string
    * @throws {Error} If element is not a valid DOM element
    */
   function generateSelector(element, options = {}) {
     // Implementation
   }
   ```

### CSS Guidelines

1. **Use CSS Variables**
   ```css
   :root {
     --primary-color: #007bff;
     --spacing-unit: 8px;
     --border-radius: 4px;
   }
   
   .button {
     background-color: var(--primary-color);
     padding: var(--spacing-unit);
     border-radius: var(--border-radius);
   }
   ```

2. **BEM Naming Convention**
   ```css
   /* Block */
   .tour-step {}
   
   /* Element */
   .tour-step__title {}
   .tour-step__content {}
   
   /* Modifier */
   .tour-step--active {}
   .tour-step--completed {}
   ```

3. **Mobile-First Approach**
   ```css
   /* Mobile styles (default) */
   .container {
     padding: 16px;
   }
   
   /* Tablet and up */
   @media (min-width: 768px) {
     .container {
       padding: 24px;
     }
   }
   ```

## Testing Guidelines

### Test Structure

```javascript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toBe('expected');
    });
    
    it('should handle edge cases', () => {
      // Test edge cases
    });
    
    it('should handle errors gracefully', () => {
      // Test error scenarios
    });
  });
});
```

### Test Categories

1. **Unit Tests**
   - Test individual functions/methods
   - Mock external dependencies
   - Fast execution
   - Located in `__tests__` folders

2. **Integration Tests**
   - Test component interactions
   - Use real browser APIs
   - Located in `tests/integration`

3. **E2E Tests**
   - Test complete user flows
   - Run in real browser
   - Located in `tests/e2e`

### Writing Good Tests

```javascript
// ✅ Good test
it('should calculate tour completion percentage correctly', () => {
  expect(calculateProgress(0, 10)).toBe(0);
  expect(calculateProgress(5, 10)).toBe(50);
  expect(calculateProgress(10, 10)).toBe(100);
  expect(calculateProgress(5, 0)).toBe(0); // Edge case
});

// ❌ Bad test
it('should work', () => {
  const result = doSomething();
  expect(result).toBeTruthy();
});
```

### Test Coverage

Maintain minimum coverage:
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Documentation

### Code Documentation

1. **JSDoc for Functions**
   ```javascript
   /**
    * @description Validates tour configuration
    * @param {Object} tourConfig - Tour configuration object
    * @returns {Object} Validation result
    * @example
    * const result = validateTour({ name: 'My Tour' });
    * console.log(result.isValid); // true
    */
   ```

2. **README Files**
   - Each module should have a README
   - Include usage examples
   - Document configuration options

3. **API Documentation**
   - Document all public APIs
   - Include request/response examples
   - Note breaking changes

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date

## Pull Request Process

### Before Submitting

1. **Check Your Code**
   ```bash
   # Run linter
   npm run lint
   
   # Run tests
   npm test
   
   # Build extension
   npm run build
   ```

2. **Update Documentation**
   - Update README if needed
   - Add/update JSDoc comments
   - Update CHANGELOG.md

3. **Test Manually**
   - Load extension in browser
   - Test your changes thoroughly
   - Test on different websites

### Submitting a Pull Request

1. **Create Pull Request**
   - Use meaningful title
   - Reference related issues
   - Provide detailed description

2. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of changes.
   
   ## Related Issue
   Fixes #123
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots
   If applicable.
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added where necessary
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs
   - Tests must pass
   - Code coverage maintained

2. **Code Review**
   - At least one approval required
   - Address feedback promptly
   - Re-request review after changes

3. **Merge Requirements**
   - All checks passing
   - Approved by maintainer
   - No merge conflicts
   - Up-to-date with base branch

### After Merge

- Delete your feature branch
- Pull latest changes
- Celebrate your contribution! 🎉

## Community

### Communication Channels

- **GitHub Discussions**: General discussions and questions
- **GitHub Issues**: Bug reports and feature requests
- **Email**: contributors@productadoption.com
- **Twitter**: @ProductAdoption

### Getting Help

- Check documentation first
- Search existing issues
- Ask in GitHub Discussions
- Be patient and respectful

### Recognition

We recognize contributors in:
- CONTRIBUTORS.md file
- Release notes
- Annual contributor report
- Special badges for regular contributors

## Additional Resources

### Helpful Links

- [Extension Development Guide](https://developer.chrome.com/docs/extensions/)
- [Web Extension APIs](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Development Tools

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox Developer Tools](https://developer.mozilla.org/docs/Tools)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-gallery)

---

Thank you for contributing to ProductAdoption! Your efforts help make our extension better for everyone. If you have any questions, don't hesitate to reach out.

Happy coding! 🚀