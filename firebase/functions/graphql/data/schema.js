const { makeExecutableSchema } = require('graphql-tools');
const { gql } = require('apollo-server-cloud-functions');
const resolvers = require('./resolvers');

const schema = gql`
  type Query {
    groups: [Group]
    challenges: [Challenge]
    challenge(id: ID!): Challenge
  }
  type Group {
    id: ID!
    name: String!
    count: Int!
  }
  type Challenge {
    id: ID!
    title: String!
    discription: String!
  }
  type Mutation {
    addGroup(name: String!): Group
    signUp(
      email: String!
      password: String!
      confirmPassword: String!
      handle: String!
    ): String!
    signUpWithTwitter: String!
  }
`;

module.exports = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});
