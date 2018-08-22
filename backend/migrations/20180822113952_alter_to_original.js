
exports.up = function(knex, Promise) {
   return knex.schema.alterTable('todos', (table) => {
      table.string('title').notNullable().alter();
      table.string('description').notNullable().alter();
      table.boolean('status').notNullable().defaultsTo(false).alter();
      table.timestamp('created_at').notNullable().defaultsTo(knex.fn.now()).alter()
      table.timestamp('updated_at').notNullable().defaultsTo(knex.fn.now()).alter()
      table.datetime('due_date').notNullable().alter();
     })
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTableIfExists('todos');
};
