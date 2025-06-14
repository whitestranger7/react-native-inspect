import { readPackageJson } from '../../../utils/fs';
import { getOutdatedPackages } from '../../../utils/npm';

import type { 
  OutdatedDependencyInfo, 
  PackageManager, 
  DependencyAnalysisResult 
} from '../../../types/analysis';

export const checkOutdatedDependencies = async (
  projectPath: string, 
  packageManager: PackageManager
): Promise<Omit<DependencyAnalysisResult, 'packageManager'>> => {
  try {
    const pkg = await readPackageJson(projectPath);

    const totalDependencies = Object.keys(pkg.dependencies || {}).length;
    const totalDevDependencies = Object.keys(pkg.devDependencies || {}).length;

    const outdated = await getOutdatedPackages(packageManager, projectPath);

    if (!outdated || Object.keys(outdated).length === 0) {
      return {
        totalDependencies,
        totalDevDependencies,
        outdatedDependencies: {},
        majorUpdatesCount: 0,
        isAllUpToDate: true
      };
    }

    let majorUpdatesCount = 0;

    for (const [name, info] of Object.entries(outdated) as [string, OutdatedDependencyInfo][]) {
      if (pkg.dependencies && pkg.dependencies[name]) {
        info.type = 'dependencies';
      } else if (pkg.devDependencies && pkg.devDependencies[name]) {
        info.type = 'devDependencies';
      } else if (pkg.peerDependencies && pkg.peerDependencies[name]) {
        info.type = 'peerDependencies';
      } else if (pkg.optionalDependencies && pkg.optionalDependencies[name]) {
        info.type = 'optionalDependencies';
      }

      const currentMajor = Number(info.current.split('.')[0]);
      const latestMajor = Number(info.latest.split('.')[0]);
      if (latestMajor > currentMajor) {
        majorUpdatesCount++;
      }
    }

    return {
      totalDependencies,
      totalDevDependencies,
      outdatedDependencies: outdated,
      majorUpdatesCount,
      isAllUpToDate: false
    };
  } catch (error) {
    throw new Error(`Failed to analyze dependencies: ${error}`);
  }
} 