// in the 'up' function, the code
// takes the DB, and changes it to the new structure
exports.up = function(knex, Promise) {
  return knex.schema.createTable('todos', (table) => {
   table.increments('id').primary();
   table.string('title');
   table.string('description');
   table.boolean('status').defaultsTo(false);
   table.timestamp('created_at').defaultsTo(knex.fn.now())
   table.timestamp('updated_at').defaultsTo(knex.fn.now())
   table.datetime('due_date');
   table.jsonb('categories'),
   table.jsonb('uploaded_files')
  })
};
// in the 'down' function the code
// takes the DB from the new version, back to the old version
exports.down = function(knex, Promise) {
   return knex.schema.dropTableIfExists('todos');
};
