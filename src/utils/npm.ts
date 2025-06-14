import { spawn } from 'bun';
import { join } from 'path';
import { existsSync, statSync } from 'fs';

import type { PackageManager } from '../types/analysis';

export const detectPackageManager = async (projectRoot: string): Promise<PackageManager> => {
  const lockFiles = {
    npm: "package-lock.json",
    yarn: "yarn.lock", 
    pnpm: "pnpm-lock.yaml",
  };

  const candidates = Object.entries(lockFiles)
    .map(([manager, file]) => {
      const fullPath = join(projectRoot, file);
      if (existsSync(fullPath)) {
        return {
          manager: manager as PackageManager,
          mtime: statSync(fullPath).mtimeMs,
        };
      }
      return null;
    })
    .filter(Boolean) as { manager: PackageManager; mtime: number }[];

  if (candidates.length === 0) return null;

  // Prefer most recently updated lockfile
  candidates.sort((a, b) => b.mtime - a.mtime);
  return candidates[0]?.manager || null;
}

export const runNpmCommand = async (
  command: string[], 
  manager: PackageManager = 'npm', 
  cwd: string = process.cwd()
): Promise<string> => {
  const managerCommand = manager || 'npm';
  
  try {
    const child = spawn([managerCommand, ...command], {
      stdout: 'pipe',
      stderr: 'pipe',
      cwd,
    });

    const stdout = await new Response(child.stdout).text();
    const stderr = await new Response(child.stderr).text();

    // For audit and outdated commands, we want to return stdout even if exit code is non-zero
    // because vulnerabilities/outdated packages being found is expected behavior
    const isAuditCommand = command.includes('audit');
    const isOutdatedCommand = command.includes('outdated');
    
    if (child.exitCode !== 0) {
      if ((isAuditCommand || isOutdatedCommand) && stdout.trim()) {
        // For audit/outdated commands, return the output even with non-zero exit code
        return stdout.trim();
      }
      throw new Error(`Command failed: ${managerCommand} ${command.join(' ')}\nWorking directory: ${cwd}\nExit code: ${child.exitCode}\nStderr: ${stderr}\nStdout: ${stdout}`);
    }

    return stdout.trim();
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error(`Package manager '${managerCommand}' not found. Please ensure ${managerCommand} is installed and available in your PATH.`);
    }
    throw error;
  }
}

export const getOutdatedPackages = async (
  manager: PackageManager = 'npm', 
  projectPath: string = process.cwd()
): Promise<Record<string, any>> => {
  try {
    const stdout = await runNpmCommand(['outdated', '--json'], manager, projectPath);
    
    if (!stdout) return {};
    
    // Handle different package manager formats
    if (manager === 'yarn') {
      // Yarn returns multiple JSON objects, one per line
      // We need to find the "table" type which contains the outdated packages
      const lines = stdout.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'table' && parsed.data && parsed.data.body) {
            // Convert yarn's table format to npm-like format
            const result: Record<string, any> = {};
            
            for (const row of parsed.data.body) {
              const [packageName, current, wanted, latest, packageType] = row;
              result[packageName] = {
                current,
                wanted,
                latest,
                location: packageName,
                type: packageType === 'dependencies' ? 'dependencies' : 
                      packageType === 'devDependencies' ? 'devDependencies' :
                      packageType === 'peerDependencies' ? 'peerDependencies' :
                      packageType === 'optionalDependencies' ? 'optionalDependencies' :
                      'dependencies' // default fallback
              };
            }
            
            return result;
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }
      
      return {}; // No table found
    } else {
      // npm and pnpm return a single JSON object
      return JSON.parse(stdout);
    }
  } catch (error) {
    // npm/yarn outdated returns non-zero exit code when there are outdated packages
    if (error instanceof Error && error.message.includes('outdated')) {
      const match = error.message.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
    return {};
  }
}

export const runAudit = async (
  manager: PackageManager = 'npm', 
  projectPath: string = process.cwd()
): Promise<any> => {
  try {
    const stdout = await runNpmCommand(['audit', '--json'], manager, projectPath);
    
    if (!stdout) return null;
    
    // Handle different package manager formats
    if (manager === 'yarn') {
      // Yarn returns multiple JSON objects, one per line
      // We need to parse each line and build the audit report
      const lines = stdout.split('\n').filter(line => line.trim());
      
      const auditData: any = {
        vulnerabilities: {},
        metadata: {
          vulnerabilities: {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
            info: 0
          }
        }
      };
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.type === 'auditAdvisory' && parsed.data) {
            const advisory = parsed.data.advisory;
            const resolution = parsed.data.resolution;
            
            // Add to vulnerabilities
            auditData.vulnerabilities[advisory.id] = {
              ...advisory,
              effects: [resolution.path],
              range: advisory.vulnerable_versions
            };
            
            // Update metadata counts
            auditData.metadata.vulnerabilities.total++;
            if (advisory.severity === 'critical') auditData.metadata.vulnerabilities.critical++;
            else if (advisory.severity === 'high') auditData.metadata.vulnerabilities.high++;
            else if (advisory.severity === 'moderate') auditData.metadata.vulnerabilities.moderate++;
            else if (advisory.severity === 'low') auditData.metadata.vulnerabilities.low++;
            else if (advisory.severity === 'info') auditData.metadata.vulnerabilities.info++;
          } else if (parsed.type === 'auditSummary' && parsed.data) {
            // Use the summary data if available, but ensure total is correct
            const summaryVulns = parsed.data.vulnerabilities;
            auditData.metadata.vulnerabilities = {
              ...summaryVulns,
              // Recalculate total to ensure it's correct
              total: (summaryVulns.critical || 0) + (summaryVulns.high || 0) + 
                     (summaryVulns.moderate || 0) + (summaryVulns.low || 0) + 
                     (summaryVulns.info || 0)
            };
          }
        } catch (parseError) {
          continue;
        }
      }
      
      return auditData;
    } else {
      return JSON.parse(stdout);
    }
  } catch (error) {
    if (error instanceof Error) {
      const errorText = error.message;
      
      if (errorText.includes('ENOLOCK') || 
          errorText.includes('requires existing lockfile') ||
          errorText.includes('requires existing shrinkwrap file') ||
          errorText.includes('No lockfile found') ||
          errorText.includes('command not found') ||
          errorText.includes('ENOENT')) {
        return null;
      }
    }
    
    throw error;
  }
} 