# React Native Inspect

A powerful CLI tool for analyzing React Native projects, generating comprehensive reports with recommendations and analysis. Get insights into your dependencies, security vulnerabilities, and React Native specific configurations with a beautiful, modern HTML report interface.

## ✨ Features

- 📦 **Advanced Dependency Analysis**: Check for outdated packages, available updates, and major version changes
- 🔒 **Security Audit**: Comprehensive vulnerability scanning with detailed reporting and severity levels
- 📊 **Modern HTML Reports**: Beautiful, responsive reports with drawer-based navigation and interactive elements
- ⚛️ **React Native Specific Analysis**: Architecture detection, version compatibility, and New Architecture status
- 🔧 **Multiple Package Manager Support**: Seamless integration with npm, yarn, and pnpm
- 📱 **Mobile-First Design**: Responsive report interface optimized for all devices
- ⌨️ **Keyboard Navigation**: Quick navigation with keyboard shortcuts
- 🎨 **Modern UI/UX**: Clean, professional interface with smooth animations and intuitive design

## 🎯 HTML Report Features

The generated HTML report includes a modern drawer-based interface with:

- **📦 Dependencies Analysis** (opens by default): Interactive table with outdated packages, update types, and NPM links
- **🔒 Security Audit**: Vulnerability breakdown with severity levels and detailed information
- **⚛️ React Native**: Architecture analysis, version compatibility, and configuration insights  
- **📊 Summary**: Project health overview with actionable recommendations

### Navigation & Interactions
- **Drawer Navigation**: Clean sidebar with section indicators and badges
- **Mobile Responsive**: Collapsible drawer with touch-friendly interface
- **Keyboard Shortcuts**: `Ctrl/Cmd + 1-4` to switch sections, `Escape` to close mobile drawer
- **Interactive Tables**: Sortable columns with hover effects and external links
- **Real-time Indicators**: Live status badges and progress indicators

## 🚀 Requirements

- [Bun](https://bun.sh/) runtime (v1.0.0 or higher)

## 📦 Installation

### Install Bun (if not already installed)
```bash
curl -fsSL https://bun.sh/install | bash
```

### Recommended: Global Installation
```bash
npm install -g react-native-inspect
```

### One-time Usage
```bash
npx react-native-inspect
```

## 💻 Usage

### Basic Analysis
```bash
# Analyze current directory
react-native-inspect

# Analyze specific project
react-native-inspect /path/to/project
```

### What Happens During Analysis
1. **🔍 Project Detection**: Automatically detects package manager (npm/yarn/pnpm)
2. **📦 Dependency Analysis**: Scans for outdated packages and categorizes update types
3. **🔒 Security Audit**: Runs vulnerability scan using lockfiles
4. **⚛️ React Native Analysis**: Detects RN project and analyzes architecture
5. **📊 Report Generation**: Creates beautiful HTML report with all findings
6. **🌐 Auto-Open**: Automatically opens report in your default browser

### Sample Output
```
🔍 React Native Inspect - Starting Analysis...
✓ All dependencies are up to date!
⚠ Security audit found 3 vulnerabilities (0 critical, 1 high)
✓ React Native New Architecture is enabled
✓ Report generated: /path/to/react-native-inspect-report.html
✓ Report opened in browser
✅ React Native Inspect completed successfully!
```

## 🏗️ Project Structure

```
src/
├── cli/                          # CLI interface and commands
│   ├── commands/                 # Command implementations
│   │   ├── analyze.ts           # Project analysis orchestration
│   │   └── report.ts            # Report generation and browser opening
│   └── index.ts                 # CLI entry point and workflow
├── core/                         # Core business logic
│   ├── analyzers/               # Analysis modules
│   │   ├── dependencies/        # Dependency and security analysis
│   │   ├── react-native/        # RN-specific analysis and architecture detection
│   │   └── security/            # Vulnerability scanning and audit
│   ├── report/                  # Report generation system
│   │   ├── generators/html/     # Modern HTML report generator
│   │   └── templates/           # HTML, CSS, and JS templates
│   │       ├── web/             # HTML template with drawer design
│   │       ├── styles/          # Modern CSS with responsive design
│   │       └── js/              # Interactive JavaScript features
│   └── project/                 # Project detection and parsing
├── utils/                       # Shared utilities
│   ├── logger.ts               # Enhanced logging with colors
│   └── spinner.ts              # Progress indicators and status
├── types/                       # TypeScript type definitions
└── tests/                      # Test suites
```

## 🗺️ Roadmap

### ✅ Completed
- [x] Advanced package.json analysis with detailed outdated package detection
- [x] Comprehensive security audit integration with severity categorization
- [x] Modern HTML report generation with drawer-based navigation
- [x] React Native version compatibility and New Architecture analysis
- [x] Responsive design with mobile-first approach
- [x] Interactive tables with sorting and external links
- [x] Keyboard navigation and accessibility features
- [x] Auto-browser opening and cross-platform support

### 🚧 In Progress
- [ ] Packages replacement recommendation for better options
- [ ] Peer dependency analysis and compatibility checking
- [ ] Performance recommendations based on bundle analysis
- [ ] Migration guides and helpful documentation links
- [ ] JSON and Markdown report formats
- [ ] CI/CD integration and automated reporting

### 🔮 Planned
- [ ] Custom report themes and branding options
- [ ] Plugin system for custom analyzers
- [ ] Historical analysis and trend tracking
- [ ] Team collaboration features
- [ ] Integration with popular development tools

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

## 🤝 Contributing

We welcome contributions! Whether it's bug reports, feature requests, or code contributions, please check out our [contributing guidelines](docs/contributing.md) and feel free to submit pull requests.

## 📄 License

MIT License - see [LICENSE](LICENCE) file for details.

---

<div align="center">
<strong>Built with ❤️ for the React Native community</strong>
<br><br>
<a href="https://github.com/whitestranger7/react-native-inspect/issues">🐛 Report Bug</a> •
<a href="https://github.com/whitestranger7/react-native-inspect/issues">✨ Request Feature</a> •
<a href="#contributing">🤝 Contribute</a>
</div>
