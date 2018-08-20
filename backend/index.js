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
      status: Boolean, 
      due_date: String!,
      id: ID
   }
   type Query { 
      todos: [ToDo] 
   }
   input ToDoInput {
      title: String!, 
      description: String!, 
      status: Boolean! = false, 
      due_date: String!
   }
   type Mutation {
      createNewToDo(input: ToDoInput) : ToDo
      updateToDo(id: ID!, input: ToDoInput) : ToDo
   }
`

const resolvers = {
   Query: {
      todos: async () => {
         const todos = await knex('todos').select()
         return todos;
      }
   },
   Mutation: {
      createNewToDo: async (_, { input }) => {
      return await knex('todos')
         .returning('id')
         .insert(input)
      },
      updateToDo: async (_, { id, input }) => {
         const updatedToDo = await database('todos')
            .where('id', '=', id)
            .update({ input })
         return updatedToDo;
      }
   }
};

const server = new ApolloServer({ typeDefs, resolvers});
server.applyMiddleware({ app })

app.listen({ port: PORT }, () => {
  console.log(`Go to http://${HOST}:${PORT}/graphiql to run queries!`)
})