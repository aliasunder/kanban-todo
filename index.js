const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const knex = require('knex')({
	client: 'postgres',
	connection: {
		host: process.env.PGHOST,
		user: process.env.DBUSER,
		password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: true
	}
});
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'


const app = express();

const typeDefs = gql`
   type ToDo { 
      title: String!, 
      description: String!, 
      status: Boolean!, 
      due_date: String!,
      id: ID!,
      categories: [String]
   }
   type Query { 
      todos(filter: ToDoInput): [ToDo]
      todo(id: ID!) : ToDo
   }
   input ToDoInput {
      title: String, 
      description: String, 
      status: Boolean = false, 
      due_date: String,
      categories: [String]
      id: ID
   }
   type Mutation {
      createNewToDo(input: ToDoInput!) : ToDo
      updateToDo(id: ID!, input: ToDoInput!) : ToDo
      deleteToDo(id: ID!) : ToDo
      deleteByFilter(filter: ToDoInput!) : ToDo
   }
`

const resolvers = {
   Query: {
      // resolver to find todos. If there is no filter, all todos are returned
      // if there is a filter, the todos that match the filter object property
      // will be returned. Results can only be filtered by one property
      todos: async (_, { filter }) => {
         if (!filter){
            const todos = await knex('todos').select()
            return todos;
         }
         else {
            const filteredtodos = await knex('todos')
            .where((qb) => {
               if (filter.status){
                  qb.where('status', filter.status)
               }
               if (filter.description){
                  qb.orWhere('description', filter.description)
               }
               if (filter.id){
                  qb.orWhere('id',filter.id)
               }
               if (filter.title){
                  qb.orWhere('title', filter.title)
               }
               if (filter.due_date){
                  qb.orWhere('due_date', filter.due_date)
               }
               if (filter.categories){
                  qb.orWhere('categories', filter.categories)
               }
            })
            return filteredtodos;
         }
      },
      // return a single todo by id
      todo: async () => {
         const todo = await knex.select('id').from('todos')
         return todo;
      }
   },
   Mutation: {
      // create a new tidi and return results of newToDo
      createNewToDo: async (_, { input }) => {
      const [newToDo]= await knex('todos')
         .returning(['id', 'title', 'description', 'status', 'due_date'])
         .insert(input)
         return newToDo;
      },
      // find todo by id and update todo with included object properties
      updateToDo: async (_, { id, input }) => {
         const [updatedToDo] = await knex('todos')
            .where('id', '=', id)
            .returning(['id', 'title', 'description', 'status', 'due_date'])
            .update(input)
         return updatedToDo;
      },
      // find todo by id and delete
      deleteToDo: async (_, { id }) => {
         const [deletedToDo] = await knex('todos')
            .where('id', id)
            .returning(['id', 'title', 'description', 'status', 'due_date'])
            .del()
         return deletedToDo;
      },
      // find todos that match a filter object property and 
      // delete those results. Results can only be filtered by one property
      deleteByFilter: async (_, { filter }) => {
         const [deletedToDos] = await knex('todos')
            .where((qb) => {
               if (filter.status){
                  qb.where('status', filter.status)
               }
               if (filter.description){
                  qb.orWhere('description', filter.description)
               }
               if (filter.id){
                  qb.orWhere('id', filter.id)
               }
               if (filter.title){
                  qb.orWhere('title', filter.title)
               }
            })
            .returning(['id', 'title', 'description', 'status', 'due_date'])
            .del()
         return deletedToDos;
      }
   }
};

const server = new ApolloServer({ 
   typeDefs, 
   resolvers, 
   introspection: true,
   playground: true
});

server.applyMiddleware({ app })

app.listen({ port: PORT }, () => {
  console.log(`Go to http://${HOST}:${PORT}/graphql to run queries!`)
})