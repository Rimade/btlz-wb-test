import cron from "node-cron";
import { fetchAndUpsertBoxTariffs, todayStr } from "#services/wb.js";
import { syncAllSheets } from "#services/sheets.js";

function log(msg: string): void {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function runWbJob(): Promise<void> {
    try {
        const date = todayStr();
        log("WB: fetching box tariffs...");
        const count = await fetchAndUpsertBoxTariffs(date);
        log(`WB: done, upserted ${count} rows for ${date}`);
    } catch (e) {
        console.error("[WB job error]", e);
    }
}

async function runSheetsJob(): Promise<void> {
    try {
        const date = todayStr();
        log("Sheets: syncing to Google Sheets...");
        const { ok, err } = await syncAllSheets(date);
        log(`Sheets: done, ok=${ok} err=${err}`);
    } catch (e) {
        console.error("[Sheets job error]", e);
    }
}

/** Start cron: WB every hour, Sheets every 30 min. Run both once on startup. */
export function startScheduler(): void {
    cron.schedule("0 * * * *", runWbJob);
    cron.schedule("*/30 * * * *", runSheetsJob);
    log("Scheduler started (WB: every hour, Sheets: every 30 min)");

    (async () => {
        await runWbJob();
        await runSheetsJob();
    })();
}
