const { ApolloServer, gql} = require ("apollo-server");


const books =[
 {
    id:1 ,
    title: "博士の愛した数式",
    author:"小川洋子",
 },
 {
    id:2 ,
    title: "ジョゼと虎と魚たち",
    author:"田辺聖子",
 },
];

const users =[
 {
    id:1,
    firstname: "優香",
    lastname: "本田",
    email:"yuuka@example.com",
    favorit_id:1,
 },
 {
    id:2,
    firstname: "明美",
    lastname: "豊田",
    email:"akemi@example.com",
    favorit_id:2,
 },

]


const typeDefs = gql
type Book {
   id: Int
   title: String
   author: String
}
type User {
   id: Int
   firstname: String
   lastname: String
   email:String
   favoritBook: Book
}
   type Query {
   books: [Book]
   users: [User]   
}
;

// This define how to fetch the deta from the field in the schema
// test as key and fetch array books with using definistion, Book
const resolvers ={
    Query :{
        books : ()=> books,
        users : ()=>users,
    },
    User:{
        favoritBook:(parent) => books.find(book => book.id === parent.favorit_id ),
    },
}

const server = new ApolloServer({

    typeDefs,
    resolvers,
});

server.listen().then(({url})=>{
    console.log(`Server ready at ${url}`);
})