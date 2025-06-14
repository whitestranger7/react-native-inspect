import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

import type { AnalysisResult } from '../../../../types/analysis';
import type { ReportConfig } from '../../../../types/report';

export const generateHTMLReport = async (
  analysisResult: AnalysisResult, 
  config: ReportConfig = { format: 'html' }
): Promise<string> => {
  const outputPath = config.outputPath || join(process.cwd(), 'react-native-inspect-report.html');
  
  const templateDir = join(__dirname, '../../templates');
  const htmlTemplatePath = join(templateDir, 'web', 'index.html');
  const cssSourcePath = join(templateDir, 'styles', 'report.css');
  const jsSourcePath = join(templateDir, 'js', 'report.js');
  
  const [htmlTemplate, cssContent, jsContent] = await Promise.all([
    readFile(htmlTemplatePath, 'utf8'),
    readFile(cssSourcePath, 'utf8'),
    readFile(jsSourcePath, 'utf8')
  ]);
  
  const dependenciesTableSection = generateDependenciesTableSection(analysisResult);
  const securityAuditSection = generateSecurityAuditSection(analysisResult);
  const reactNativeSection = generateReactNativeSection(analysisResult);
  const recommendations = generateRecommendations(analysisResult);
  
  const html = htmlTemplate
    .replaceAll('/* CSS_PLACEHOLDER */', cssContent)
    .replaceAll('{{INLINED_JS}}', jsContent)
    .replaceAll('{{GENERATED_DATE}}', new Date(analysisResult.timestamp).toLocaleString())
    .replaceAll('{{PROJECT_PATH}}', analysisResult.projectPath)
    .replaceAll('{{PACKAGE_MANAGER}}', analysisResult.dependencies.packageManager || 'Not detected')
    .replaceAll('{{TOTAL_DEPENDENCIES}}', analysisResult.dependencies.totalDependencies.toString())
    .replaceAll('{{TOTAL_DEV_DEPENDENCIES}}', analysisResult.dependencies.totalDevDependencies.toString())
    .replaceAll('{{OUTDATED_COUNT}}', Object.keys(analysisResult.dependencies.outdatedDependencies).length.toString())
    .replaceAll('{{OUTDATED_BADGE_CLASS}}', Object.keys(analysisResult.dependencies.outdatedDependencies).length > 0 ? 'warning' : 'success')
    .replaceAll('{{MAJOR_UPDATES_COUNT}}', analysisResult.dependencies.majorUpdatesCount.toString())
    .replaceAll('{{MAJOR_UPDATES_BADGE_CLASS}}', analysisResult.dependencies.majorUpdatesCount > 0 ? 'danger' : 'success')
    .replaceAll('{{TOTAL_VULNERABILITIES}}', getTotalVulnerabilities(analysisResult).toString())
    .replaceAll('{{SECURITY_BADGE_CLASS}}', getSecurityBadgeClass(analysisResult))
    .replaceAll('{{DEPENDENCIES_TABLE_SECTION}}', dependenciesTableSection)
    .replaceAll('{{SECURITY_AUDIT_SECTION}}', securityAuditSection)
    .replaceAll('{{REACT_NATIVE_SECTION}}', reactNativeSection)
    .replaceAll('{{RN_ARCHITECTURE_BADGE_CLASS}}', getReactNativeArchitectureBadgeClass(analysisResult))
    .replaceAll('{{RN_ARCHITECTURE_STATUS}}', getReactNativeArchitectureStatus(analysisResult))
    .replaceAll('{{DEPENDENCIES_STATUS_BADGE_CLASS}}', analysisResult.dependencies.isAllUpToDate ? 'success' : 'warning')
    .replaceAll('{{DEPENDENCIES_STATUS_ICON}}', analysisResult.dependencies.isAllUpToDate ? '✅' : '⚠️')
    .replaceAll('{{SECURITY_STATUS_BADGE_CLASS}}', getSecurityStatusBadgeClass(analysisResult))
    .replaceAll('{{SECURITY_STATUS_ICON}}', getSecurityStatusIcon(analysisResult))
    .replaceAll('{{RECOMMENDATIONS}}', recommendations);
  
  await writeFile(outputPath, html, 'utf8');
  return outputPath;
}

