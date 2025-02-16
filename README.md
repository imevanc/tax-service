# Tax Service

## Description

Tax Service is an API built with Express, PostgreSQL, and TypeScript. It provides endpoints to manage transactions,
calculate tax positions, and amend sales.

## Features

- Ingest transactions
- Calculate tax positions
- Amend sales
- Generate test data

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/imevanc/tax-service.git
   cd tax-service

2. Install dependencies:  
   ```npm install```

3. Set up environment variables:
    - Create a .env file in the root directory and add the necessary environment variables.
    - See .local.env

4. Build the project:  
   ```npm run build```

## Usage

1. Development
   To start the development server with hot-reloading:
   ```npm run dev```

2. Production
   To start the production server:
   ```npm run start```

The project runs on port 3000.

## Swagger UI

You can use open-swagger-ui to see the Swagger file on port 3355.

## Database

The database is deployed on render.com and uses PostgreSQL.

## Running Tests

The tests run as GitHub Actions.

1. To run unit tests locally:
   ```npm run test:unit```
2. To check TypeScript types:
   ```npm run test:type```
3. To run tests with coverage:
   ```npm run test:coverage```

## License

This project is licensed under the [MIT License](./LICENSE).