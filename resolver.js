const { ApolloServer, UserInputError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const Author = require('./model/author')
const Book = require('./model/book')
const User = require('./model/user')
require('dotenv').config()
const jwt = require("jsonwebtoken")

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
      allAuthor:async() => Author.find({}),
    
      me: async( root ,args,context) => {
        return context.currentUser
      },
   },
    Mutation: {
      addBook:async (root,args, context) =>{
        let bookAuthor = await Author.findOne({name: args.author})
        const book = new Book({...args})
        if(!context.currentUser){
          throw new AuthenticationError("not authenticated !")
        }
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
      editAuthor:async(root, args, context) =>{
        const existingAuthor = await Author.findone( {name: args.name})
        if(!context.currentUser){
          throw new AuthenticationError("not authenticated!")
        }
        if(!existingAuthor){
          throw new UserInputError("invalid Author name")
        }
        existingAuthor.born = args.born
        try{
          await existingAuthor.save()
        }catch(error){
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
        return existingAuthor
        
  
      },
      createUser : async (root, args) =>{
        const user = new User({ username : args.username})
        return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs : args
          })
        })
      },
      login :async (root, args)=>{
        const user = await User.findOne({username : args.username})
        if (!user || args.password !== 'password'){
          throw new UserInputError("Wrong Credentials")
        }
        const userForToken = {
          username: user.username,
          id : user._id
        }
        return { value: jwt.sign(userForToken, process.env.SECRET)}
      }
    },
    Subscription : {
        bookAdded:{
            subscribe:() => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
  }
  module.exports = resolvers