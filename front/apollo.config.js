module.exports = {
    client: {
        includes: ['gql/operations/**/*'],
        service: {
            name: 'taskity',
            localSchemaFile: './gql/schema.graphql'
        }
    }
};