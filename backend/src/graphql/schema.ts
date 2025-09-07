import { buildSchema } from 'graphql';

// Define a simple GraphQL schema for testing
export const schema = buildSchema(`
  type Query {
    hello: String
    users: [User]
    user(id: ID!): User
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Mutation {
    createUser(name: String!, email: String!): User
  }
`);

// Sample data for testing
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// Root resolver
export const rootValue = {
  hello: () => 'Hello from OFFER-HUB GraphQL API!',
  users: () => users,
  user: ({ id }: { id: string }) => users.find(user => user.id === id),
  createUser: ({ name, email }: { name: string; email: string }) => {
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
    };
    users.push(newUser);
    return newUser;
  },
};
