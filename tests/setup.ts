const { execSync } = require("child_process");
require("dotenv").config();

async function runTest (command : string): Promise<boolean> {
   let retries = 1;

   // Run all tests with at most 3 retries
   while (retries <= 3) {
      try {
         execSync(command, { stdio: "inherit" });
         break;
      } catch (error) {
         console.error(`Error running tests (Attempt #${retries}):`, error);
      }

      retries++;
   }

   return retries <= 3;
}

async function main (): Promise<void> {
   let passed = false;
   console.log("Setting up docker environment.");

   try {
      // Build and start the docker integration environment
      execSync("docker compose -f tests/docker-compose.yaml up -d", { stdio: "inherit" },);

      // Wait for container database to setup
      await new Promise(resolve => setTimeout(resolve, 10000));

      process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5431/vitality_test?schema=public";
      const serverComponents = await runTest("npx jest --runInBand tests/integration/* --collect-coverage");

      if (!(serverComponents)) {
         console.error("Some server component tests have failed.");
         passed = false;
      }

      process.env.BASE_URL = "http://localhost:3001";

      const e2e = await runTest("npx cypress run");

      if (!(e2e)) {
         console.error("Some end to end tests have failed.");
         passed = false;
      }

   } catch (error) {
      console.error("Error setting up docker environment. Please try again:", error);
   } finally {
      // Cleanup the docker integration environment
      try {
         console.log("Cleaning up docker environment.");
         execSync("docker compose -f  tests/docker-compose.yaml down -v --remove-orphans", { stdio: "inherit" },);
      } catch (error) {
         console.error("Error cleaning up docker environment. Please manually clean up for future testing:", error);
      }

      if (!(passed)) {
         process.exit(1);
      }
   }
}

main();