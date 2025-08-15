const express = require('express');
const app= express();
const errorMiddleWare=require('./middlewares/error')
const auth=require('./routes/auth')
const cookieParser=require('cookie-parser');
const path =require('path')
const dotenv = require('dotenv');
dotenv.config({path:path.join(__dirname,"config/config.env")})
//Allowing the data in the format of JSON
app.use(express.json());


//Cookie to be parsed for the products
app.use(cookieParser());
const products = require ('./routes/product')
const order=require('./routes/order')
const payment=require('./routes/payment')
const otp=require('./routes/otp');
//middleware for products
app.use('/api/v1/',products)
//middlewares for authentications
app.use('/api/v1/',auth)
app.use('/api/v1/',order)
app.use('/api/v1/',payment)
app.use('/api/v1/',otp)

app.use('/uploads',express.static(path.join(__dirname,'/uploads')))
const allowedOrigins = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'https://novamart-two.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

//Allow Any Port to accept the data
// const cors = require('cors');
// app.use(cors({
//     origin: ['http://127.0.0.1:3000', 'http://localhost:3000','https://novamart-two.vercel.app'],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));

app.use(
    "/images",
    express.static(path.join(__dirname, "public/images"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".webp")) {
          res.setHeader("Content-Type", "image/webp");
        }
      },
    })
  );
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

  
app.use("/images", express.static(path.join(__dirname, "public/images")));
if(process.env.NODE_ENV==="production")
{
  app.use(express.static(path.join(__dirname,'../fronte/build')));
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'../fronte/build/index.html'))
  })
}
app.get("/", (req, res) => {
  res.send("Hello from Express App");
});
app.use(errorMiddleWare)
module.exports = app;
