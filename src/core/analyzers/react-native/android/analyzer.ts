import { readFile } from 'fs/promises';
import { join } from 'path';

export const checkAndroidNewArch = async (projectPath: string): Promise<boolean> => {
  try {
    const gradlePropsPath = join(projectPath, 'android', 'gradle.properties');
    const gradleContent = await readFile(gradlePropsPath, 'utf8');
    
    const newArchEnabled = /newArchEnabled=true/i.test(gradleContent);
    
    return newArchEnabled;
  } catch {
    return false;
  }
}

export const checkAndroidHermesEnabled = async (projectPath: string): Promise<boolean> => {
  try {
    const gradlePropsPath = join(projectPath, 'android', 'gradle.properties');
    const gradleContent = await readFile(gradlePropsPath, 'utf8');
    
    const hermesEnabled = /hermesEnabled=true/i.test(gradleContent);
    
    return hermesEnabled;
  } catch {
    return false;
  }
} 