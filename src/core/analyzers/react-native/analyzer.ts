import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ReactNativeAnalysisResult } from '../../../types/analysis';
import { checkAndroidNewArch, checkAndroidHermesEnabled } from './android/analyzer';
import { checkIOSNewArch, checkIOSHermesEnabled } from './ios/analyzer';

export const analyzeReactNative = async (projectPath: string): Promise<ReactNativeAnalysisResult> => {
  try {
    const reactNativeVersion = await getReactNativeVersion(projectPath);
    
    if (!reactNativeVersion) {
      return {
        isReactNativeProject: false,
        newArchitectureStatus: 'not-applicable',
        recommendations: []
      };
    }

    const newArchitectureStatus = await checkNewArchitectureStatus(projectPath);
    
    const recommendations = generateRecommendations(newArchitectureStatus, reactNativeVersion);

    return {
      isReactNativeProject: true,
      reactNativeVersion,
      newArchitectureStatus,
      recommendations
    };
  } catch (error) {
    console.warn('Error analyzing React Native project:', error);
    return {
      isReactNativeProject: false,
      newArchitectureStatus: 'unknown',
      recommendations: []
    };
  }
}

const getReactNativeVersion = async (projectPath: string): Promise<string | null> => {
  try {
    const packageJsonPath = join(projectPath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    return packageJson.dependencies?.['react-native'] || packageJson.devDependencies?.['react-native'];
  } catch {
    return null;
  }
}

const checkNewArchitectureStatus = async (projectPath: string): Promise<'enabled' | 'disabled' | 'unknown'> => {
  try {
    const checks = await Promise.allSettled([
      checkAndroidNewArch(projectPath),
      checkIOSNewArch(projectPath),
      checkReactNativeConfig(projectPath)
    ]);

    const results = checks
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<boolean>).value);

    if (results.some(enabled => enabled)) {
      return 'enabled';
    }

    if (results.length > 0) {
      return 'disabled';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

const checkReactNativeConfig = async (projectPath: string): Promise<boolean> => {
  try {
    const configPath = join(projectPath, 'react-native.config.js');
    const configContent = await readFile(configPath, 'utf8');
    
    return /newArchEnabled.*:.*true/i.test(configContent);
  } catch {
    return false;
  }
}

const generateRecommendations = (
  newArchStatus: 'enabled' | 'disabled' | 'unknown',
  reactNativeVersion?: string
): string[] => {
  const recommendations: string[] = [];

  if (newArchStatus === 'disabled') {
    recommendations.push(
      'Consider enabling the React Native New Architecture (Fabric + TurboModules) for better performance',
      'Update your android/gradle.properties to include "newArchEnabled=true"',
      'Update your ios/.xcode.env or Podfile to include "RCT_NEW_ARCH_ENABLED=1"',
      'Test your app thoroughly after enabling the new architecture as some libraries may not be compatible yet'
    );
  }

  if (newArchStatus === 'enabled') {
    recommendations.push(
      'Great! You have the New Architecture enabled',
      'Make sure all your libraries support the New Architecture',
      'Consider using TurboModules for better native module performance'
    );
  }

  if (reactNativeVersion) {
    const version = extractVersionNumber(reactNativeVersion);
    if (version && version < 0.72) {
      recommendations.push(
        'Consider upgrading to React Native 0.72+ for better New Architecture support and stability'
      );
    }
  }

  if (newArchStatus === 'unknown') {
    recommendations.push(
      'Could not determine New Architecture status',
      'Manually check your android/gradle.properties and ios configuration files',
      'Consider enabling the New Architecture for better performance if not already enabled'
    );
  }

  return recommendations;
}

const extractVersionNumber = (versionString: string): number | null => {
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const [, major, minor] = match;
    return parseFloat(`${major}.${minor}`);
  }
  return null;
} 