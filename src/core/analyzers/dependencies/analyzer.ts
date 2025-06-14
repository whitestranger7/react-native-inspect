import { detectPackageManager } from '../../../utils/npm';
import { checkOutdatedDependencies } from './outdated';
import { runSecurityAudit } from './audit';
import type { DependencyAnalysisResult, PackageManager } from '../../../types/analysis';

export async function analyzeDependencies(projectPath: string): Promise<DependencyAnalysisResult> {
  const packageManager = await detectPackageManager(projectPath);
  
  const outdatedResult = await checkOutdatedDependencies(projectPath, packageManager);
  
  const auditReport = await runSecurityAudit(packageManager, projectPath);
  
  return {
    packageManager,
    ...outdatedResult,
    auditReport
  };
} 