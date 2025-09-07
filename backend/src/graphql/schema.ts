// Sample data for testing
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

export const typeDefs = `
  type Query {
    hello: String!
    users: [User!]!
    user(id: ID!): User
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`;

export const resolvers = {
  Query: {
    hello: () => 'Hello from OFFER-HUB GraphQL API!',
    users: () => users,
    user: (_: unknown, { id }: { id: string }) => users.find(u => u.id === id) ?? null,
  },
  Mutation: {
    createUser: (_: unknown, { name, email }: { name: string; email: string }) => {
      const newUser = { id: String(users.length + 1), name, email };
      users.push(newUser);
      return newUser;
    },
  },
};
