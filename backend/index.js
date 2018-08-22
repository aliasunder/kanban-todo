const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const knex = require('knex')({
	client: 'postgres',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'postgres',
		database: 'kanbantodo',
		charset: 'utf8'
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
      id: ID!
   }
   type Query { 
      todos: [ToDo] 
      filterByStatus(status: Boolean): [ToDo]
      filterById(id: ID): [ToDo]
      todo(id: ID!) : ToDo
   }
   input ToDoInput {
      title: String, 
      description: String, 
      status: Boolean = false, 
      due_date: String,
   }
   type Mutation {
      createNewToDo(input: ToDoInput) : ToDo
      updateToDo(id: ID!, input: ToDoInput) : ToDo
      deleteToDo(id: ID!) : ToDo
   }
`

const resolvers = {
   Query: {
      todos: async () => {
         const todos = await knex('todos').select()
         return todos;
      },
      filterByStatus: async (_, { status }) => {
         console.log(status)
         const filtered = await knex('todos')
            .where('status', '=', status)
         return filtered;
      },
      filterById: async (_, { id }) => {
         console.log(id)
         const filtered = await knex('todos')
            .where('id', '=', id)
         return filtered;
      },
      todo: async () => {
         const todo = await knex.select('id').from('todos')
         return todo;
      }
   },
   Mutation: {
      createNewToDo: async (_, { input }) => {
      const [newToDo]= await knex('todos')
         .returning(['id', 'title', 'description', 'status', 'due_date'])
         .insert(input)
         return newToDo;
      },
      updateToDo: async (_, { id, input }) => {
         const [updatedToDo] = await knex('todos')
            .where('id', '=', id)
            .returning(['id', 'title', 'description', 'status', 'due_date'])
            .update(input)
         return updatedToDo;
      },
      deleteToDo: async (_, { id }) => {
         const [deletedToDo] = await knex('todos')
            .where('id', id)
            .returning(['id', 'title', 'description', 'status', 'due_date'])
            .del()
         return deletedToDo;
      }
   }
};

const server = new ApolloServer({ typeDefs, resolvers});
server.applyMiddleware({ app })

app.listen({ port: PORT }, () => {
  console.log(`Go to http://${HOST}:${PORT}/graphql to run queries!`)
})