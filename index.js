module.exports = function AppServer() {
  'use strict';
  
var servertype = process.env.SERVERTYPE || "http"; //https
var app, server;
var sio, sioport = 3166, port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
logger.info("server ip address: " + JSON.stringify(ipAddress));
logger.info("configure express server for: " + servertype);

// express app
app = express();
app.use(compression());
app.use(cors());
app.options('*', cors());

console.log("process.env.NODE_ENV = " + process.env.NODE_ENV);
// if (process.env.NODE_ENV === "production") {
// configure server for client upload
app.use(serveStatic(__dirname + "/dist"));
// }
server = http.createServer(app);
server.listen(port, () => {
  logger.info('HTTP server running on port ' + port);
});

// REDIRECT TO HTTPS
// app.use(function(req, res, next) {
//   var reqType = req.headers["x-forwarded-proto"];
//   reqType == 'https' ? next() : res.redirect("https://" + req.headers.host + req.url);
// });

sio = socket.listen(server, {
  //serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  //cookie: false
  });
//sio.origins('*:*');

logger.info(`SOCKET.IO server ready for communication on port ${sioport}`);
//sio.listen(sioport);

//-- add socket handling
sio.on("connection", socket => {
    logger.info("sio new connection from socket id: " + socket.id);
    // mist socket.emit("hi", {id: socket.id, room: 1});
    // console.log(">>> print socket object");
    // inspect(socket);
    // console.log(">>> print socket adapter");
    // inspect(socket.adapter);
    // console.log(">>> print socket client");
    // inspect(socket.client);
    // console.log(">>> print socket handshake");
    // inspect(socket.handshake);
//NOK console.log("socket : " + JSON.stringify(client, null, 4));
   	// Listen for client disconnected
    // socket.on("disconnect", onClientDisconnect);
    socket.on("serverstatus", onServerStatus);
    socket.on("createUser", onCreateUser);
    socket.on("joinRoom", onJoinRoom); // sends startGame to users
    socket.on("joinRoomAsKibitz", onJoinRoomAsKibitz);
    socket.on("changeNumCards", onChangeNumCards); // changeNumCards and startGame to users
    socket.on("moveToStack", onMoveToStack); // sends moveCard to players
    socket.on("moveToOwnStack", onMoveToOwnStack); // sends moveCardAndSwitchPlayer to players
    socket.on("flipCard", onFlipCard); // sends useDeck to players
    socket.on("sendDeck", onSendDeck); // sends useDeck to players
    socket.on("switchStack", onSwitchStack); // sends switchStack to players
    socket.on("gameOver", onGameOver); // sends gameOver to loser
    socket.on("automode", onAutomode); // sends automode to players
    socket.on("newGame", onNewGame); // sends startGame to players
    socket.on("signout", onPlayerSignedOut);
    socket.on("whosonline", onWhosOnline);
    socket.on("sendmessage", function(username, tablename, data) {
      var now = new Date();
      var timestamp = now.format("hh:mm:ss");
      logger.info("sendmessage to players on: " + tablename + ", from: " + username + " " + timestamp + " broadcast chat: " + data + " to room " + tablename);
        sio.in(tablename).emit("updatechat", username, timestamp, data);
      });

    const exitEvents = ["leftGame", "disconnect"];
    exitEvents.forEach((event) => {
      socket.on(event, () => {
        logger.info("got exit event for user " + socket.id + " event = " + event);
        if ( usersDB.getUser(socket.id) ) {
          let id = socket.id;
          let user = usersDB.getUser(id);
          if (!user) return;
          logger.info("got exit event for user data = " + JSON.stringify(user));
          const { room, name } = user;
          usersDB.removeUser(id);
          socket.leave(room);
          // // if 
          // delete tables[room];
          // tables[room] = {id: id, tablefree: true};
          if (!user.guest) {
            // player left
            logger.info("got exit event for use, emit playerLeftGame to : " + JSON.stringify(usersDB.getUsersByRoom(room)));
            sio.to(room).emit("playerLeftGame", user);
            // sio.to(room).emit(
            //   "newMessage",
            //   new Message("admin", `User ${name} left 66chat`),
            // );
          }
        }
      });
 });

});

function onCreateUser(data) {
	logger.info('onCreateUser: user data = ' + JSON.stringify(data));
  usersDB.addUser({...data, id: this.id});
  return { id: this.id };
}
// function addTable(id, room) {
//   console.log("addTable, room: " + room);
//   tables[room] = {id: id};
//   console.log("addTable, tables: " + JSON.stringify(tables));
// }
// function getFreeTable() {
//   let roomnr = getTableNr();
// }

function onJoinRoom(data, callback) {
  	logger.info('joinRoom: user data = ' + JSON.stringify(data));
    this.join(data.room);
    this.room = data.room;
    var id = this.id;
    var users = usersDB.getUsersByRoom(data.room);
    // if (tables[data.room] === data.room) {
    //   tables[data.room].users = users;
    // } else {
    //   addTable(this.id, data.room);
    //   tables[data.room].users = users;
    // }
    // console.log("onJoinRoom, tables: " + JSON.stringify(tables));

    var playernr = 1, tablefull = false;
    
    if (users.length > 2) {
      playernr = 0;
      callback( { nr: playernr } );
      //--- this.emit("You can't sign in to " + data.room + ", the room is full");
      //@todo: send tablefull message to socket, 
      // if user accepts to watch the game allow view only participation with chat option 
      // else delete the user 
      // remove from user DB
      logger.info("onJoinRoom, the table is full, remove user with id: " + id);
      usersDB.removeUser(id);
    } else if (users.length === 2) {
      playernr = 2;         
      tablefull = true;
      // tables[data.room].tablefull = true;
      // console.log("onJoinRoom, tables: " + JSON.stringify(tables));
      callback( { nr: playernr } );
      //this.emit(" start game " + data.room + ", the room is full");
    } else {
      playernr = 1;         
      callback( { nr: playernr } );
    }   
    this.playernr = playernr;
    logger.info('joinRoom: user ' + data.name + " = player no: " + this.playernr);
    users = usersDB.getUsersByRoom(data.room);
    logger.info('joinRoom: users in ' + data.room + " = " + JSON.stringify(users));
    if (tablefull) {
      logger.info('joinRoom: the room is full, start game  ');
      sio.to(data.room).emit("startGame", users);   
    }
}
function onJoinRoomAsKibitz(data, callback) {
  data.guest = true;
  logger.info('onJoinRoomAsKibitz: user data = ' + JSON.stringify(data));
  usersDB.addUser({...data, id: this.id});
  
  this.join(data.room);
  this.room = data.room;
  var id = this.id;
  var users = usersDB.getUsersByRoom(data.room);
	if (callback) {
    callback(users);
  }  
  logger.info('onJoinRoomAsKibitz: users in ' + data.room + " = " + JSON.stringify(users));
  
}
function onChangeNumCards(data) {
  logger.info('onChangeNumCards: data = ' + JSON.stringify(data));
  sio.to(data.room).emit("changeNumCardsAndRestart", data);   
}
function onSwitchStack(data) {
  logger.info('onSwitchStack: data = ' + JSON.stringify(data));
  sio.to(data.room).emit("switchStack", data);   
}
function onFlipCard(data) {
  logger.info('onFlipCard: data = ' + JSON.stringify(data));
  logger.info('onFlipCard:  broadcast  flipCard');
  sio.to(data.room).emit("flipCard", data);
  // if (this.automode) {
  //   logger.info('onFlipCard: playCard = ' + JSON.stringify(data));
  //   sio.to(data.room).emit("playCard", data);
  // }   
}
function onSendDeck(data) {
  logger.info('onSendDeck: deck data = ' + JSON.stringify(data));
  logger.info('onSendDeck:  broadcast  useDeck');
  sio.to(data.room).emit("useDeck", data.deck);   
}
function onMoveToStack (data) {
  logger.info('onMoveToStack: card data = ' + JSON.stringify(data));
  logger.info('onMoveToStack:  broadcast  moveCard');
  sio.to(data.room).emit("moveCard", data);   
}
function onMoveToOwnStack (data) {
  logger.info('onMoveToOwnStack:  card data = ' + JSON.stringify(data));
  logger.info('onMoveToOwnStack:   broadcast  moveCardAndSwitchPlayer');
  sio.to(data.room).emit("moveCardAndSwitchPlayer", data);
}
function onGameOver (data) {
  logger.info('onGameOver:  data = ' + JSON.stringify(data));
  logger.info('onGameOver:  broadcast  gameOver');
  sio.to(data.room).emit("gameOver", data);   
}
function onAutomode (data) {
  logger.info('onAutomode:  data = ' + JSON.stringify(data));
  this.automode = data.automode;
  logger.info('onAutomode:  broadcast  setAutomode');
  sio.to(data.room).emit("setAutomode", data);   
}
function onNewGame (data) {
  logger.info('onNewGame:  data = ' + JSON.stringify(data));
  let users = usersDB.getUsersByRoom(data.room);
  logger.info('onNewGame:  broadcast  startNewGame');
  sio.to(data.room).emit("startNewGame", users);   
}
function onClientDisconnect(reason) {

	logger.info("onClientDisconnect: User " + this.id + " disconnected reason = " + reason);
//	logger.info("onClientDisconnect: client: " + JSON.stringify(clients[sio.cookieId]));
	//delete clientIds[this.id];
//	logger.info("onClientDisconnect: client has disconnected: " + this.id + ", player name: " + this.nickname);

}
function onServerStatus(data, callback) {
  if (!data.id) {
    return;
  }
  logger.info('onServerStatus: data: ' + JSON.stringify(data));

	if (callback) {
    callback({id: this.id, alive: true});
  }
}
// player signed out
function onPlayerSignedOut(data, callback) {
	logger.info('onPlayerSignedOut: data: ' + JSON.stringify(data));
  // if user not found exit
  if ( usersDB.getUser(this.id) ) {
    logger.info('  remove this player for client id = ' + this.id);
  	logger.info('  remove this player with name = ' + data.nickname);
	  logger.info('  remove this player from room = ' + data.tablename);
	  //delete clientIds[this.id];
    //signeoutUser(this, this.nickname, this.tablename);
    let user = usersDB.getUser(this.id);
    logger.info("onPlayerSignedOut user data = " + JSON.stringify(user));    
    usersDB.removeUser(this.id);
    this.leave(data.tablename); // this = socket from client
    if (!user.guest) {
      // player left    
      logger.info("onPlayerSignedOut remaining players: " + JSON.stringify(usersDB.getUsersByRoom(data.tablename)));
      sio.to(data.tablename).emit("playerLeftGame", user);
    }
  } else {
    logger.info('  got no player for client id = ' + this.id);
  }

}

function onWhosOnline(data, callback) {
  var str = "";
  var cnt = 0;
  var rooms = [];
  var allusers = usersDB.getAllUsers();
  logger.info("onWhosOnline players online: " + cnt + ", all users:  " +  JSON.stringify(allusers));
  cnt = allusers.length;

  //str = JSON.stringify(users);
  Object.keys(allusers).forEach(key => {
    // console.log(key, users[key]);
    var room = allusers[key].room;
    if (rooms.indexOf(room) === -1) { rooms.push(room)}
    // str += users[key].name + " - am Tisch " + users[key].room + ";";
  });

  logger.info("onWhosOnline rooms: " +  JSON.stringify(rooms));

  for (var i = 0, l = rooms.length; i < l; i++) {
    var room = rooms[i];
    str += "Tisch: " + room + " --> Spieler: ";
    var users = allusers.filter((user) => user.room === room);
    logger.info("onWhosOnline room: " + room + " users: " +  JSON.stringify(users));
    //var users = usersDB.getUsersByRoom(room);
    for (var j = 0, l1 = users.length; j < l1; j++) {
      str += users[j].name;
      if (j < l1-1) { str = str + ", "; }
    }
    str += ";"
  }

  callback({playersOnline: cnt, playerNames: str});
  //!!! debug statement to check wo's playing on this table
  // sio.to(this.room).emit("serverinfo", str);   

}

// unused player signed in
function onPlayerSignedIn(data, callback) {
	// this.id == client id!!!
	// data.id = player id!!!
	logger.info('onPlayerSignedIn: data: ' + JSON.stringify(data));
	logger.info('  create this player for client id = ' + this.id);

}

//----------------------------------------------------------
// utilities
//---------------------------------------------------------

const inspect = obj => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      console.log(`${prop}: ${obj[prop]}`)
    }
  }
}

