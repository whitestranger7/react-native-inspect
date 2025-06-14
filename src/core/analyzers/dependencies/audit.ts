import { runAudit } from '../../../utils/npm';
import type { PackageManager, AuditReport } from '../../../types/analysis';

export async function runSecurityAudit(
  packageManager: PackageManager, 
  projectPath: string = process.cwd()
): Promise<AuditReport | null> {
  if (!packageManager) {
    console.warn('⚠️  No package manager detected, skipping security audit');
    return null;
  }

  try {
    return await runAudit(packageManager, projectPath);
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('ENOLOCK') || 
      error.message.includes('requires existing lockfile') ||
      error.message.includes('requires existing shrinkwrap file') ||
      error.message.includes('No lockfile found') ||
      error.message.includes('command not found') ||
      error.message.includes('ENOENT')
    )) {
      console.warn(`⚠️  Security audit skipped: ${packageManager} audit not available or no lockfile found`);
      return null;
    }
    
    if (packageManager === 'yarn' && error instanceof Error) {
      if (error.message.includes('Unknown option') || 
          error.message.includes('Invalid option') ||
          error.message.includes('audit is not a valid command')) {
        console.warn('⚠️  Yarn audit not supported in this version, skipping security audit');
        return null;
      }
    }
    
    throw new Error(`Security audit failed: ${error}`);
  }
} 
