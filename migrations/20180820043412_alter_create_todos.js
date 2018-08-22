
exports.up = function(knex, Promise) {
   return knex.schema.alterTable('todos', (table) => {
      table.string('title').alter();
      table.string('description').alter();
      table.boolean('status').defaultsTo(false).alter();
      table.timestamp('created_at').defaultsTo(knex.fn.now()).alter()
      table.timestamp('updated_at').defaultsTo(knex.fn.now()).alter()
      table.datetime('due_date').alter();
     })
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTableIfExists('todos');
};
