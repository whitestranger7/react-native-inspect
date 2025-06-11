import { analyzeDependencies } from '../../core/analyzers/dependencies';
import { analyzeReactNative } from '../../core/analyzers/react-native';
import { Logger } from '../../utils/logger';
import { SpinnerManager } from '../../utils/spinner';
import type { AnalysisResult } from '../../types/analysis';

export async function analyzeCommand(projectPath: string = process.cwd()): Promise<AnalysisResult> {
  try {
    Logger.title('React Native Inspect - Starting Analysis...');
    
    // Package manager detection and dependency analysis
    SpinnerManager.start('Detecting package manager and analyzing dependencies...');
    const dependencyResult = await analyzeDependencies(projectPath);
    
    const outdatedCount = Object.keys(dependencyResult.outdatedDependencies).length;
    if (dependencyResult.isAllUpToDate) {
      SpinnerManager.succeed('All dependencies are up to date!');
    } else {
      SpinnerManager.warn(`Found ${outdatedCount} outdated dependencies (${dependencyResult.majorUpdatesCount} major updates)`);
    }

    // Security audit summary
    if (dependencyResult.auditReport) {
      const totalVulns = dependencyResult.auditReport.metadata.vulnerabilities.total;
      const criticalCount = dependencyResult.auditReport.metadata.vulnerabilities.critical;
      const highCount = dependencyResult.auditReport.metadata.vulnerabilities.high;
      
      if (totalVulns > 0) {
        if (criticalCount > 0 || highCount > 0) {
          Logger.warn(`Security audit found ${totalVulns} vulnerabilities (${criticalCount} critical, ${highCount} high)`);
        } else {
          Logger.warn(`Security audit found ${totalVulns} vulnerabilities`);
        }
      } else {
        Logger.success('Security audit completed - no vulnerabilities found');
      }
    } else {
      Logger.info('Security audit skipped (no lockfile found)');
    }

    // React Native analysis
    SpinnerManager.start('Analyzing React Native project configuration...');
    const reactNativeResult = await analyzeReactNative(projectPath);
    
    if (reactNativeResult.isReactNativeProject) {
      if (reactNativeResult.newArchitectureStatus === 'enabled') {
        SpinnerManager.succeed('React Native New Architecture is enabled');
      } else if (reactNativeResult.newArchitectureStatus === 'disabled') {
        SpinnerManager.warn('React Native New Architecture is not enabled - consider enabling for better performance');
      } else {
        SpinnerManager.stopAll();
        Logger.info('Could not determine React Native New Architecture status');
      }
    } else {
      SpinnerManager.stopAll();
      Logger.info('Not a React Native project - skipping React Native analysis');
    }

    const result: AnalysisResult = {
      dependencies: dependencyResult,
      reactNative: reactNativeResult,
      timestamp: new Date().toISOString(),
      projectPath
    };

    return result;
  } catch (error) {
    SpinnerManager.stopAll();
    Logger.error('Error during analysis:', error as Error);
    throw error;
  }
} 