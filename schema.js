const { gql } = require("apollo-server")

const typeDefs = gql`
type Book{
  title: String!
  published: Int!
  author: Author!
  id: ID !
  genres: [String!]!
}

type Author{
  name: String!
  born: Int
}
type User{
  username: String!
  favoriteGenre: String!
  id: ID!
}
type Token{
  value: String!
}
type Mutation{
  addBook(
    title: String!
    author:String!
    published: Int!
    genres:[String!]!
  ):Book!
  editAuthor(
    name: String!
    born: Int!
  ):Author
  createUser(
    username: String!
    favoriteGenre: String!
  ):User
  login(
    username:String!
    password:String!
  ):Token
}
type Query {
  bookCount: Int!
  authorCount: Int!
  allBook (author: String): [Book!]!
  allAuthor : [Author!]!
  me:User
}
type Subscription{
    bookAdded: Book!
}
`

module.exports = typeDefs