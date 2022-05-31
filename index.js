'use strict';

const { ApolloServer, gql } = require('apollo-server');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

var admin = require("firebase-admin");
var mongo = require("./mongo")
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
    email: String
    offersMade: Int
    ordersMade: Int
}

type Query {
    getSelf: User
    getUser(fid: String!): User
    getUserByName(name: String!): User
    getUserByFID(fid: String!): User
    delete(fid: String!): Int

    getAny: Int
    getStats(id: String!): String
    getSecrets: Int
}

type Mutation {
    setEmail(fid: Int!, email: String!): String
}

`;


// Resolvers define the technique for fetching the types defined in the schema.
const resolvers = {

    Query: {

        getSelf: (parent, args, context, info) => {

            if (!context.token) {
                console.log("HEADER HAS NO TOKEN")
            }
            
            const token = context.token
            console.log("HEADER HAS TOKEN")
            
            // idToken comes from the client app
            return getAuth()
            .verifyIdToken(token)
            .then(async (decodedToken) => {
                const uid = decodedToken.uid;
                const email = decodedToken.email;
                var u = await mongo.getUser({ fid: uid })
                u.email = email
                u.fid = uid
                return u
            })
            .catch((error) => {
                
            });
        },

        getUser: (parent, args, context, info) => {
            console.log("GET USER ", args.fid)
            return mongo.getUser({ fid: args.fid })
        },
    
        getUserByName: (parent, args, context, info) => {
            return mongo.getUser({ name: args.name })
        },

        getAny: () => {return null},

        getStats: () => {
            const x = {ordersMade: 1, offersMade: 2}
            return JSON.stringify(x)
        },
  
    },

    Mutation: {
        setEmail: ({id, name}) => {
            return mockUsers[id].name = name
        },
    }
  
};



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