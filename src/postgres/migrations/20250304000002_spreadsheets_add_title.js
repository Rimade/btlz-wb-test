/**
 * Добавить колонку title в spreadsheets. PK остаётся spreadsheet_id.
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable("spreadsheets", (table) => {
        table.string("title").nullable();
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.alterTable("spreadsheets", (table) => {
        table.dropColumn("title");
    });
}
