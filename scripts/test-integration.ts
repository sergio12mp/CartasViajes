import { spawnSync } from "node:child_process";
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("Configura DATABASE_URL y DIRECT_URL de desarrollo antes de ejecutar las pruebas de integración.");
  process.exit(1);
}
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "src/app/actions/actions.integration.test.ts"], {
  stdio: "inherit", env: { ...process.env, RUN_DB_TESTS: "1" },
});
process.exit(result.status ?? 1);
