import axios from "axios";
import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

const WB_BOX_TARIFFS_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";

/** WB API warehouse item (box tariffs). Numbers come as strings, often with comma decimal. */
export interface WBWarehouseTariff {
    warehouseName: string;
    warehouseID?: number;
    boxDeliveryBase?: string;
    boxDeliveryCoefExpr?: string;
    boxDeliveryLiter?: string;
    boxStorageBase?: string;
    boxStorageCoefExpr?: string;
    boxStorageLiter?: string;
}

interface WBBoxTariffsResponse {
    response?: {
        data?: {
            warehouseList?: WBWarehouseTariff[];
        };
    };
    data?: {
        warehouseList?: WBWarehouseTariff[];
    };
}

/** Parse "11,2" or "48" to number. */
function parseDecimal(s: string | undefined): number | null {
    if (s == null || s === "") return null;
    const normalized = String(s).replace(",", ".");
    const n = parseFloat(normalized);
    return Number.isNaN(n) ? null : n;
}

/** Fetch box tariffs for date and upsert into wb_tariffs (one row per warehouse per day). */
export async function fetchAndUpsertBoxTariffs(date: string): Promise<number> {
    const { data } = await axios.get<WBBoxTariffsResponse>(WB_BOX_TARIFFS_URL, {
        params: { date },
        headers: { Authorization: `Bearer ${env.WB_API_TOKEN}` },
    });

    const warehouseList =
        data?.response?.data?.warehouseList ?? data?.data?.warehouseList ?? [];
    if (warehouseList.length === 0) {
        return 0;
    }

    const rows = warehouseList.map((w) => ({
        warehouse_name: w.warehouseName,
        warehouse_id: w.warehouseID ?? null,
        box_delivery_and_storage_expr: parseDecimal(w.boxDeliveryCoefExpr ?? w.boxStorageCoefExpr),
        box_delivery_base: parseDecimal(w.boxDeliveryBase),
        box_delivery_liter: parseDecimal(w.boxDeliveryLiter),
        box_storage_base: parseDecimal(w.boxStorageBase),
        box_storage_liter: parseDecimal(w.boxStorageLiter),
        dt: date,
    }));

    const result = await knex("wb_tariffs")
        .insert(rows)
        .onConflict(["warehouse_name", "dt"])
        .merge([
            "warehouse_id",
            "box_delivery_and_storage_expr",
            "box_delivery_base",
            "box_delivery_liter",
            "box_storage_base",
            "box_storage_liter",
            "updated_at",
        ]);

    // knex onConflict().merge() returns row count behaviour depends on driver; return rows length as done count
    return rows.length;
}

/** Get today's date in YYYY-MM-DD. */
export function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}
