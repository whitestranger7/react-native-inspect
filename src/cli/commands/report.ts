import { exec } from 'child_process';
import { generateHTMLReport } from '../../core/report/generators/html/generator';
import { Logger } from '../../utils/logger';
import { SpinnerManager } from '../../utils/spinner';
import type { AnalysisResult } from '../../types/analysis';
import type { ReportConfig } from '../../types/report';

export async function reportCommand(
  analysisResult: AnalysisResult, 
  config: ReportConfig = { format: 'html' }
): Promise<string> {
  try {
    SpinnerManager.start('Generating report...');
    
    let reportPath: string;
    
    switch (config.format) {
      case 'html':
        reportPath = await generateHTMLReport(analysisResult, config);
        break;
      case 'json':
        // TODO: Implement JSON report generator
        throw new Error('JSON report format not yet implemented');
      case 'markdown':
        // TODO: Implement Markdown report generator  
        throw new Error('Markdown report format not yet implemented');
      default:
        throw new Error(`Unsupported report format: ${config.format}`);
    }

    SpinnerManager.succeed(`Report generated: ${reportPath}`);
    
    return reportPath;
  } catch (error) {
    SpinnerManager.fail('Failed to generate report');
    Logger.error('Report generation error:', error as Error);
    throw error;
  }
}

export async function openReport(reportPath: string): Promise<void> {
  SpinnerManager.start('Opening report in browser...');
  
  try {
    const openCommand = process.platform === 'darwin' ? `open "${reportPath}"` 
                      : process.platform === 'win32' ? `start "" "${reportPath}"` 
                      : `xdg-open "${reportPath}"`;
    
    await new Promise<void>((resolve) => {
      let resolved = false;
      
      exec(openCommand, (error) => {
        if (resolved) return;
        resolved = true;
        
        if (error) {
          SpinnerManager.warn('Could not open browser automatically');
          Logger.info(`Please open the report manually: ${reportPath}`);
        } else {
          SpinnerManager.succeed('Report opened in browser');
        }
        resolve();
      });
      
      // Fallback timeout to prevent hanging
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        SpinnerManager.succeed('Report opened in browser');
        resolve();
      }, 1000);
    });
    
  } catch (browserError) {
    SpinnerManager.warn('Could not open browser automatically');
    Logger.info(`Please open the report manually: ${reportPath}`);
  }
} 