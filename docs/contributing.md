# Contributing to React Native Inspect

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/react-native-inspect.git
   cd react-native-inspect
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run in development mode**
   ```bash
   bun run dev
   ```

## Project Structure

The project follows a modular architecture:

- `src/cli/` - CLI-specific logic and commands
- `src/core/` - Core business logic (analyzers, report generators)
- `src/utils/` - Shared utilities
- `src/types/` - TypeScript type definitions
- `templates/` - Report templates and assets
- `tests/` - Test files
- `docs/` - Documentation

## Adding New Features

### Adding a New Analyzer

1. Create a new directory under `src/core/analyzers/`
2. Implement the analyzer interface
3. Add types to `src/types/analysis.ts`
4. Export from the main analyzers index
5. Add tests

Example:
```typescript
// src/core/analyzers/performance/index.ts
export async function analyzePerformance(projectPath: string): Promise<PerformanceAnalysisResult> {
  // Implementation
}
```

### Adding a New Report Format

1. Create a new directory under `src/core/report/generators/`
2. Implement the generator interface
3. Add to the report command switch statement
4. Add templates if needed

### Adding New CLI Commands

1. Create a new file under `src/cli/commands/`
2. Export from `src/cli/commands/index.ts`
3. Add to the CLI router

## Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

## Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Pull Request Guidelines

- Provide a clear description of the changes
- Include tests for new features
- Update documentation if needed
- Follow the existing code style
- Keep commits focused and atomic

## Roadmap Items

Current priority items for contribution:

- [ ] React Native version compatibility analyzer
- [ ] Peer dependency analysis
- [ ] JSON and Markdown report formats
- [ ] Performance recommendations
- [ ] CI/CD integration helpers
- [ ] Template system improvements

## Questions?

Feel free to open an issue for questions or discussions about contributing. 