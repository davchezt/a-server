const express     = require("express"),
      app         = express(),
      http        = require("http").Server(app),
      io          = require("socket.io")(http),
      morgan      = require("morgan"),
      bodyParser  = require("body-parser"),
      mongoose    = require("mongoose"),
      path        = require("path"),
      md5         = require("md5");

Object.assign = require('object-assign');
Date.prototype.toUnixTime = function() {
  return (this.getTime() / 1000) | 0;
};
Date.time = function() {
  return new Date().toUnixTime();
};

// Helper & Config
const log = require("./helpers/loger");
const config = require("./config.json");
const request = require("./utils/request");

app.engine('html', require('ejs').renderFile);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

process.env.JWT_KEY = config.jwtk;
const isDev = config.mode === "development" ? true : false;
process.env.MONGO_URL = isDev ? config.db.local : config.db.remote;

let port      = process.env.PORT || config.port,
    ip        = process.env.IP   || config.host,
    mongoURL  = process.env.MONGO_URL;
let db        = null,
    dbDetails = new Object();

mongoose.set("useCreateIndex", true);
mongoose.connect(mongoURL, { useNewUrlParser: true }, (err, conn) => {
  if (err) { log.error('Error in connection: ' + err); return; }
  
  db = conn;
  dbDetails.databaseName = db.databaseName;
  dbDetails.url = mongoURL.replace('davchezt:4Bahagia4', 'xxx:xxx');
  dbDetails.type = 'MongoDB';
  dbDetails.remote = !isDev;
});
mongoose.Promise = global.Promise;

// Routers
const indexControllers = require("./routes/index");
const chatsControllers = require("./routes/chat");
const roomsControllers = require("./routes/room");
const notifControllers = require("./routes/notify");

// app.use(morgan("dev"));
// app.use(morgan('combined'));
app.use(morgan('combined', {
  skip: (req, res, next) => { return res.statusCode < 400 }
}));

// Middleware
const requestMiddleware = (req, res, next) => {
  req.requestTime = Date.now();
  req.io = io;
  res.db = db; // for using without mongoose
  res.dbDetails = dbDetails;
  next();
}

app.use(requestMiddleware);
app.use("/uploads", express.static("uploads"));
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("json spaces", 2); // pretty print

app.use("/", indexControllers);
app.use("/chat", chatsControllers);
app.use("/room", roomsControllers);
app.use("/feed", notifControllers);

// Socket chat
let clients = [],
    in_room = [],
    rooms   = [];
const Chat = require("./models/chat");
io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        id_user: io.sockets.sockets[id].userId
      });
    });
    // Out Room
    Object.keys(in_room).forEach(function(id) {
      if (in_room[id] == socket.userId) in_room.splice(id, 1);
      io.sockets.in(rooms[id]).emit('out-room', { room: in_room, userId: socket.userId });
    });
    // // Leave Room
    // if (rooms.length !== 0) {
    //   Object.keys(rooms).forEach(function(id) {
    //     // emit leave
    //     io.sockets.in(rooms[id]).emit("user", { room: rooms[id], event: "leave" });
    //     socket.leave(rooms[id]);
    //   });
    // }
    io.emit("user", { user: clients, event: "offline" });
  });

  // ROOM
  socket.on("subscribe", function(room) { // Create or join room
    if (rooms.length === 0) {
      rooms.push(room);
    } else {
      Object.keys(rooms).forEach(function() {
        if (rooms.indexOf(room) === -1) rooms.push(room);
      });
    }
    io.sockets.in(room).emit("user", { room: room, event: "join" });
    socket.join(room);
  });

  socket.on("unsubscribe", function(room) { // Leave room
    Object.keys(rooms).forEach(function(id) {
      if (rooms[id] === room) rooms.splice(id, 1);
    });
    io.sockets.in(room).emit("user", { room: room, event: "leave" });
    socket.leave(room);
  });

  socket.on("online", function(userId) {
    socket.userId = userId;
    clients = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
      clients.push({
        id: id,
        id_user: io.sockets.sockets[id].userId
      });
    });
    io.emit("user", { user: clients, event: "online" });
  });

  // socket.on("send", function(data) { // Send message on room
  //   data.created =  Date.time();
  //   data._id = "5c48b6160ddd4815845cc9a3";
  //   io.sockets.in(data.room).emit("message", { chat: data, "room": data.room });
  // });

  socket.on('in-room', (data) => {
    if (in_room.length === 0) {
      in_room.push(data.userId);
    } else {
      Object.keys(in_room).forEach(function() {
        if (in_room.indexOf(data.userId) === -1) in_room.push(data.userId);
      });
    }
    io.sockets.in(data.room).emit('in-room', { room: in_room, userId: data.userId });
  });

  socket.on('out-room', (data) => {
    Object.keys(in_room).forEach(function(id) {
      if (in_room[id] == data.userId) in_room.splice(id, 1);
    });
    io.sockets.in(data.room).emit('out-room', { room: in_room, userId: data.userId });
  });

  socket.on("start-typing", (data) => {
    io.sockets.in(data.room).emit("start-typing", { room: data.room, user: data.form });
  });
  socket.on("stop-typing", (data) => {
    io.sockets.in(data.room).emit("stop-typing", { room: data.room, user: data.form });
  });
  // END ROOM
});

// Handle 404
app.use((req, res, next) => {
  const error = new Error("Error 404");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
  log.error("get " + error.message);
});

http.listen(port, ip, () => {
  log.success('listening at ' + ip + ' port: ' + port);
  // console.log(md5("DaVchezt.4bahagia"));
  // let user = request.get('nama/1');
});

module.exports = app;