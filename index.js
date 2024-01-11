const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./user-api.yaml');

const app = express();
app.use(express.json());

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let users = [];
let products = [];
let orders = [];
let orderItems = [];


app.post('/api/users', (req, res) => {
  const { username, email } = req.body;
  const userId = users.length + 1;
  const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const updatedAt = createdAt;  

  const newUser = {
    userId,
    username,
    email,
    createdAt,
    updatedAt
  };

  users.push(newUser);

  res.json(newUser);
});


app.post('/api/products', (req, res) => {
  const { productName, price, stockQuantity } = req.body;
  const productId = products.length + 1;
  const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const updatedAt = createdAt;

  const newProduct = {
    productId,
    productName,
    price,
    stockQuantity,
    createdAt,
    updatedAt
  };

  products.push(newProduct);

  res.json(newProduct);
});

app.post('/api/orders', (req, res) => {
  const { userId, orderItems } = req.body;
  
   let totalAmount=0;
   for(let i=0;i<orderItems.length;i++){
       let product=products.find(p=>p.productId===orderItems[i].productId);
       totalAmount+=product.price*orderItems[i].quantity;
   }
  
   const orderId=orders.length+1;
   const orderDate=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
   const createdAt=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
   const updatedAt=createdAt;
  
   const newOrder={
       orderId,
       userId,
       totalAmount,
       orderDate,
       createdAt,
       updatedAt
   };
  
   orders.push(newOrder);
  
   for(let i=0;i<orderItems.length;i++){
       const {productId,quantity}=orderItems[i];
      
       const product=products.find(p=>p.productId===productId);
      
       const subtotal=product.price*quantity;
      
       const orderItemId=orderItems.length+1;
      
       const newOrderItem={
           orderItemId,
           orderId,
           productId,
           quantity,
           subtotal,
           createdAt,
           updatedAt
       };
      
      orderItems.push(newOrderItem);
  }
  
  const response = {
    ...newOrder,
    orderItems: orderItems.filter(item => item.orderId === newOrder.orderId)
  };

  res.json(response);
});


app.get('/api/users/:userId/orders', (req, res) => {
  const { userId } = req.params;

  const user = users.find(user => user.userId === parseInt(userId));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userOrders = orders.filter(order => order.userId === parseInt(userId));

  const response = {
    ...user,
    orders: userOrders.map(order => ({
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }))
  };

  res.json(response);
});


app.get('/api/orders/:orderId/items', (req, res) => {
  const { orderId } = req.params;

  const order = orders.find(order => order.orderId === parseInt(orderId));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const orderItemsList = orderItems.filter(item => item.orderId === parseInt(orderId));

  const response = {
    ...order,
    orderItems: orderItemsList.map(item => ({
      orderItemId: item.orderItemId,
      productId: item.productId,
      productName: products.find(product => product.productId === item.productId).productName,
      quantity: item.quantity,
      subtotal: item.subtotal
    }))
  };

  res.json(response);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});