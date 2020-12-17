![Small Logo](static/img/polaris-logo.png)

# polaris-schema

[![Build Status](https://travis-ci.com/Enigmatis/polaris-schema.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-schema)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-schema.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-schema)

#### Install

```
npm install @enigmatis/polaris-schema
```

### Overview

This library helps you set all the fundamental definitions of polaris based schema.

#### PageConnection<ENTITY>

This interface represents generic connection type(of type <ENTITY>) to use when implementing an online pagination - it
contains `pageInfo` and `edges` fields which determines our page structure and data it will contain.
Below will be more explanation about these fields and usage.

#### PageInfo

This interface represents a metadata-like information about our current page when executing an online pagination.
It may contains information like `startCursor` and `endCursor` of our page and whether it `hasNextPage` and `hasPreviousPage`.

#### Edge<ENTITY>

This interface represents generic edge type(of type <ENTITY>).
Basically, edge refers to a single record in our page, each record like this contains the record's `cursor`
and the record's `node` as well.
`node` eventually is our real entity with the fields that we defined in our graphql schema. 

#### RepositoryEntityTypeDefs

This member is the actual graphql interface type definition that consists of all of the `RepositoryEntity` properties
explained above.

#### ScalarsTypeDefs & ScalarsResolvers

All of the scalars supported by polaris-schema.

#### ExecutableSchemaCreator

This class will combine the type defs and resolvers offered by user, with polaris-schema repository entity and scalars,	
to one executable schema.