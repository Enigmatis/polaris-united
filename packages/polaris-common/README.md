![Small Logo](static/img/polaris-logo.png)

# polaris-common

[![Build Status](https://travis-ci.com/Enigmatis/polaris-united.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-common)
[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-common.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-common)

This library offers you common classes and interfaces used in polaris.

### PolarisRequestHeaders

This interface represents the headers of a polaris graphql request.

-   dataVersion(_number - Optional_) - the data version to filter with.
-   includeLinkedOper(_boolean - Optional_) - indicates if should filter linked data from reality zero.
-   requestId(_string - Optional_) - id of the request. if not given then it's generated.
-   realityId(_number - Optional_) - the reality id to filter with.
-   requestingSystemId(_string - Optional_) - the id of the system that made the request.
-   requestingSystemName(_string - Optional_) - the name of the system that made the request.
-   upn(_string - Optional_) - the id of the client that made the request.

### PolarisResponseHeaders

This interface represents the returned headers from a request to a polaris based data service.
It contains realityId, requestId and upn.

### PolarisBaseContext

This interface represents the base context, it contains request (``PolarisRequestHeaders``) and response (``PolarisResponseHeaders``) headers (specified above) and the client ip.

### PolarisExtensions

This interface represents the extensions polaris adds to the clients' response.
It contains the data version of the data service, and the irrelevant entities on the request that was sent.

### PolarisGraphQLRequest

This interface represents all relevant data of the request. It contains query, variables, and operation name.

### PolarisWarning

This interface represents the warnings you can add to the request. A warning contains a message and its path.

### PolarisGraphQLContext

This interface wraps `PolarisBaseContext` and adds the client's request, and the response, returned extensions, errors and warnings received from the data service specific to that request.

### ApplicationProperties

This interface represents your application properties. It contains:

-   id (_string - Optional_) - the id of the application.
-   name (_string - Optional_) - the name of the application.
-   version (_string - Optional_) - current version of the application.
-   environment (_string - Optional_) - the environment you are running your application on.
-   component (_string - Optional_) - name of your part in your system.

### Common Methods

runAndMeasureTime - gets runnable, returns an object which contains the time it took to run the runnable in milliseconds and its response.
