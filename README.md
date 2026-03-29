# 🍔 BiteRush – Real-Time MERN Food Delivery Platform

BiteRush is a full-stack MERN-based food delivery application that enables seamless interaction between Customers, Shop Owners, and Delivery Partners with real-time order tracking and concurrency-safe order assignment.

It is designed with scalability, real-time communication, and production-level backend architecture in mind.

---

## 🚀 Features

### 👤 Multi-Role Authentication
- Customer
- Shop Owner
- Delivery Partner
- JWT-based authentication
- Role-based route protection (RBAC)

---

### 🛒 Customer
- Browse restaurants by city
- Add items to cart
- Place orders
- Real-time order status updates
- Live delivery tracking

---

### 🏪 Shop Owner
- Add / Edit / Delete food items
- Manage incoming orders
- Update order status

---

### 🛵 Delivery Partner
- View available orders in same city
- Accept orders
- Real-time updates
- Live location sharing

---

## ⚡ Real-Time Architecture

- Orders broadcasted using Socket.IO
- First delivery partner to accept gets the order
- Atomic MongoDB update prevents duplicate assignment
- Customers receive instant updates
- Live tracking via WebSockets

---

## 🧠 Concurrency Handling (Race Condition Fix)

To prevent multiple delivery partners from accepting the same order:

- Order status is verified before assignment
- MongoDB atomic update ensures only one successful assignment
- Rejected response for simultaneous invalid attempts
- Maintains data integrity and consistency

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

---

## 📂 Project Structure

BiteRush/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

git clone https://github.com/your-username/biterush.git  
cd biterush  

---

### 2️⃣ Backend Setup

cd backend  
npm install  
npm run dev  

Create a `.env` file inside backend folder:

PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  

---

### 3️⃣ Frontend Setup

cd frontend  
npm install  
npm start  

---

## 🔐 Authentication Flow

1. User registers (Customer / Shop Owner / Delivery Partner)
2. Password hashed using bcrypt
3. JWT token generated
4. Protected routes validated via middleware
5. Role-based authorization enforced

---

## 📈 Future Improvements

- Payment Gateway Integration (Stripe / Razorpay)
- Ratings & Reviews
- Admin Dashboard
- Docker Deployment
- AWS Deployment
- Mobile App Version

---

## 🎯 Learning Outcomes

- Advanced MERN stack architecture
- Real-time systems with Socket.IO
- Handling race conditions in distributed systems
- Role-based authentication & authorization
- Scalable backend design

---

## 👨‍💻 Author

Siddharth Singh  
B.Tech CSE – Graphic Era Hill University  
Email: mehraprema8@gmail.com  
