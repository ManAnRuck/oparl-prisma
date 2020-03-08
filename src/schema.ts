import { nexusPrismaPlugin } from 'nexus-prisma'
import { idArg, makeSchema, objectType, stringArg } from 'nexus'

const Organization = objectType({
  name: 'Organization',
  definition(t) {
    t.model.id()
    t.model.type()
    t.model.name()
    t.model.shortName()
    t.model.post()
    t.model.subOrganizationOf()
    t.model.organizationType()
    t.model.classification()
    t.model.startDate()
    t.model.endDate()
    t.model.website()
    t.model.license()
    t.model.keyword()
    t.model.created()
    t.model.modified()
    t.model.web()
    t.model.deleted()
  },
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.organization()
    t.crud.organizations()
  },
})

export const schema = makeSchema({
  types: [Query, Organization],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('./context'),
        alias: 'Context',
      },
    ],
  },
})