const generateDependenciesTableSection = (analysisResult: AnalysisResult): string => {
  if (Object.keys(analysisResult.dependencies.outdatedDependencies).length === 0) {
    return `
      <div class="success-message">
          <span class="icon">✅</span>
          All dependencies are up to date!
      </div>
    `;
  }
  
  const tableRows = Object.entries(analysisResult.dependencies.outdatedDependencies)
    .map(([name, info]: [string, any]) => {
      const currentMajor = parseInt(info.current?.split('.')[0] || '0');
      const latestMajor = parseInt(info.latest?.split('.')[0] || '0');
      const isMajorUpdate = latestMajor > currentMajor;
      const updateType = isMajorUpdate ? 'Major' : 'Minor/Patch';
      const updateClass = isMajorUpdate ? 'danger' : 'warning';
      
      return `
        <tr>
            <td><a href="https://www.npmjs.com/package/${encodeURIComponent(name)}?activeTab=versions" target="_blank" rel="noopener noreferrer" class="package-link"><strong>${name}</strong></a></td>
            <td><span class="badge ${info.type || 'dependencies'}">${info.type || 'dependencies'}</span></td>
            <td><span class="version current">${info.current || 'Unknown'}</span></td>
            <td>
                <span class="version current">${info.current || 'Unknown'}</span>
                <span class="arrow">→</span>
                <span class="version latest">${info.latest || 'Unknown'}</span>
            </td>
            <td><span class="badge ${updateClass}">${updateType}</span></td>
        </tr>
      `;
    }).join('');
  
  return `
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Package</th>
                    <th>Type</th>
                    <th>Current Version</th>
                    <th>Latest Version</th>
                    <th>Update Type</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
  `;
}

