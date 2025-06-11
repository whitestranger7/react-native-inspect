export type PackageManager = "npm" | "yarn" | "pnpm" | null;

export type OutdatedDependencyInfo = {
  current: string
  wanted: string
  latest: string
  location: string
  type?: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'
}

export type VulnerabilitySeverity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

export type Vulnerability = {
  id: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  url: string;
  packageName: string;
  patchedIn?: string;
  dependencyOf?: string;
  path?: string;
  findings?: {
    version: string;
    paths: string[];
  }[];
};

export type AuditReport = {
  auditReportVersion: number;
  vulnerabilities: Record<string, Vulnerability>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
};

export interface DependencyAnalysisResult {
  packageManager: PackageManager;
  totalDependencies: number;
  totalDevDependencies: number;
  outdatedDependencies: Record<string, OutdatedDependencyInfo>;
  majorUpdatesCount: number;
  isAllUpToDate: boolean;
  auditReport?: AuditReport | null;
}

export interface ReactNativeAnalysisResult {
  isReactNativeProject: boolean;
  reactNativeVersion?: string;
  newArchitectureStatus: 'enabled' | 'disabled' | 'unknown' | 'not-applicable';
  recommendations: string[];
}

export interface AnalysisResult {
  dependencies: DependencyAnalysisResult;
  reactNative: ReactNativeAnalysisResult;
  timestamp: string;
  projectPath: string;
} 