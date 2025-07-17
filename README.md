# 📚 Books Review

A simple web-based books review site that allows users to add and view books review. Created as a personal project to learn full-stack web development.

🔗 **Live Demo**: [https://books-review-production-4e3d.up.railway.app/](https://books-review-production-4e3d.up.railway.app/)

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, EJS (Embedded JavaScript Templates)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Deployment**: Railway

---

## ✨ Features

- View list of books and reviews
- Add new reviews
- View review details
- Simple and responsive design

---

## 🚀 Run Locally

1. **Clone repo:**

   ```bash
   git clone https://github.com/irfanhadiProject/books-review.git
   cd book-reviews

   ```

2. **Install dependencies:**

   ```bash
   npm install

   ```

3. **Set up PostgreSQL database & environment:**

   - Create a new database
   - Set up the .env file

4. **Example .env file**

   ```bash
   PORT=3000
   API_URL=https://covers.openlibrary.org/b/isbn

   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=bookreview
   DB_PASSWORD=your_password
   DB_PORT=5432

   ```

5. **Start the server**

   ```bash
   npm start

   ```

6. **Open in browser**

   ```bash
   http://localhost:3000

   ```

7. **Folder structure:**
   - books-review/
   - ├── public/ # Static files accessible by the browser
   - │ ├── assets/ # Static assets like images, book covers, logos, etc.
   - │ ├── js/ # Client-side JavaScript files
   - │ └── style/ # CSS stylesheets for styling the frontend
   - │
   - ├── views/ # EJS templates rendered by the server
   - │ ├── pages/ # Main page templates (e.g., home, book details, etc.)
   - │ └── partials/ # Reusable components (e.g., header, footer, navbar)
   - │
   - ├── controllers/ # Handles business logic for each route
   - │ └── bookController.js # Example controller for book-related logic
   - │
   - ├── middleware/ # Custom Express middleware (e.g., logging, auth)
   - │ └── authMiddleware.js # Example middleware for request logging
   - │
   - ├── models/ # Data models or schemas
   - │ └── bookModel.js # Example model representing a book
   - │
   - ├── routes/ # Route definitions that connect URLs to controllers
   - │ └── bookRoutes.js # Example routes for book-related endpoints
   - │
   - ├── utils/ # Utility/helper functions used across the app
   - │ └── imageUtils.js # Example utility to format dates
   - │
   - ├── index.js # Main entry point of the Express server
   - └── package.json # Project metadata and dependencies