const generateSecurityAuditSection = (analysisResult: AnalysisResult): string => {
  if (!analysisResult.dependencies.auditReport) {
    return `
      <div class="success-message">
          <span class="icon">ℹ️</span>
          Security audit was skipped (no lockfile found or audit not available)
      </div>
    `;
  }
  
  const auditReport = analysisResult.dependencies.auditReport;
  const vulnerabilities = auditReport.metadata?.vulnerabilities || {};
  
  const totalVulnerabilities = getTotalVulnerabilities(analysisResult);
  
  const statsGrid = `
    <div class="stats-grid">
        <div class="stat-card ${totalVulnerabilities === 0 ? 'success' : 'danger'}">
            <span class="stat-number">${totalVulnerabilities}</span>
            <div class="stat-label">Total Vulnerabilities</div>
        </div>
        <div class="stat-card ${(vulnerabilities.critical || 0) === 0 ? 'success' : 'danger'}">
            <span class="stat-number">${vulnerabilities.critical || 0}</span>
            <div class="stat-label">Critical</div>
        </div>
        <div class="stat-card ${(vulnerabilities.high || 0) === 0 ? 'success' : 'warning'}">
            <span class="stat-number">${vulnerabilities.high || 0}</span>
            <div class="stat-label">High</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${vulnerabilities.moderate || 0}</span>
            <div class="stat-label">Moderate</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${vulnerabilities.low || 0}</span>
            <div class="stat-label">Low</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${vulnerabilities.info || 0}</span>
            <div class="stat-label">Info</div>
        </div>
    </div>
  `;
  
  if (!auditReport.vulnerabilities || Object.keys(auditReport.vulnerabilities).length === 0) {
    return statsGrid + `
      <div class="success-message">
          <span class="icon">🛡️</span>
          No security vulnerabilities found!
      </div>
    `;
  }
  
  const criticalAndHighVulns = Object.entries(auditReport.vulnerabilities)
    .filter(([_, vuln]: [string, any]) => {
      const severity = vuln.severity?.toLowerCase();
      return severity === 'critical' || severity === 'high';
    });
  
  const criticalCount = Object.values(auditReport.vulnerabilities).filter((vuln: any) => vuln.severity?.toLowerCase() === 'critical').length;
  const highCount = Object.values(auditReport.vulnerabilities).filter((vuln: any) => vuln.severity?.toLowerCase() === 'high').length;
  
  const metadataCritical = vulnerabilities.critical || 0;
  const metadataHigh = vulnerabilities.high || 0;
  const totalVulnObjects = Object.keys(auditReport.vulnerabilities).length;
  
  if (criticalAndHighVulns.length === 0) {
    return statsGrid + `
      <div style="text-align: center; padding: 30px; color: #6c757d; background: rgba(255, 193, 7, 0.1); border-radius: 10px; margin-top: 20px;">
          <span style="font-size: 2rem; display: block; margin-bottom: 10px;">ℹ️</span>
          <h3 style="color: #2c3e50; margin-bottom: 10px;">No Critical or High Severity Vulnerabilities</h3>
          <p>All ${totalVulnerabilities} vulnerabilities are moderate, low, or informational severity.</p>
          <p><small>Only critical and high severity vulnerabilities are displayed in the table for focus.</small></p>
      </div>
    `;
  }
  
  const discrepancyNote = (metadataCritical + metadataHigh > criticalCount + highCount) ? `
    <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #ffc107;">
        <h5 style="color: #856404; margin: 0 0 5px 0;">📊 Vulnerability Analysis Note</h5>
        <p style="color: #856404; margin: 0; font-size: 0.85rem;">
            Displaying ${criticalCount + highCount} unique vulnerability records out of ${metadataCritical + metadataHigh} total critical/high instances.
            <br><small>Multiple package instances may share the same vulnerability ID, so the detailed count may be lower than the total affected packages.</small>
        </p>
    </div>
  ` : '';
  
  const vulnerabilityRows = criticalAndHighVulns
    .map(([id, vuln]: [string, any]) => `
      <tr>
          <td>
              <strong>${vuln.title || vuln.module_name || 'Unknown'}</strong>
              <br>
              <small style="color: #6c757d;">ID: ${id}</small>
          </td>
          <td><span class="badge ${vuln.severity || 'info'}">${vuln.severity || 'Unknown'}</span></td>
          <td><span class="version">${vuln.module_name || 'Unknown'}</span></td>
          <td>${vuln.cvss?.score || 'N/A'}</td>
          <td>
              ${vuln.cves && vuln.cves.length > 0 ? 
                vuln.cves.map((cve: string) => `
                  <a href="https://nvd.nist.gov/vuln/detail/${cve}" target="_blank" class="cve-link">${cve}</a>
                `).join(', ') : 'No CVE'
              }
              ${vuln.url ? `<br><a href="${vuln.url}" target="_blank" class="cve-link">Advisory Details</a>` : ''}
          </td>
      </tr>
    `).join('');
  
  return statsGrid + `
    <div style="background: rgba(220, 53, 69, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h4 style="color: #721c24; margin-bottom: 8px;">🚨 Critical & High Priority Vulnerabilities</h4>
        <p style="color: #721c24; margin: 0; font-size: 0.9rem;">
            Showing ${criticalCount + highCount} unique critical and high severity vulnerabilities out of ${totalVulnerabilities} total.
            <br><small>Focus on these first as they pose the highest security risk.</small>
        </p>
    </div>
    ${discrepancyNote}
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Vulnerability</th>
                    <th>Severity</th>
                    <th>Package</th>
                    <th>CVSS Score</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${vulnerabilityRows}
            </tbody>
        </table>
    </div>
  `;
}