// call getTableNr(); --> 1
// call getTableNr(); --> 2
function getTableNr() {
  var i = 0;
  return function() { i++; }
}

// ** shutdown hook -- not ready

function gracefullExit() {
	logger.info('gracefullExit: closing http server.');
	//server.close();
	  // boolean means [force], see in mongoose doc
	//   mongoose.connection.close(false, () => {
	// 	logger.info('MongoDb connection closed.');
	// 	process.exit(0);
	//   });
	setImmediate(function(){sio.emit('serverdown')});
// Count down from 1 seconds
	(function countDown (counter) {
		logger.info(counter);
		if (counter > 0)
		return setTimeout(countDown, 1000, counter - 1);
	
		// Close the server
		//httpServer.close(function () { logger.info('Server closed!'); });
		theserver.close(function () { logger.info('Server closed!'); });
		//setImmediate(function(){server.emit('close')});
		// // Destroy all open sockets
		// for (var socketId in sockets) {
		// logger.info('socket', socketId, 'destroyed');
		// sockets[socketId].destroy();
		// }
	})(1);	
  }

//@todo: handle this and close sockets
  process.on('SIGTERM', () => {
	console.info('SIGTERM signal received.');
	gracefullExit();
  });
  process.on('SIGINT', () => {
	console.info('SIGINT signal received.');
	gracefullExit();
  });
  process.on('SIGQUIT', () => {
	console.info('SIGQUIT signal received.');
	gracefullExit();
  });

}