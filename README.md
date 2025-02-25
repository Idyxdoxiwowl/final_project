# Jewelry Store - Final Project   (✿◡‿◡)

### Project Description
Jewelry Store is a web application for purchasing jewelry, developed using **Node.js (Express.js)** and **MongoDB (NoSQL)**.  
The project supports **user authentication**, **CRUD operations for orders**, **JWT tokens**, and **deployment on Render**.

---

## **Core Technologies**
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB (Mongoose)
- **Security:** JWT + bcrypt (password hashing)
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render / Railway / VPS

---

## **Installation and Local Setup**

### **1. Install Dependencies**
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/jewelry-store.git
cd jewelry-store
npm install
```

### **2. Configure Environment Variables**
Create a **`.env`** file in the project root:

```env
MONGO_URI=mongodb+srv://your_mongo_user:your_mongo_password@cluster.mongodb.net/jewelry_store
JWT_SECRET=your_secret_key
PORT=5000
```

### **3. Start the Server**
Run the following command to start the server:

```bash
node server.js
```
Or with Nodemon (if installed):

```bash
npm run dev
```

The server will be available at:  
`http://localhost:5000`

---

## **Project Structure**
```
/jewelry-store
│── /public         # Static frontend files (if applicable)
│── /routes         # Express route handlers
│── /models         # Mongoose schemas and models
│── server.js       # Main server file
│── .env            # Environment variables
│── package.json    # Dependencies and scripts
```

---

## **Database Schema**
The application consists of the following MongoDB collections:

### **Users Collection (`users`)**
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password"
}
```

### **Products Collection (`products`)**
```json
{
  "_id": "ObjectId",
  "name": "Gold Ring",
  "price": 250,
  "description": "Beautiful gold ring",
  "image": "gold-ring.jpg"
}
```

### **Orders Collection (`orders`)**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "products": [{ "productId": "ObjectId", "quantity": 2 }],
  "totalPrice": 500
}
```

---

## **API Documentation**

### **User Authentication**
#### **Register a New User**
`POST /api/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```
#### **Login User**
`POST /api/login`
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
**Response:**
```json
{
  "token": "your_jwt_token",
  "email": "john@example.com"
}
```

### **Products API**
#### **Get Random Products**
`GET /api/products`
```json
[
  {
    "_id": "ObjectId",
    "name": "Gold Ring",
    "price": 250,
    "description": "Beautiful gold ring",
    "image": "gold-ring.jpg"
  }
]
```

### **Orders API**
#### **Create Order**
`POST /api/orders` (Authorization Required: `Bearer token`)
```json
{
  "products": [
    { "productId": "ObjectId", "quantity": 2 }
  ]
}
```

#### **Update Order**
`PUT /api/orders/:id` (Authorization Required: `Bearer token`)
```json
{
  "products": [
    { "productId": "ObjectId", "quantity": 3 }
  ]
}
```

#### **Delete Order**
`DELETE /api/orders/:id` (Authorization Required: `Bearer token`)
```json
{
  "message": "Order deleted successfully"
}
```

---

## **Testing the API**
You can test the API using **Postman** or **cURL**.

Example request using `cURL`:
```bash
curl -X GET http://localhost:5000/api/products -H "Content-Type: application/json"
```

---

## **Deploying on Render**

### **1. Create an Account on [Render](https://render.com/)**
- Sign up using GitHub.

### **2. Upload the Code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/jewelry-store.git
git push -u origin main
```

### **3. Deploy on Render**
1. Go to [Render Web Services](https://dashboard.render.com/)
2. Click `New Web Service`
3. Select your GitHub repository
4. Set the following:
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     - `MONGO_URI=mongodb+srv://your_mongo_user:your_mongo_password@cluster.mongodb.net/jewelry_store`
     - `JWT_SECRET=your_secret_key`
5. Click `Deploy`
6. Once deployed, your API will be available at:
   ```
   https://jewelry-store.onrender.com
   ```

---

### **Project is fully ready for deployment and testing!**

## **Developers**
- Ayana Ussenbayeva
- Dariya Khussainova
- Dana Otepova