const generateRecommendations = (analysisResult: AnalysisResult): string => {
  const recommendations: string[] = [];
  
  if (analysisResult.dependencies.majorUpdatesCount > 0) {
    recommendations.push(`Review and plan for ${analysisResult.dependencies.majorUpdatesCount} major dependency updates`);
  }
  
  if (Object.keys(analysisResult.dependencies.outdatedDependencies).length > 0) {
    recommendations.push(`Update ${Object.keys(analysisResult.dependencies.outdatedDependencies).length} outdated packages`);
  }
  
  const vulnerabilitiesTotal = getTotalVulnerabilities(analysisResult);
  if (vulnerabilitiesTotal > 0) {
    recommendations.push(`Address ${vulnerabilitiesTotal} security vulnerabilities`);
  }

  if (analysisResult.reactNative.isReactNativeProject) {
    if (analysisResult.reactNative.newArchitectureStatus === 'disabled') {
      recommendations.push('Consider enabling React Native New Architecture for better performance');
    }
    
    if (analysisResult.reactNative.reactNativeVersion) {
      const version = extractVersionNumber(analysisResult.reactNative.reactNativeVersion);
      if (version && version < 0.72) {
        recommendations.push('Consider upgrading to React Native 0.72+ for better stability and features');
      }
    }
  }
  
  if (analysisResult.dependencies.isAllUpToDate && vulnerabilitiesTotal === 0 && 
      (!analysisResult.reactNative.isReactNativeProject || analysisResult.reactNative.newArchitectureStatus === 'enabled')) {
    recommendations.push('Excellent! Your project is well-maintained with up-to-date dependencies, secure packages, and modern React Native architecture.');
  } else if (analysisResult.dependencies.isAllUpToDate && vulnerabilitiesTotal === 0) {
    recommendations.push('Great job! Your project dependencies are up to date and secure.');
  }
  
  return recommendations.map(rec => `<li>${rec}</li>`).join('');
}

const extractVersionNumber = (versionString: string): number | null => {
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const [, major, minor] = match;
    return parseFloat(`${major}.${minor}`);
  }
  return null;
}

const getSecurityStatusBadgeClass = (analysisResult: AnalysisResult): string => {
  const vulnerabilitiesTotal = getTotalVulnerabilities(analysisResult);
  return !analysisResult.dependencies.auditReport || vulnerabilitiesTotal === 0 ? 'success' : 'danger';
}

const getSecurityStatusIcon = (analysisResult: AnalysisResult): string => {
  const vulnerabilitiesTotal = getTotalVulnerabilities(analysisResult);
  return !analysisResult.dependencies.auditReport || vulnerabilitiesTotal === 0 ? '🛡️' : '⚠️';
}

const getTotalVulnerabilities = (analysisResult: AnalysisResult): number => {
  if (!analysisResult.dependencies.auditReport?.metadata?.vulnerabilities) {
    return 0;
  }
  
  const vulns = analysisResult.dependencies.auditReport.metadata.vulnerabilities;
  
  const calculatedTotal = (vulns.critical || 0) + (vulns.high || 0) + (vulns.moderate || 0) + (vulns.low || 0) + (vulns.info || 0);
  
  return Math.max(calculatedTotal, vulns.total || 0);
}

const getSecurityBadgeClass = (analysisResult: AnalysisResult): string => {
  const vulnerabilitiesTotal = getTotalVulnerabilities(analysisResult);
  if (vulnerabilitiesTotal === 0) return 'success';
  if (vulnerabilitiesTotal > 10) return 'danger';
  return 'warning';
}

const generateReactNativeSection = (analysisResult: AnalysisResult): string => {
  const rnResult = analysisResult.reactNative;
  
  if (!rnResult.isReactNativeProject) {
    return `
      <div style="text-align: center; padding: 40px; color: #6c757d; background: rgba(108, 117, 125, 0.1); border-radius: 10px;">
          <span style="font-size: 3rem; display: block; margin-bottom: 15px;">📱</span>
          <h3 style="color: #2c3e50; margin-bottom: 10px;">Not a React Native Project</h3>
          <p>This analysis tool is optimized for React Native projects, but this doesn't appear to be one.</p>
          <p><small>If this is a React Native project, ensure 'react-native' is listed in your package.json dependencies.</small></p>
      </div>
    `;
  }

  const architectureStatus = rnResult.newArchitectureStatus;
  const statusIcon = getArchitectureStatusIcon(architectureStatus);
  const statusColor = getArchitectureStatusColor(architectureStatus);
  const statusText = getArchitectureStatusText(architectureStatus);

  const statsGrid = `
    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-number">⚛️</span>
            <div class="stat-label">React Native</div>
        </div>
        <div class="stat-card">
            <span class="stat-number">${rnResult.reactNativeVersion || 'Unknown'}</span>
            <div class="stat-label">Version</div>
        </div>
        <div class="stat-card ${getReactNativeArchitectureBadgeClass(analysisResult)}">
            <span class="stat-number">${statusIcon}</span>
            <div class="stat-label">New Architecture</div>
        </div>
    </div>
  `;

  const architectureSection = `
    <div style="margin-top: 30px; padding: 20px; background: ${statusColor}; border-radius: 10px; border-left: 4px solid ${getArchitectureBorderColor(architectureStatus)};">
        <h3 style="color: #2c3e50; margin-bottom: 15px;">🏗️ New Architecture Status</h3>
        <p style="color: #495057; margin-bottom: 10px; font-size: 1.1rem;">
            <strong>${statusText}</strong>
        </p>
        ${getArchitectureDescription(architectureStatus)}
    </div>
  `;

  const recommendationsSection = rnResult.recommendations.length > 0 ? `
    <div style="margin-top: 20px; padding: 20px; background: rgba(52, 152, 219, 0.1); border-radius: 10px; border-left: 4px solid #3498db;">
        <h3 style="color: #2c3e50; margin-bottom: 15px;">💡 React Native Recommendations</h3>
        <ul style="color: #495057; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${rnResult.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
  ` : '';

  return statsGrid + architectureSection + recommendationsSection;
}

