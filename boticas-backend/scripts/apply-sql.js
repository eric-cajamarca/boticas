import { execSync } from "child_process";

try {
  console.log("📂 Ejecutando init.sql en SQL Server...");

  execSync(
    "/opt/mssql-tools18/bin/sqlcmd -S db -U sa -P Admin123! -d master -i /scripts/init.sql -C",
    { stdio: "inherit" }
  );

  console.log("✅ Script SQL aplicado con éxito.");
} catch (err) {
  console.error("❌ Error al ejecutar init.sql:", err.message);
  process.exit(1);
}

