import { readFile, access } from 'fs/promises';
import { join } from 'path';

import type { PackageJson } from '../types/project';

export const readPackageJson = async (projectPath: string): Promise<PackageJson> => {
  const pkgPath = join(projectPath, 'package.json');
  const content = await readFile(pkgPath, 'utf8');
  return JSON.parse(content);
}

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
} 