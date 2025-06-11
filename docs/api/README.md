# API Documentation

## Core Analyzers

### Dependencies Analyzer

```typescript
import { analyzeDependencies } from '../src/core/analyzers/dependencies';

const result = await analyzeDependencies('/path/to/project');
```

### Security Analyzer

```typescript
import { runSecurityAudit } from '../src/core/analyzers/dependencies/audit';

const auditReport = await runSecurityAudit('npm');
```

## Report Generators

### HTML Report

```typescript
import { generateHTMLReport } from '../src/core/report/generators/html/generator';

const reportPath = await generateHTMLReport(analysisResult, {
  format: 'html',
  outputPath: './custom-report.html'
});
```

## Utilities

### Package Manager Detection

```typescript
import { detectPackageManager } from '../src/utils/npm';

const manager = await detectPackageManager('/path/to/project');
```

### File System Utilities

```typescript
import { readPackageJson } from '../src/utils/fs';

const packageJson = await readPackageJson('/path/to/project');
``` 