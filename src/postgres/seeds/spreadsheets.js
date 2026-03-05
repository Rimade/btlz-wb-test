/**
 * Test Google Sheet IDs — replace with real ones; share each sheet with GOOGLE_SERVICE_ACCOUNT_EMAIL.
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([
            { spreadsheet_id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms", title: "Тарифы 1" },
            { spreadsheet_id: "1abc000000000000000000000000000000000001", title: "Тарифы 2" },
            { spreadsheet_id: "1abc000000000000000000000000000000000002", title: "Тарифы 3" },
        ])
        .onConflict("spreadsheet_id")
        .ignore();
}
