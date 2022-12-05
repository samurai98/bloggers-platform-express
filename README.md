# bloggers-platform-express

Main technologies: **`Express`**, **`MongoDB`**, **`Mongoose`**, **`JsonWebToken`**, **`bcrypt`**, **`Nodemailer`**, **`Jest`**.

This is back-end application on Express, which implements next functionality:
- CRUD for entities: 
    - `blogs`
    - `posts` (+ `likes/dislikes`)
    - `comments` (+ `likes/dislikes`)
    - `users`
- implemented users registration and authorization using `JWT-tokens` (access token in body and refresh token in cookie)
- some of the functions are implemented through confirmation by user `email`: confirmation of registration, reset password, notification admin about application crash
- user can view and manage their `active sessions` (devices)
- written `end-to-end tests` using `Jest` and `Supertest`

Application deployed on Vercel and is located [here](https://bloggers-platform-express.vercel.app/)

## How to test it

1. Download the [POSTMAN.json](./POSTMAN.json) file
2. Import it into your Postman
3. Add environment variables BASE_URL and JWT:
    | VARIABLE | VALUE |
    | -------- | ----- |
    | BASE_URL | https://bloggers-platform-express.vercel.app |
    | JWT | enter after login |
