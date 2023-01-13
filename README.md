# NestJS Social Post API

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

This api allows the consumer to perform the following actions and Is fully documented using swagger.

1. Register a new user
2. Login with JWT
3. Create a new post
4. Get all posts
5. Get a single post
6. Update a post
7. Delete a post
8. Like and Unlike a post
9. Follow and Unfollow a user
10. Delete a post media

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them.

- [Node.js](https://nodejs.org/en/)
- [NestJS](https://nestjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)

### Installing

A step by step series of examples that tell you how to get a development env running.

```bash
# Clone the repository
git clone

# Install dependencies
npm install

# Create a .env file and add the following variables
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public
# JWT_SECRET=your_secret_key

# Run the migrations
npx prisma migrate dev --name init

# Run the app
npm run start:dev
```

## Usage <a name = "usage"></a>

You can visit the swagger documentation at [http://localhost:3000/api](http://localhost:3000/api) to test the api endpoints.

> Note: You can only access the swagger documentation when the app is running.`
