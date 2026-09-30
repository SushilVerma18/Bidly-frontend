# 🚀 Bidly — Real-Time Auction Platform (Frontend)

Bidly is a modern **real-time auction platform** where users can list products, place bids, and participate in competitive online auctions.

This repository contains the **frontend application** of Bidly, built with **React.js, Vite, and Tailwind CSS**.

## ✨ Features

* 🔐 User authentication
* 👤 User registration and login
* 🛍️ Browse auction products
* 🔎 Search and explore products
* 🖼️ Product image gallery
* 📋 Auction product details
* 💰 Place bids
* ⏱️ Real-time auction countdown
* 📊 Display current highest bid
* ❤️ Add products to wishlist
* 📱 Responsive design
* 🎨 Modern UI with Tailwind CSS
* 🔗 Integration with Bidly REST APIs
* ⚡ Fast development with Vite

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Tailwind CSS**
* **Vite**

### API & Authentication

* REST APIs
* JWT Authentication
* Axios / Fetch API

### Development Tools

* Git
* GitHub
* VS Code
* npm

## 📂 Project Structure

```text
Bidly-Frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
```

### 2. Navigate to the project

```bash
cd Bidly-Frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=<YOUR_BACKEND_API_URL>
```

Replace the value with your deployed Bidly backend URL.

### 5. Start the development server

```bash
npm run dev
```

The application will run locally on:

```text
http://localhost:5173
```

## 🔗 Backend

Bidly's frontend communicates with a separate **Spring Boot backend** through REST APIs.

**Backend Repository:**
https://github.com/io303/Real-Time-Auction-Platform/tree/main


## 🌐 Live Demo

**Live Frontend:**
https://bidly-frontend-8ysq.onrender.com

## 🔐 Authentication Flow

Bidly uses **JWT-based authentication**.

```text
User Login
    ↓
Frontend sends credentials
    ↓
Spring Boot Backend
    ↓
JWT Token Generated
    ↓
Token stored on Client
    ↓
Authenticated API Requests
```

Protected requests include the JWT token in the authorization header.

## 🎯 Main User Flow

```text
Register / Login
       ↓
Browse Auctions
       ↓
Select Product
       ↓
View Auction Details
       ↓
Place Bid
       ↓
Highest Bid Updated
       ↓
Auction Ends
       ↓
Winner Determined
```

## Screen Shot

<img width="1897" height="1200" alt="Screenshot 2026-08-17 140620" src="https://github.com/user-attachments/assets/f389074d-ba69-4e92-af89-cefea0be0329" />
<img width="1920" height="1200" alt="Screenshot 2026-08-24 174857" src="https://github.com/user-attachments/assets/af53c6a3-2b04-4375-ab1a-ae9305743dbe" />

<img width="1893" height="1200" alt="Screenshot 2026-08-17 142053" src="https://github.com/user-attachments/assets/d8817f7f-fcc5-4c0a-a509-4e0d1b32b350" />
<img width="1895" height="1200" alt="Screenshot 2026-08-17 140656" src="https://github.com/user-attachments/assets/884bb7ac-eab4-4238-bb90-a193468a93fe" />
<img width="1902" height="1200" alt="Screenshot 2026-08-17 140642" src="https://github.com/user-attachments/assets/ef795eda-fe06-41ab-a900-482af3533ac3" />
<img width="1897" height="1200" alt="Screenshot 2026-08-21 134310" src="https://github.com/user-attachments/assets/0a99cda8-a325-4da6-a4fb-591983b152e2" />
<img width="1900" height="1200" alt="Screenshot 2026-08-21 134221" src="https://github.com/user-attachments/assets/bd5f3ad5-75ff-4867-87d2-cbea4d485a60" />
## 🚀 Deployment

The frontend can be deployed using platforms such as:

* Vercel
* Netlify

For production deployment, configure the backend API URL through environment variables.

## 📌 Future Improvements

* 🔴 WebSocket-based live bidding
* 🔔 Real-time bid notifications
* 💳 Online payment integration
* 📧 Email notifications
* 🏆 Auction winner dashboard
* 📈 User bidding history
* 🛡️ Advanced admin dashboard
* 🌙 Dark mode
* 📱 Progressive Web App support

## 👨‍💻 Author

**[Sushil Verma]**

BTech Information Technology Student
Interested in **Java, Spring Boot, React.js, DSA & Full-Stack Development**


---

⭐ If you found this project interesting, consider giving the repository a **star**!

**Bidly — Bid. Compete. Win. 🏆**
