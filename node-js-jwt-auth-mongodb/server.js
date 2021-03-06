const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const postRoute = require('./app/routes/post.routes');
const userRoute = require('./app/routes/user.routes');
const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};
// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Rest of server.js code below
// -------------------- chat socket --------------------------------------
let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
const connectionString = 'mongodb+srv://tetsuo23:AKIRAn23@cluster0-ookjt.mongodb.net/Festival_Ivry_user?retryWrites=true&w=majority'
const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('user connected... again...');

  socket.on('new-message', (message) => {
    io.emit('new-message', message);
    console.log("Successfully emit");
  });
});

server.listen(port, () => {
  console.log(`started on port: ${port}`);
});
// -------------------- fin chat socket --------------------------------------
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

const db = require("./app/models");
const Role = db.role;
app.use('/users', userRoute);
app.use('/posts', postRoute);



db.mongoose
  // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to bezkoder application."
  });
});

// routes
require("./app/routes/auth.routes")(app);
// require("./app/routes/user.routes")(app);
// require("./app/routes/post.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "participant"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'participant' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}