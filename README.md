# React Native Inspect

A powerful CLI tool for analyzing React Native projects, generating comprehensive reports with recommendations and analysis.

## Features

- 📦 **Dependency Analysis**: Check for outdated packages and available updates
- 🔒 **Security Audit**: Scan for vulnerabilities in your dependencies
- 📊 **HTML Reports**: Generate beautiful, detailed reports with recommendations
- 🚀 **React Native Specific**: Tailored analysis for React Native projects
- 🔧 **Multiple Package Managers**: Support for npm, yarn, and pnpm

## Installation

```bash
# Install globally
npm install -g react-native-inspect

# Or run directly with npx
npx react-native-inspect
```

## Usage

```bash
# Analyze current directory
react-native-inspect

# Analyze specific project
react-native-inspect /path/to/project
```

## Project Structure

```
src/
├── cli/                          # CLI-specific logic
│   ├── commands/                 # Command handlers
│   └── options/                  # CLI option definitions
├── core/                         # Core business logic
│   ├── analyzers/               # Analysis modules
│   │   ├── dependencies/        # Dependency analysis
│   │   ├── react-native/        # RN-specific analysis
│   │   └── security/            # Security analysis
│   ├── report/                  # Report generation
│   └── project/                 # Project detection & parsing
├── utils/                       # Shared utilities
├── types/                       # TypeScript type definitions
└── templates/                   # Static templates & assets
```

## Roadmap

- [x] Package.json analysis with outdated package detection
- [x] Security audit integration
- [x] HTML report generation
- [x] React Native version compatibility analysis
- [ ] Peer dependency analysis
- [ ] Performance recommendations
- [ ] Migration guides and helpful links
- [ ] JSON and Markdown report formats
- [ ] CI/CD integration

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run src/index.ts

# Build
bun run build
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.
