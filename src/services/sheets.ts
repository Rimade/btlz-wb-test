import { google } from "googleapis";
import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

export const SHEET_NAME = "stocks_coefs";

function getSheetsClient() {
    const auth = new google.auth.JWT({
        email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: env.GOOGLE_PRIVATE_KEY,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

/** Tariff row for sheet: same order as DB columns, sorted by coefficient. */
type TariffRow = (string | number | null)[];

/**
 * Убеждается, что в таблице есть лист stocks_coefs; создаёт его при отсутствии.
 */
async function ensureSheetExists(
    spreadsheetId: string,
    sheets: ReturnType<typeof google.sheets>
): Promise<void> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const hasSheet = meta.data.sheets?.some(
        (s) => s.properties?.title === SHEET_NAME
    );
    if (hasSheet) return;
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                { addSheet: { properties: { title: SHEET_NAME } } },
            ],
        },
    });
}

/** Load today's tariffs from DB, sorted by box_delivery_base ASC (coefficient). */
export async function getTariffsForToday(date: string): Promise<TariffRow[]> {
    const rows = await knex("wb_tariffs")
        .where("dt", date)
        .orderBy("box_delivery_base", "asc")
        .select(
            "warehouse_name",
            "warehouse_id",
            "box_delivery_and_storage_expr",
            "box_delivery_base",
            "box_delivery_liter",
            "box_storage_base",
            "box_storage_liter",
            "dt"
        );

    return rows.map((r) => [
        r.warehouse_name ?? "",
        r.warehouse_id ?? "",
        r.box_delivery_and_storage_expr ?? "",
        r.box_delivery_base ?? "",
        r.box_delivery_liter ?? "",
        r.box_storage_base ?? "",
        r.box_storage_liter ?? "",
        r.dt ?? "",
    ]);
}

/** Write tariffs to one spreadsheet: ensure sheet exists, clear, then write headers + rows. */
async function syncSpreadsheet(
    spreadsheetId: string,
    date: string,
    sheets: ReturnType<typeof google.sheets>
): Promise<void> {
    await ensureSheetExists(spreadsheetId, sheets);
    const rows = await getTariffsForToday(date);
    const headers: TariffRow = [
        "warehouse_name",
        "warehouse_id",
        "box_delivery_and_storage_expr",
        "box_delivery_base",
        "box_delivery_liter",
        "box_storage_base",
        "box_storage_liter",
        "dt",
    ];
    const data = [headers, ...rows];

    const range = `${SHEET_NAME}!A1`;
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${SHEET_NAME}!A:Z`,
    });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: data },
    });
}

/** Sync today's tariffs to all spreadsheets from DB. */
export async function syncAllSheets(date: string): Promise<{ ok: number; err: number }> {
    const spreadsheets = await knex("spreadsheets").select("spreadsheet_id");
    const sheets = getSheetsClient();
    let ok = 0;
    let err = 0;

    for (const { spreadsheet_id } of spreadsheets) {
        try {
            await syncSpreadsheet(spreadsheet_id, date, sheets);
            ok += 1;
        } catch (e) {
            err += 1;
            console.error(`[sheets] sync failed for ${spreadsheet_id}:`, e);
            // continue to next spreadsheet
        }
    }
    return { ok, err };
}
