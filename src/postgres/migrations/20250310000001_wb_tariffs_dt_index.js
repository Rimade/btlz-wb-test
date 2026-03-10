/**
 * Индекс по дате для ускорения выборки тарифов за день.
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable("wb_tariffs", (table) => {
        table.index("dt");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.alterTable("wb_tariffs", (table) => {
        table.dropIndex([], "wb_tariffs_dt_index");
    });
}
