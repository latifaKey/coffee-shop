import { spawnSync } from 'child_process';

// helper to run node scripts via forked synchronous processes
function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

// This script runs all seeding scripts in sequence. It doesn't run prisma migrations.
// Make sure DB + migrations are applied before running.

console.log('Seeding products...');
run('node', ['scripts/seed-products-prisma.mjs']);

console.log('Seeding team...');
run('node', ['scripts/seed-team-prisma.mjs']);

console.log('Seeding news...');
run('node', ['scripts/seed-news-prisma.mjs']);

console.log('All seeds finished.');
