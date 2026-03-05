/**
 * Add id and title to spreadsheets (task: at least id, spreadsheet_id, title).
 * Keep spreadsheet_id as PK for upserts; id is serial for reference.
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable("spreadsheets", (table) => {
        table.increments("id").unsigned().notNullable();
        table.string("title").nullable();
    });
    await knex.raw("ALTER TABLE spreadsheets ADD CONSTRAINT spreadsheets_id_unique UNIQUE (id)");
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.raw("ALTER TABLE spreadsheets DROP CONSTRAINT IF EXISTS spreadsheets_id_unique");
    await knex.schema.alterTable("spreadsheets", (table) => {
        table.dropColumn("id");
        table.dropColumn("title");
    });
}
