import { readFile } from 'fs/promises';
import { join } from 'path';

export async function checkIOSNewArch(projectPath: string): Promise<boolean> {
  try {
    const podfilePath = join(projectPath, 'ios', 'Podfile');
    
    try {
      const podfileContent = await readFile(podfilePath, 'utf8');
      return /RCT_NEW_ARCH_ENABLED.*=.*1|RCT_NEW_ARCH_ENABLED.*=.*true/i.test(podfileContent);
    } catch {
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

export async function checkIOSHermesEnabled(projectPath: string): Promise<boolean> {
  try {
    const podfilePath = join(projectPath, 'ios', 'Podfile');
    
    try {
      const podfileContent = await readFile(podfilePath, 'utf8');
      const hermesInPodfile = /:hermes_enabled\s*=>\s*true/i.test(podfileContent);
      if (hermesInPodfile) return true;
    } catch {}

    try {
      const xcodeEnvPath = join(projectPath, 'ios', '.xcode.env');
      const xcodeEnvContent = await readFile(xcodeEnvPath, 'utf8');
      return /USE_HERMES.*=.*1|USE_HERMES.*=.*true/i.test(xcodeEnvContent);
    } catch {
      return false;
    }
  } catch {
    return false;
  }
} 