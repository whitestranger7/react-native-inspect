export interface ReportConfig {
  format: 'html' | 'json' | 'markdown';
  outputPath?: string;
  template?: string;
  includeDetails?: boolean;
} 