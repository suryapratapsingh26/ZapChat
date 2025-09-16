# ZapChat - Real-Time Chat Application

A real-time chat application with a React frontend and a Node.js backend. It provides secure user authentication via JSON Web Tokens and instant messaging powered by WebSockets, with all data persisted in MongoDB.

## Features

- **Real-Time Messaging:** Instant message delivery using Socket.IO.
- **User Authentication:** Secure sign-up, login, and logout functionality with JWT-based sessions.
- **OTP Verification:** Email-based One-Time Password verification for new user registration and password resets, powered by Nodemailer and Google OAuth2.
- **Profile Customization:** Users can update their profile pictures.
- **Image Uploads:** Performant, non-blocking image uploads to Cloudinary handled by Node.js worker threads.
- **Online User Status:** See which users are currently online.
- **Responsive UI:** A clean and modern user interface built with React.

## Tech Stack

### Backend
- **Node.js** & **Express.js**: For the server-side application logic.
- **MongoDB** & **Mongoose**: For the database and object data modeling.
- **Socket.IO**: For enabling real-time, bidirectional communication.
- **JSON Web Token (JWT)**: For secure user authentication.
- **Nodemailer (with Gmail OAuth2)**: For sending OTP and password reset emails.
- **Cloudinary**: For cloud-based image storage.
- **bcryptjs**: For hashing user passwords.

### Frontend
- **React**: For building the user interface.
- **Vite**: As the frontend build tool.

## Local Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/suryapratapsingh26/ZapChat.git
    cd ZapChat
    ```

2.  **Install dependencies for both frontend and backend:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    - Create a `.env` file in the `backend` directory and add the required variables (e.g., `MONGODB_URI`, `JWT_SECRET`, Gmail OAuth credentials, etc.).

4.  **Run the application:**
    ```sh
    npm start
    ```