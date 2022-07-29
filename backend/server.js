//In this server.js I created a basic server...
//Like the port I want to listen for my Backend server...
//But Remember here I didn't created my `dataBase or dataBase-connection`, I created my dataBase Connection using `mongoose` in dataBase.js.
const app = require("./app");

const { connectDatabase } = require("./config/database");

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
