import { readFile, access } from 'fs/promises';
import { join } from 'path';
import type { ReactNativeAnalysisResult } from '../../../types/analysis';

export async function analyzeReactNative(projectPath: string): Promise<ReactNativeAnalysisResult> {
  try {
    // Check if this is a React Native project
    const isReactNativeProject = await checkIsReactNativeProject(projectPath);
    
    if (!isReactNativeProject) {
      return {
        isReactNativeProject: false,
        newArchitectureStatus: 'not-applicable',
        recommendations: []
      };
    }

    // Check for new architecture (Fabric/TurboModules)
    const newArchitectureStatus = await checkNewArchitectureStatus(projectPath);
    
    // Get React Native version
    const reactNativeVersion = await getReactNativeVersion(projectPath);
    
    // Generate recommendations
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

async function checkIsReactNativeProject(projectPath: string): Promise<boolean> {
  try {
    const packageJsonPath = join(projectPath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check if react-native is in dependencies
    return !!(packageJson.dependencies?.['react-native'] || packageJson.devDependencies?.['react-native']);
  } catch {
    return false;
  }
}

async function getReactNativeVersion(projectPath: string): Promise<string | undefined> {
  try {
    const packageJsonPath = join(projectPath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    return packageJson.dependencies?.['react-native'] || packageJson.devDependencies?.['react-native'];
  } catch {
    return undefined;
  }
}

async function checkNewArchitectureStatus(projectPath: string): Promise<'enabled' | 'disabled' | 'unknown'> {
  try {
    // Check multiple indicators for new architecture
    const checks = await Promise.allSettled([
      checkAndroidNewArch(projectPath),
      checkIOSNewArch(projectPath),
      checkReactNativeConfig(projectPath)
    ]);

    // If any check indicates new arch is enabled, consider it enabled
    const results = checks
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<boolean>).value);

    if (results.some(enabled => enabled)) {
      return 'enabled';
    }

    // If we have at least one successful check and none enabled, it's disabled
    if (results.length > 0) {
      return 'disabled';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function checkAndroidNewArch(projectPath: string): Promise<boolean> {
  try {
    // Check gradle.properties for new architecture flags
    const gradlePropsPath = join(projectPath, 'android', 'gradle.properties');
    const gradleContent = await readFile(gradlePropsPath, 'utf8');
    
    // Look for new architecture flags
    const fabricEnabled = /newArchEnabled=true/i.test(gradleContent);
    const turboModulesEnabled = /hermesEnabled=true/i.test(gradleContent);
    
    return fabricEnabled || turboModulesEnabled;
  } catch {
    return false;
  }
}

async function checkIOSNewArch(projectPath: string): Promise<boolean> {
  try {
    // Check for RCT_NEW_ARCH_ENABLED in iOS project
    const podfilePath = join(projectPath, 'ios', 'Podfile');
    
    try {
      const podfileContent = await readFile(podfilePath, 'utf8');
      return /RCT_NEW_ARCH_ENABLED.*=.*1|RCT_NEW_ARCH_ENABLED.*=.*true/i.test(podfileContent);
    } catch {
      // If no Podfile, check for .xcode.env files
      const xcodeEnvPath = join(projectPath, 'ios', '.xcode.env');
      try {
        const xcodeEnvContent = await readFile(xcodeEnvPath, 'utf8');
        return /RCT_NEW_ARCH_ENABLED.*=.*1|RCT_NEW_ARCH_ENABLED.*=.*true/i.test(xcodeEnvContent);
      } catch {
        return false;
      }
    }
  } catch {
    return false;
  }
}

async function checkReactNativeConfig(projectPath: string): Promise<boolean> {
  try {
    // Check react-native.config.js for new architecture settings
    const configPath = join(projectPath, 'react-native.config.js');
    const configContent = await readFile(configPath, 'utf8');
    
    return /newArchEnabled.*:.*true/i.test(configContent);
  } catch {
    return false;
  }
}

function generateRecommendations(
  newArchStatus: 'enabled' | 'disabled' | 'unknown',
  reactNativeVersion?: string
): string[] {
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

function extractVersionNumber(versionString: string): number | null {
  // Extract version number from strings like "^0.72.0" or "~0.71.8"
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const [, major, minor] = match;
    return parseFloat(`${major}.${minor}`);
  }
  return null;
} 