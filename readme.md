https://app.visily.ai/

<!-- Folder structure -->
Edunutshell_Backend/
│── src/
│   ├── config/          # DB connection, JWT secrets, etc.
│   │   └── db.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── TaskStatus.js
│   │   ├── Form.js
│   │   ├── Resource.js
│   │   └── Ticket.js
│   ├── routes/          # Express routes
│   │   ├── userRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── formRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── ticketRoutes.js
│   ├── controllers/     # Route logic
│   │   ├── userController.js
│   │   ├── taskController.js
│   │   ├── formController.js
│   │   ├── resourceController.js
│   │   └── ticketController.js
│   ├── middleware/      # Auth, validation, etc.
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/           # helper functions (jwt, mail, etc.)
│   ├── server.js        # Express app
│   └── app.js           # Middleware + route mounting
│── package.json
│── .gitignore
│── .env



