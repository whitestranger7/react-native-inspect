import { detectPackageManager } from '../../../utils/npm';
import { checkOutdatedDependencies } from './outdated';
import { runSecurityAudit } from './audit';
import type { DependencyAnalysisResult, PackageManager } from '../../../types/analysis';

export async function analyzeDependencies(projectPath: string): Promise<DependencyAnalysisResult> {
  // Detect package manager
  const packageManager = await detectPackageManager(projectPath);
  
  // Check outdated dependencies
  const outdatedResult = await checkOutdatedDependencies(projectPath, packageManager);
  
  // Run security audit
  const auditReport = await runSecurityAudit(packageManager, projectPath);
  
  return {
    packageManager,
    ...outdatedResult,
    auditReport
  };
} 