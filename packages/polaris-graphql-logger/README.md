![Small Logo](static/img/polaris-logo.png)

# polaris-graphql-logger

[![Build Status](https://travis-ci.com/Enigmatis/polaris-graphql-logger.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-graphql-logger)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-graphql-logger.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-graphql-logger)

#### Install

```
npm install polaris-graphql-logger
```

### Overview

This library organizes and defines everything that wrapped around using a classic graphql logger.

#### GraphQLLogProperties

This interface defines the graphql log properties that can be logged whenever the logger is called.
This interface extends the `PolarisLogProperties` that `polaris-logs` library offers.
The properties that `GraphQLLogProperties` adds in addition is:

-   operationName(_string - Optional_): the name of the requested graphql operation.

#### GraphQLLogger

This interface defines all of the logging level options that available in the graphql logger.
It provides the usual methods of logger, such as `warn`, `error`, `fatal`, `info`, `trace` and `debug`.

#### PolarisGraphQLLogger

This class is the official graphql logger that polaris offers. it extends the `GraphQLLogger` interface explained above
and supports the logging levels that mentioned above, the same as `GraphQLLogger`.