const getReactNativeArchitectureBadgeClass = (analysisResult: AnalysisResult): string => {
  const status = analysisResult.reactNative.newArchitectureStatus;
  switch (status) {
    case 'enabled': return 'success';
    case 'disabled': return 'warning';
    case 'unknown': return 'info';
    case 'not-applicable': return 'secondary';
    default: return 'secondary';
  }
}

const getReactNativeArchitectureStatus = (analysisResult: AnalysisResult): string => {
  const status = analysisResult.reactNative.newArchitectureStatus;
  switch (status) {
    case 'enabled': return 'ON';
    case 'disabled': return 'OFF';
    case 'unknown': return '?';
    case 'not-applicable': return 'N/A';
    default: return '?';
  }
}

const getArchitectureStatusIcon = (status: string): string => {
  switch (status) {
    case 'enabled': return '✅';
    case 'disabled': return '❌';
    case 'unknown': return '❓';
    case 'not-applicable': return '➖';
    default: return '❓';
  }
}

const getArchitectureStatusColor = (status: string): string => {
  switch (status) {
    case 'enabled': return 'rgba(40, 167, 69, 0.1)';
    case 'disabled': return 'rgba(255, 193, 7, 0.1)';
    case 'unknown': return 'rgba(23, 162, 184, 0.1)';
    case 'not-applicable': return 'rgba(108, 117, 125, 0.1)';
    default: return 'rgba(108, 117, 125, 0.1)';
  }
}

const getArchitectureBorderColor = (status: string): string => {
  switch (status) {
    case 'enabled': return '#28a745';
    case 'disabled': return '#ffc107';
    case 'unknown': return '#17a2b8';
    case 'not-applicable': return '#6c757d';
    default: return '#6c757d';
  }
}

const getArchitectureStatusText = (status: string): string => {
  switch (status) {
    case 'enabled': return 'New Architecture is Enabled';
    case 'disabled': return 'New Architecture is Disabled';
    case 'unknown': return 'Could not determine New Architecture status';
    case 'not-applicable': return 'New Architecture status not applicable';
    default: return 'Unknown status';
  }
}

const getArchitectureDescription = (status: string): string => {
  switch (status) {
    case 'enabled':
      return `
        <p style="color: #155724; margin: 0;">
          Your project is using React Native's New Architecture (Fabric + TurboModules), which provides:
          <br>• Better performance and reduced memory usage
          <br>• Improved type safety with JSI
          <br>• More efficient communication between JS and native code
        </p>
      `;
    case 'disabled':
      return `
        <p style="color: #856404; margin: 0;">
          Your project is using the legacy architecture. Consider enabling the New Architecture for:
          <br>• Better performance and memory efficiency
          <br>• Future-proofing your app as Meta focuses on the new architecture
          <br>• Access to new features and optimizations
        </p>
      `;
    case 'unknown':
      return `
        <p style="color: #0c5460; margin: 0;">
          Unable to determine your New Architecture status. This could be due to:
          <br>• Custom project configuration
          <br>• Missing configuration files
          <br>• Non-standard project structure
        </p>
      `;
    default:
      return '';
  }
} 