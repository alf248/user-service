'use strict';

const { ApolloServer, gql } = require('apollo-server');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

var admin = require("firebase-admin");

var serviceAccount = require("./service-file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`

type User {
    id: String
    name: String
    offersMade: Int
    ordersMade: Int
}

type Query {
    getUser(id: String!): User
    getUserByName(name: String): User
    getAny: Int
    getStats(id: String!): String
    getSecrets: Int
}

type Mutation {
    setUserName(id: Int!, name: String!): String
}

`;


// Resolvers define the technique for fetching the types defined in the schema.
const resolvers = {

    Query: {
  
        getAny: () => {return null},

        getUser: (parent, args, context, info) => {
            return mockUsers[args.id]
        },
    
        getSecrets: () => {
            /*

            if (!context.token) {
                console.log("HEADER HAS NO TOKEN")

                return mockUsers[userId]
            }
            
            const token = context.token
            console.log("HEADER HAS TOKEN")

            // idToken comes from the client app
            return getAuth()
            .verifyIdToken(token)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                console.log("TOKEN OK: UID:", uid)
                return mockUsers[uid]
            })
            .catch((error) => {
                // Handle error
                console.log("TOKEN FAIL", error)
            });
            */

            return 1
        },

        getUserByName: ({name}) => {
            for (var key in mockUsers) {
                if (mockUsers[key].name == name) return mockUsers[key]
            }
            return null
        },
    
        getStats: () => {
            const x = {ordersMade: 1, offersMade: 2}
            return JSON.stringify(x)
        },
  
    },

    Mutation: {
        setUserName: ({id, name}) => {
            return mockUsers[id].name = name
        },
    }
  
};


class User {
    constructor(id, name) {
      this.id = id
      this.name = name
      this.offersMade = 3
    }

    ordersMade() {
        return 3
    }
}


var mockUsers = {
    "1": {name: "joe", age: 22, friends: ["mia", "lea"]},
    "2": {name: "mia", age: 33, friends: ["joe"]},
    "3": {name: "lea", age: 44, friends: ["kim, joe"]},
    "4": {name: "kim", age: 44, friends: ["lea"]},
    "Xh1RXSzRYqVzJ3cZVktb7X1Ec9x1": (new User("Xh1RXSzRYqVzJ3cZVktb7X1Ec9x1", "joe")),
    "X6pLU9PK5XObMKB6i6VimIHJPIn1": (new User("X6pLU9PK5XObMKB6i6VimIHJPIn1", "tester")),
}


const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cors: {
        credentials: true,
        origin: ["https://trader-cyan.vercel.app", "https://studio.apollographql.com", "http://localhost:3000"]
    },
    context: ({ req }) => {

        // Note: This example uses the `req` argument to access headers,
        // but the arguments received by `context` vary by integration.
        // This means they vary for Express, Koa, Lambda, etc.
        //
        // To find out the correct arguments for a specific integration,
        // see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
        
        // Get the user token from the headers.
        const token = (req.headers.authorization || '').replace('Bearer ','')

        // Add to context
        return { token };
      },
});





const port = parseInt(process.env.PORT) || 8080;
// The `listen` method launches a web server.
console.log("starting on port", port)

apolloServer.listen({port: port}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});