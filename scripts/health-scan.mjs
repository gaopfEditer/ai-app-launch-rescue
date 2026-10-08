#!/usr/bin/env node
/**
 * Lightweight static scan for common AI-prototype issues.
 * Usage: node scripts/health-scan.mjs [path]
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.argv[2] || '.');

const rules = [
  {
    id: 'vite-secret',
    severity: 'critical',
    description: 'VITE_* OpenAI/API key exposed to client bundle',
    test: (file, content) =>
      /VITE_(OPENAI|API|SECRET)/i.test(content) && file.includes('env'),
  },
  {
    id: 'browser-openai',
    severity: 'critical',
    description: 'OpenAI client instantiated in frontend',
    test: (file, content) =>
      file.includes('/src/') && /dangerouslyAllowBrowser|from ['"]openai['"]/.test(content),
  },
  {
    id: 'dangerous-html',
    severity: 'high',
    description: 'Unsanitized HTML rendering (XSS)',
    test: (_file, content) => /dangerouslySetInnerHTML/.test(content),
  },
  {
    id: 'wildcard-cors',
    severity: 'medium',
    description: 'Permissive CORS origin',
    test: (_file, content) => /cors\(\{[^}]*origin:\s*['"]\*['"]/.test(content),
  },
  {
    id: 'stack-leak',
    severity: 'medium',
    description: 'Stack traces returned in API responses',
    test: (file, content) => file.includes('server') && /stack:\s*err\.stack/.test(content),
  },
  {
    id: 'no-rate-limit',
    severity: 'medium',
    description: 'AI route without rate limiting (heuristic)',
    test: (file, content) =>
      file.includes('server') &&
      /\/ai\//.test(content) &&
      !/rateLimit|rate-limit/.test(content),
  },
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|env\.example|md)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const findings = [];
for (const file of walk(root)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const rule of rules) {
    if (rule.test(file, content)) {
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        file: path.relative(root, file),
        description: rule.description,
      });
    }
  }
}

const report = {
  scannedRoot: root,
  findingCount: findings.length,
  findings,
};

console.log(JSON.stringify(report, null, 2));
