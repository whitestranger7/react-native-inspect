# Basic Usage Examples

## CLI Usage

### Analyze Current Directory

```bash
react-native-inspect
```

### Analyze Specific Project

```bash
react-native-inspect /path/to/react-native-project
```

### Generate Different Report Formats

```bash
# HTML report (default)
react-native-inspect --format html

# JSON report (coming soon)
react-native-inspect --format json

# Markdown report (coming soon)
react-native-inspect --format markdown
```

## Programmatic Usage

### Basic Analysis

```typescript
import { runCLI } from 'react-native-inspect';

// Run full analysis
await runCLI();
```

### Custom Analysis

```typescript
import { analyzeCommand } from 'react-native-inspect/cli/commands';
import { reportCommand } from 'react-native-inspect/cli/commands';

// Run analysis only
const result = await analyzeCommand('/path/to/project');

// Generate custom report
const reportPath = await reportCommand(result, {
  format: 'html',
  outputPath: './custom-report.html'
});
```

### Individual Analyzers

```typescript
import { analyzeDependencies } from 'react-native-inspect/core/analyzers/dependencies';

// Analyze dependencies only
const depResult = await analyzeDependencies('/path/to/project');
console.log(`Found ${Object.keys(depResult.outdatedDependencies).length} outdated packages`);
``` 