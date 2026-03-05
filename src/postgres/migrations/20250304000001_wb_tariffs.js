/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("wb_tariffs", (table) => {
        table.increments("id").primary();
        table.string("warehouse_name").notNullable();
        table.bigInteger("warehouse_id").nullable();
        table.decimal("box_delivery_and_storage_expr", 14, 4).nullable();
        table.decimal("box_delivery_base", 14, 4).nullable();
        table.decimal("box_delivery_liter", 14, 4).nullable();
        table.decimal("box_storage_base", 14, 4).nullable();
        table.decimal("box_storage_liter", 14, 4).nullable();
        table.date("dt").notNullable();
        table.timestamps(true, true);
        table.unique(["warehouse_name", "dt"]);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists("wb_tariffs");
}
