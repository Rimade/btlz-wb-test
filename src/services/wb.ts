import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

const WB_BOX_TARIFFS_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";

interface WBWarehouseTariff {
    warehouseName: string;
    warehouseID?: number;
    boxDeliveryBase?: string;
    boxDeliveryCoefExpr?: string;
    boxDeliveryLiter?: string;
    boxStorageBase?: string;
    boxStorageCoefExpr?: string;
    boxStorageLiter?: string;
}

interface WBResponse {
    response?: { data?: { warehouseList?: WBWarehouseTariff[] } };
    data?: { warehouseList?: WBWarehouseTariff[] };
}

function parseDecimal(s: string | undefined): number | null {
    if (s == null || s === "") return null;
    const n = parseFloat(String(s).replace(",", "."));
    return Number.isNaN(n) ? null : n;
}

export async function fetchAndUpsertBoxTariffs(date: string): Promise<number> {
    const res = await fetch(
        `${WB_BOX_TARIFFS_URL}?date=${encodeURIComponent(date)}`,
        { headers: { Authorization: `Bearer ${env.WB_API_TOKEN}` } }
    );
    if (!res.ok) throw new Error(`WB API ${res.status}: ${await res.text()}`);

    const data: WBResponse = await res.json();
    const warehouseList =
        data?.response?.data?.warehouseList ?? data?.data?.warehouseList ?? [];
    if (warehouseList.length === 0) return 0;

    const rows = warehouseList.map((w) => ({
        warehouse_name: w.warehouseName,
        warehouse_id: w.warehouseID ?? null,
        box_delivery_and_storage_expr: parseDecimal(
            w.boxDeliveryCoefExpr ?? w.boxStorageCoefExpr
        ),
        box_delivery_base: parseDecimal(w.boxDeliveryBase),
        box_delivery_liter: parseDecimal(w.boxDeliveryLiter),
        box_storage_base: parseDecimal(w.boxStorageBase),
        box_storage_liter: parseDecimal(w.boxStorageLiter),
        dt: date,
    }));

    await knex("wb_tariffs")
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

    return rows.length;
}

export function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}
