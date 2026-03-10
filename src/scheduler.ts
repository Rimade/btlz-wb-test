import cron from "node-cron";
import { fetchAndUpsertBoxTariffs, todayStr } from "#services/wb.js";
import { syncAllSheets } from "#services/sheets.js";

/** Выражение cron: каждый час в ноль минут (ежечасное получение тарифов WB). */
export const WB_CRON = "0 * * * *";

/** Выражение cron: каждые 30 минут (обновление Google Таблиц). */
export const SHEETS_CRON = "*/30 * * * *";

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

/** Запуск планировщика: WB ежечасно, Sheets каждые 30 мин; оба задания выполняются один раз при старте. */
export function startScheduler(): void {
    cron.schedule(WB_CRON, runWbJob);
    cron.schedule(SHEETS_CRON, runSheetsJob);
    log("Scheduler started (WB: every hour, Sheets: every 30 min)");

    (async () => {
        await runWbJob();
        await runSheetsJob();
    })();
}
