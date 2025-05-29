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
   
2. **Install dependencies:**
   ```bash
   npm install
   
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

5. **Start the server**
   ```bash
   npm start

6. **Open in browser**
   ```bash
   http://localhost:3000

7. **Folder structure:**
      - books-review/
      - ├── public/            # Static files accessible by the client (served directly)
      - │   ├── assets/        # Static assets like book covers, logos, etc.
      - │   ├── js/            # Client-side JavaScript files
      - │   └── style/         # CSS stylesheets for styling the frontend
      - ├── views/             # EJS templates or HTML views rendered by the server
      - └── index.js           # Main server entry point (Express.js application)
