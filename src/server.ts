import { GraphQLServer } from 'graphql-yoga'
import { schema } from './schema'
import { createContext } from './context'
import { startImport } from './import'

new GraphQLServer({ schema, context: createContext }).start(() => {
  console.log(`🚀 Server ready at: http://localhost:4000`)
  startImport()
})
