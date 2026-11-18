// Backward-compatible paper-only entry point. The full sync also copies model data.
import { main } from './sync-mackenzie-qaly.mjs';

try { process.exitCode = main(process.argv.slice(2), { paperOnly: true }); }
catch (error) { console.error(error.message); process.exitCode = 1; }
