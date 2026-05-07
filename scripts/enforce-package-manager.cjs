const userAgent = process.env.npm_config_user_agent || '';

if (userAgent.startsWith('pnpm/')) {
  process.exit(0);
}

console.error('');
console.error('This repository uses pnpm workspaces.');
console.error('Use "pnpm --filter frontend add lucide-react" instead of "npm add lucide-react".');
console.error('');
process.exit(1);
