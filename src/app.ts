import knex, { migrate } from "#postgres/knex.js";
import { startScheduler } from "#scheduler.js";
import { startHealthServer } from "#server/health.js";

function log(msg: string): void {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function main(): Promise<void> {
    try {
        await knex.raw("select 1");
        log("DB connected");
    } catch (e) {
        console.error("DB connection failed:", e);
        process.exit(1);
    }

    await migrate.latest();
    log("Migrations up to date");

    startHealthServer();
    startScheduler();
}

main();
