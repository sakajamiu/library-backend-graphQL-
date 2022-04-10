const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { ApolloServerPluginLandingPageGraphQLPlayground,AuthenticationError } = require(`apollo-server-core`)
const mongoose = require('mongoose')
const Author = require('./model/author')
const Book = require('./model/book')
require('dotenv').config()
const jwt =require('jsonwebtoken')
const { populate } = require('./model/author')
const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI)
 .then(() => {
   console.log('connected to MongoDB')
 })
 .catch((error)=>{
   console.log('error connecting to MongoDB')
 })

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
  bookCount: Int
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
}`

const resolvers = {
  Query: {
    bookCount : async ()=> Book.collection.countDocuments() ,
    authorCount: async()=> Author.collection.countDocuments(),
    allBook: async(root, args)=>{
      if(!args.author){
        return await Book.find({}).populate('author')
      }
      const books = await Book.find({}).populate('author')
      return books.filter(books => books.author.name === args.author)
    }, 
    allAuthor:async() => Author.find({})
  },
  Author: {
    bookCount: async(root)=> {
      const count = Book.findById(book => book.author === root.name)
      return count.length
    }
  },
  Mutation: {
    addBook:async (root,args) =>{
      let bookAuthor = await Author.findOne({name: args.author})
      const book = new Book({...args})
      if(!bookAuthor){
        try{
           const author = new Author({
            name : args.author
          })
          await author.save()
          bookAuthor = author
        }catch(error){
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      }
      book.author = bookAuthor
      try{
        await  book.save()
      }catch(error){
        throw new UserInputError( error.message, {
          invalidArgs: args
        })
      }
      
      return book
    },
    editAuthor:(root, args) =>{
      const existingAuthor = authors.find( author => author.name === args.name)
      if(!existingAuthor){
        return null
      }
      const editedauthor = {...existingAuthor, born: args.born}
      authors.map(author => author.name === args.name ? editedauthor: author)

    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins:[
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ]
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})