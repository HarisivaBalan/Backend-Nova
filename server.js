const app=require('./app');
const path=require('path');
const connectDb = require('./config/database');
const { error } = require('console');


connectDb();
 const server =app.listen(process.env.PORT,()=>
console.log(`Server listenting to the port ${process.env.PORT} in ${process.env.NODE_ENV}`)
);


//Handling Unhandled Rejection
process.on('unhandledRejection',(err)=>
{
    console.log(`Error:${err.message}`)
    console.log("Shutting down the server due to unhandled rejection")
    server.close(()=>
    {
        process.exit(1);
    });
    
})


process.on('uncaughtException',(err)=>
{
    console.log(`Error:${err.message}`)
    console.log("Shutting down the server due to uncaught exception error")
    server.close(()=>
    {
        process.exit(1);
    });

})
module.exports = async (context, req, res) => {
  res.status(200).send("Hello from Catalyst backend!");
};
