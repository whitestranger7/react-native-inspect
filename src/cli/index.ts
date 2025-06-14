import { analyzeCommand } from './commands/analyze';
import { reportCommand, openReport } from './commands/report';
import { Logger } from '../utils/logger';

export const runCLI = async (): Promise<void> => {
  try {
    const analysisResult = await analyzeCommand();
    
    const reportPath = await reportCommand(analysisResult);
    await openReport(reportPath);
    
    Logger.completion('React Native Inspect completed successfully!');
  } catch (error) {
    Logger.error('CLI execution failed:', error as Error);
    process.exit(1);
  }
} 