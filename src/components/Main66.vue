  /*--------------------------------------------------------------------------------------------------------
     war66 - a nodejs multi user version of 66war
     *
     * Release Notes:
     * 
     * V0.0.006, 21.11.2020
     *   + bugfix: only player 1 may change settings
     * V0.0.005, 20.11.2020
     *   + first deploy to Heroku https:\\war66.herokuapp.com
     *
    --------------------------------------------------------------------------------------------------------*/

<template>
  <div v-on:contextmenu="openContextMenu">
    <h2 id="apptitle" v-bind:style="titleStyle" v-on:click="toggleAutomode">
      war66
    </h2>
    <!-- top menu with control buttons -->
    <div id="chatsButton" class="fabutton" v-bind:style="chatsStyle" v-on:click="toggleChats" title="Chats starten" >
       <font-awesome-icon icon="comment"></font-awesome-icon>
    </div>
    <div id="onlineButton" class="fabutton" v-on:click="whosOnline" title="Wer spielt denn da?" >
       <font-awesome-icon icon="globe"></font-awesome-icon>
    </div>
    <div id="heartbeat" v-bind:style="conStateColor" v-on:click="checkConnstate" title="Serververbindung prüfen: Rot=OK, Blau=kein Server" >
       <span id="numElem" style="margin-left: -15; font-size: 8pt; color: white"></span>
       <font-awesome-icon icon="heart">
       </font-awesome-icon>
       <span id="pNr" style="margin-right: 15; font-size: 12pt; color: white"></span>
    </div>

 
    <div id="controls" style="display:block;">
      <div id="exitButton"  class="fabutton" title="Spiel verlassen." v-on:click="stopGame()" >
        <font-awesome-icon icon="sign-out-alt"></font-awesome-icon>
      </div>
      <div id="infoButton" class="fabutton" title="Infos" v-on:click="showInfo">
        <font-awesome-icon icon="info"></font-awesome-icon>
      </div>
      <div
        id="helpButton"
        class="fabutton"
        title="Über 66"
        v-on:click="showHelp"
      >
        <font-awesome-icon icon="question"></font-awesome-icon>
      </div>
      <div
        id="settingsButton"
        class="fabutton"
        title="Einstellungen"
        v-on:click="showSettings"
      >
        <font-awesome-icon icon="cog"></font-awesome-icon>
      </div>
    </div>

    <!-- layout table with columns for players ans stack -->
    <div id="table" style="display:block">
      <table id="tablecontainer">
        <tr>
          <td>
            <tr class="p1info" @click="setGameTimeout(300)">
              {{
                playerInfo.p1Name
              }}-{{
                playerInfo.p1Hands
              }}
            </tr>
            <table id="player" class="subtable">
              <tr>
                <th>Stapel</th>
                <th>Halde</th>
              </tr>
              <tr>
                <td>
                  <div id="p1deckampel" class="ampel" v-bind:style="p1ampel">
                    <span class="num">{{ p1deck.cards.length }}</span>
                  </div>
                </td>
                <td>
                  <div
                    id="p1stackampel"
                    class="ampel"
                    v-bind:style="p1stackampel"
                  >
                    <span class="num">{{ p1stack.cards.length }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <!--  -->
                <td>
                  <img
                    id="p1deck"
                    class="img  animate__animated animate__bounceIn"
                    v-bind:src="p1deck.imgurl"
                    @click="playCard($event)"
                    draggable="true"
                    @dragstart="onDragStart($event)"
                  />
                </td>
                <td class="drop-zone drag-el">
                  <img
                    id="p1stack"
                    class="img"
                    v-bind:src="p1stack.imgurl"
                    @contextmenu.prevent
                    draggable="true"
                    @dragstart="onDragStart($event)"
                    @drop="onDrop($event)"
                    @dragover.prevent
                    @dragenter.prevent
                    @dragleave="onDragLeave($event)"
                    @dragend="onDragEnd($event)"
                  />
                </td>
              </tr>
            </table>
          </td>

          <td>
            <tr class="info">
              {{
                playerInfo.p1Score
              }}
              :
              {{
                playerInfo.p2Score
              }}
            </tr>
            <table id="stackplayer" class="subtable">
              <tr>
                <th>Ablage</th>
              </tr>
              <tr>
                <td>
                  <div id="stackampel" class="ampel stackampel" @click="replayGame">
                    <span class="num">{{ stack.cards.length }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <img
                    id="stack"
                    class="img drop-zone"
                    v-bind:src="stack.imgurl"
                    @click="dumpCards"
                    @drop="onDrop($event)"
                    @dragover.prevent
                    @dragenter.prevent
                    @dragleave="onDragLeave($event)"
                    @dragend="onDragEnd($event)"
                  />
                </td>
              </tr>
            </table>
          </td>

          <td>
            <tr class="p2info" @click="setGameTimeout(20)">
              {{
                playerInfo.p2Name
              }}-{{
                playerInfo.p2Hands
              }}
            </tr>
            <table id="player" class="subtable">
              <tr>
                <th>Halde</th>
                <th>Stapel</th>
              </tr>
              <tr>
                <td>
                  <div
                    id="p2stackampel"
                    class="ampel"
                    v-bind:style="p2stackampel"
                  >
                    <span class="num">{{ p2stack.cards.length }}</span>
                  </div>
                </td>
                <td>
                  <div id="p2deckampel" class="ampel" v-bind:style="p2ampel">
                    <span class="num">{{ p2deck.cards.length }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <img
                    id="p2stack"
                    class="img drop-zone"
                    v-bind:src="p2stack.imgurl"
                    draggable="true"
                    @dragstart="onDragStart($event)"
                    @drop="onDrop($event)"
                    @dragover.prevent
                    @dragenter.prevent
                    @dragleave="onDragLeave($event)"
                    @dragend="onDragEnd($event)"
                  />
                </td>
                <td>
                  <img
                    id="p2deck"
                    class="img animate__animated animate__bounceIn"
                    v-bind:src="p2deck.imgurl"
                    v-on:click="playCard($event)"
                    draggable="true"
                    @dragstart="onDragStart($event)"
                  />
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    <!-- message area -->
    <div id="messagearea" style="display: none">
      <input type="text" id="msg" placeholder="Chat eingeben und Return oder 'Chat senden'" spellcheck="false" onkeydown = "if (event.keyCode == 13)
                        document.getElementById('sendChatButton').click()"/>
      <div id="msgbuttons">
        <div id="sendChatButton" class="fabutton" v-on:click="sendMessage" title="Chat senden">
            <font-awesome-icon icon="paper-plane"></font-awesome-icon>
        </div>
        <div id="toggleDialogButton" class="fabutton" v-on:click="toggleChatDialog" title="Chats anzeigen.">
            <font-awesome-icon icon="rocket"></font-awesome-icon>
            <span id="numChats" style="margin-left: 10;font-size: 12pt;font-weight: bold;color: #f1da0a"></span>
        </div>
      </div>
    </div>
    <div id="chatarea" style="display: none">
    </div>

  </div>
</template>


<script>
var debug = false;
var automode = false;
var playSpecialDeck = false;
var multiplayer = true;
var showChats = false;
var showSignin = false, uname = "", tname = "";
var chatCounter = 0;
var version = "0.0.6";
var timeout = 1000;
//var game20 = 20;
//var game36 = 36;
var numcards = 20;
//var testGameOver = false;
// var playHand = false;
var playSolo = false;
var gameStarted = false;
var gameOver = false;
var winner = 0;
var that;
var illegalImgurl = "assets/sword2.png";
var illegalRotImgurl = "assets/sword2rot.png";
var backImgurl = "assets/back7.png";
var blankImgurl = "assets/black.png";
var killerImgurl = "assets/tenor.gif";
var winnImgurl = "assets/sieg.png"
var looseImgurl = "assets/aerger.png"

// var sioport = 3166;
var heartbeat, chatbtn, onlinebtn, numElem, pNr, exitbtn, chats, mychat, chatarea, numChats, connstate = false;



import io from "socket.io-client";
//https://www.npmjs.com/package/body-scroll-lock
import {  disableBodyScroll } from 'body-scroll-lock';
//https://github.com/timruffles/mobile-drag-drop
import {polyfill} from "mobile-drag-drop";
// optional import of scroll behaviour
import {scrollBehaviourDragImageTranslateOverride} from "mobile-drag-drop/scroll-behaviour";
polyfill({
    //dragImageOffset: {x: 100, y: 0},
    dragImageCenterOnTouch: true,
    // use this to make use of the scroll behaviour
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

export default {
  name: "Main66",

  data() {
    return {
      msg: "",
      isIos: false,
    socket: {},
    conStateColor: {color: 'blue', fontSize: '1.3rem' },
    playernr: 0,
    playername: "",
    roomname: "room1",
    playersOnline: 0,
    chats: [],
      gameKilled: false,
      gamePaused: false,
      playersTurn: false,
      p1ampel: { backgroundColor: "green" },
      p1stackampel: { backgroundColor: "green" },
      p2ampel: { backgroundColor: "red" },
      p2stackampel: { backgroundColor: "red" },
      playerInfo: {
        p1Name: playSolo ? "Ich" : "IQ",
        p1Score: 0,
        p1Hands: 0,
        p2Name: playSolo ? "Ego" : "KI",
        p2Score: 0,
        p2Hands: 0,
      },
      playerInfoStyle: {
        color: automode ? "yellow" : "white",
        backgroundColor: automode ? "green" : "rgba(88,88,88, 0.8)",
      },
      titleStyle: { backgroundColor: "black" },      
      chatsStyle: { color: "yellow", },
      ranks20: ["a", "10", "k", "o", "u"],
      ranks36: ["a", "k", "o", "u", "10", "9", "8", "7", "6"],
      suits: ["e", "s", "h", "g"],
      values20: [11, 10, 4, 3, 2],
      values36: [11, 4, 3, 2, 10, 9, 8, 7, 6],
      cards: [],
      p1deck: {
        imgurl: require("../" + backImgurl), //"../assets/back7.png"),
        cards: [],
        name: "p1deck"
      },
      p2deck: {
        imgurl: require("../" + backImgurl),
        cards: [],
        name: "p2deck"
      },
      p1stack: {
        imgurl: require("../" + blankImgurl),
        cards: [],
        name: "p1stack"
      },
      p2stack: {
        imgurl: require("../" + blankImgurl),
        cards: [],
        name: "p2stack"
      },
      stack: {
        imgurl: require("../" + blankImgurl),
        cards: [],
        name: "stack"
      },
      isDeckShuffled: false,
      shuffleCount: -1,
      replaystr: "",
    };
  },
  created() {
    that = this;
    gameStarted = true;
    if (!multiplayer) { 
      // skip sigin process
      gameStarted = true;
      this.createCardDeck(); 
    } else {
      /*
      //-- add server handshake
      // var fullurl = window.location.href;
      var prefix = "http://";
      var netport = window.location.port;

//       // https://github.com/vuejs/vue-cli/issues/2839
// sioport = process.env.VUE_APP_PORT;

//       if (fullurl.indexOf("https") > -1) {
//         prefix = "https://";
        sioport = 1166;
//       }
//       sioport = process.env.VUE_APP_SIOPORT || sioport;
//       // .env file will not be found in PROD, 
//       // so ENV variables are undefined in client app from dist
//       sioport = process.env.VUE_APP_SIOPORT ? process.env.VUE_APP_SIOPORT : 8080;

      //  log("env VUE_APP_NETPORT = " + process.env.VUE_APP_NETPORT);
      //  log("env VUE_APP_SIOPORT = " + process.env.VUE_APP_SIOPORT);
       log("env VUE_APP_PORT = " + process.env.VUE_APP_PORT);

      sioport = 3166; //process.env.VUE_APP_PORT; // defined in vue-config

      if (debug) { log("created, the " +  prefix + " server is running on port: " + netport); }
      if (debug) {  log("created, init socket.io communication on port: " + sioport); }

      var sioserver = prefix + window.location.hostname + ":" + sioport;
      if (debug) { log("created, init socket io, connect to server: " + sioserver); }
      //https://socket.io/docs/client-initialization/
      //https://socket.io/docs/v3/server-api/index.html
      //NOK; server on same domain 
      // error during WebSocket handshake: Unexpected response code: 400 --> add transports
      // if (sioport === 3166) {
      //   this.socket = io(sioserver, {transports: ['polling']});
      // } else {
      //   this.socket = io(sioserver, {transports: ['polling'], forceNew: true, secure: true});
      // }
      */
      this.socket = io({transports: ['polling']});

      // NOK this.socket = io({'policyPort': sioport, 'force new connection': false, secure: true});
//nok this.initSocketIO();
      this.socket.on('connect', (data) => {
        
        if (debug) { log('connect, socket status: ' + this.socket.connected); }
        if (debug) { log('connect data: ' + JSON.stringify(data)); }
        that.checkConnstate();
        // this.socket.emit('getFreeTable', {id: this.socket.id}, function(data) {  
        //     if (data) {
        //       log('connect.getFreeTable data: ' + JSON.stringify(data));
        //     } else {
        //       log('connect.getFreeTable no data !!! ');
        //     }
        //   }); // function(data)         
      });
     this.socket.on("connect_timeout", function(timeout) { 
       if (debug) { log("connect_timeout: " + timeout); }
       });
     this.socket.on("connect_error", function(error) { 
       if (debug) { log("connect_error: " + JSON.stringify(error)); }
       if (debug) { log("connect_error: " + JSON.stringify(error.stack)); }
       connstate = false;
       that.updateConnectionStatus();       
       that.checkConnstate(); 
       });
     this.socket.on("reconnect_attempt", function(attemptNumber) { log("reconnect_attempt: " + attemptNumber); });
     this.socket.on("reconnect", function() { log("reconnect"); });
     this.socket.on("reconnect_error", function(error) { log("reconnect_error: " + JSON.stringify(error)); });
     this.socket.on("reconnect_failed", function() { log("reconnect_failed"); });
     this.socket.on("open", function() { log("open"); });
     this.socket.on("close", function() { log("close"); });
     this.socket.on('error', function(error) { log("error: " + error); });
    //  this.socket.on('ping', function() { console.log("ping"); });
    //  this.socket.on('pong', function(latency) { console.log("pong: latency= " + latency); });
/*
      this.socket.on('connect_error', () => {
        console.log('connect_error, socket status: ' + this.socket.connected); 
      });
      this.socket.on('connect_timeout', () => {
        console.log('connect_timeout, socket status: ' + this.socket.connected); 
      });
*/
//https://devcenter.heroku.com/articles/node-websockets
      this.socket.on('disconnect', () => {
        if (debug) { log('disconnect, socket status: ' + this.socket.connected); }
        //@todo: relogin an continue game!!!

        // reset game and info and signin 
        gameStarted = false;
        that.playersOnline = 0;
        that.updateHeartbeatSpan();
        that.playernr = -1;
        that.playerInfo.p1Name = "IQ";
        that.playerInfo.p2Name = "KI";
        that.resetGameParameters();
        that.signin();        
      });
      this.socket.on("serverdown", this.onSocketDisconnect);
      this.socket.on("serverinfo", this.onServerInfo);
      // this.socket.on("disconnectclient", onClientDisconnected); // Socket disconnect
      this.socket.on("useDeck", this.onUseDeck);
      this.socket.on("changeNumCardsAndRestart", this.onChangeNumCards);
      this.socket.on("setAutomode", this.onAutomode);
      this.socket.on("startGame", this.onStartGame);      
      this.socket.on("startNewGame", this.onStartNewGame);
      this.socket.on("flipCard", this.onFlipCard);
      this.socket.on("switchStack", this.onSwitchStack);
      this.socket.on("moveCard", this.onMoveCard);
      this.socket.on("moveCardAndSwitchPlayer", this.onMoveCardAndSwitchPlayer);
      this.socket.on("playerLeftGame", this.onUpdatePlayers);
      this.socket.on("updatechat", this.onUpdateChat); // New chat from player received
      // this.socket.on("whosonline", whosOnline);
      // this.socket.emit("createUser", this.playerInfo.p1Name);
      // this.socket.emit("joinRoom", {name: this.playerInfo.p1Name, room: "Tisch1"});
      this.signin();
    }
  },
  mounted() {
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
    // this.isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // if (this.isIos) {
    //   window.addEventListener( 'touchmove', function() {});
    // }
    // if (this.isIos) {
    //   //xxx if w < h hide title
    //   // add orientation changed listener
    //   var title = "66m Kriegeln";
    //   if (window.innerWidth < window.innerHeight) {
    //     title = "";
    //   }
    //   document.getElementById("apptitle").innerHTML = title;
    // }    
    chatbtn = document.getElementById("chatsButton");
    onlinebtn = document.getElementById("onlineButton");
    chats = document.getElementById("messagearea");
    mychat = document.getElementById("msg");
    chatarea = document.getElementById("chatarea");
    numChats = document.getElementById("numChats");
    heartbeat = document.getElementById("heartbeat");
    numElem = document.getElementById("numElem");
    pNr = document.getElementById("pNr");
    exitbtn = document.getElementById("exitButton");
    //document.getElementById("chatsButton").click();
    if (!multiplayer) { 
      heartbeat.style.display = "none";
      numElem.style.display = "none";
      pNr.style.display = "none";
      exitbtn.style.display = "none";
      chatbtn.style.display = "none";
      onlinebtn.style.display = "none";
      this.startGame();
    } else {
      // this.checkConnstate();
      //setTimeout(this.updateConnectionStatus, 1000);      
    }
  },

  methods: {
    resizeHandler() {
      if (debug) { log("resizeHandler, w = " + window.innerWidth + ", h = " + window.innerHeight); }
      var title = "war66";
      if (window.innerWidth < window.innerHeight) {
        title = "";
      }
      document.getElementById("apptitle").innerHTML = title;
    // this.isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // if (this.isIos) {
    //   window.addEventListener( 'touchmove', function() {});
    // }
    // if (this.isIos) {
    //   //xxx if w < h hide title
    //   // add orientation changed listener
    //   var title = "66m Kriegeln";
    //   if (window.innerWidth < window.innerHeight) {
    //     title = "";
    //   }
    //   document.getElementById("apptitle").innerHTML = title;
    // }    

    },
toggleChats() {
  showChats = !showChats;
  chats.style.display = showChats ? "block" : "none";
  chatarea.style.display = showChats ? "block" : "none";
  this.chatsStyle = showChats ? "color: green" : "color: yellow";
  if (showChats) {
    this.saShowTimerInfoDialog("Chats unten eingeben.");
    //NOK this.saOpenChatDialog();
  } else {
    this.saShowTimerInfoDialog("Chats beendet.");
  }

  /*
    sendMessageBtn.addEventListener("click", function () {
      if (mychat.value !== "") {
        //-- server sends to all players on table onUpdateChat(userName, mychat.value);
        log("sendMessageBtn.click:" + userName + " sende chat: " + mychat.value + " an " + tableName);
        socket.emit("sendmessage", userName, tableName, mychat.value);
        mychat.value = "";
      }
    });
  */
},
sendMessage() {
  if (mychat.value !== "") {
    //-- server sends to all players on table onUpdateChat(userName, mychat.value);
    if (debug) { log("send.click:" + this.playername + " sende chat: " + mychat.value + " an " + this.roomname); }
    this.socket.emit("sendmessage", this.playername, this.roomname, mychat.value);
    mychat.value = "";
  }
},
onUpdateChat(username, timestamp, data) {
  if (debug) { log("onUpdateChat: chat von: " + username + " um: " + timestamp + ", data = " + JSON.stringify(data)); }
  let newchat = timestamp + " - " + username + ": " + data;
  this.chats.push(newchat);
  numChats.innerHTML = ++chatCounter;
  if (username !== this.playername) {
    this.saShowTimerInfoDialog(newchat);
  }
},
toggleChatDialog() {
   this.saOpenChatDialog(this.chats);
  //this.saShowPlayersOnline(this.chats.length, this.chats);
},
onServerInfo(data) {
  if (debug) { log("onServerInfo: server info = " + JSON.stringify(data)); }
  this.saShowTimerInfoDialog(data);
},
signin(){
  
  (async () => {
  if (debug) { log("signin called..."); }
  if (!multiplayer) { return; }
  let username, tablename;
  if (uname === "") { 
    username = that.randStr(5); 
    uname = username; 
  } 
  else { 
    username = uname;
  }
  if (tname === "") { 
    tablename = that.randNumberStr(3); 
    tname = tablename; 
  } else { 
    tablename = tname;
  }

       let divele = document.createElement("div");
      // divele.classList.add("scroll-touch");
      // divele.style.background = "grey";
      // divele.style.borderRadius = "15px";
      divele.id = "swal-input";
      divele.style.color = "#f1da0a";
      divele.style.paddingLeft = "16px";
      divele.style.fontFamily = "Avenir, Helvetica, Arial, sans-serif";
      divele.style.fontSize = "20px";
      divele.style.fontWeight = "bold";
      divele.style.textAlign = "left";
      divele.style.textIndent = "10px";
      divele.style.maxHeight = "450px";

      var newInput = document.createElement("Input");
      newInput.id = "swal-input1";
      newInput.name = "swal-input1";
      newInput.type = "text";
      newInput.style.fontSize = "18px";
      newInput.pattern="[a-zA-Z0-9]+"; //[a-zA-Z0-9]+";
      newInput.required="true";
      newInput.autocomplete="off";
      newInput.spellcheck="false";
      newInput.minlength="5";
      newInput.maxlength="10";
      newInput.size="10";
      newInput.value = username;

      var newlabel = document.createElement("Label");
      newlabel.setAttribute("for","swal-input1");
      newlabel.innerHTML = "Name: ";
      divele.appendChild(newlabel);
      divele.appendChild(document.createElement("br")); 
      divele.appendChild(newInput);
      divele.appendChild(document.createElement("br")); 
      divele.appendChild(document.createElement("br")); 

      newInput = document.createElement("Input");
      newInput.id = "swal-input2";
      newInput.name = "swal-input2";
      newInput.type = "text";
      newInput.style.fontSize = "18px";
      newInput.pattern="^[0-9]+$";
      newInput.required="required";
      newInput.autocomplete="off";
      newInput.spellcheck="false";
      newInput.minlength="3";
      newInput.maxlength="5";
      newInput.size="10";
      newInput.value = tablename;

      newlabel = document.createElement("Label");
      newlabel.setAttribute("for","swal-input2");
      newlabel.innerHTML = "Tisch: ";
      divele.appendChild(newlabel);

var onlinebtn1 = document.createElement('input');
onlinebtn1.id = 'obtn';
onlinebtn1.type = 'button';
onlinebtn1.class= 'fabutton'; 
onlinebtn1.name = 'i';
onlinebtn1.value = '?';
onlinebtn1.title = 'Wer spielt gerade?';
onlinebtn1.style.width = "30px";
onlinebtn1.style.height = "30px";
onlinebtn1.style.background = "transparent";
onlinebtn1.style.color = "#f1da0a";
onlinebtn1.style.fontSize = "18px";
onlinebtn1.style.fontWeight = "bold";
// onlinebtn1.style.borderRadius = "50%";

// nok onlinebtn.innerHTML = 'i<font-awesome-icon icon="globe"></font-awesome-icon>';
// nok 
// onlinebtn1.onClick = function(){ 
//   console.log("signin.onlinebtn1.click");
//   that.whosOnline(); 
//   };
divele.appendChild(onlinebtn1);
// nok getElementById("obtn").
// document.addEventListener("click", function(event) {
//   // alert(this.id);
//         var targetElement = event.target || event.srcElement;
//         //console.log(targetElement);
//         if (targetElement.id === "obtn") {
//           let name = document.getElementById('swal-input1').value.trim().replace(/\s+/g, '');
//           uname = name;
//           let table = document.getElementById('swal-input2').value.trim().replace(/\s+/g, '');
//           tname = table;
//           that.whosOnline();
//         } else {
//           // console.log(targetElement);
//           if (!showSignin && uname !== "") {
//             if (multiplayer) {
//               that.signin();
//             }
//           }
//         }
// });
// rk: has to be outside function so we cal can removeEventListener
document.addEventListener("click", that.handleSigninInfoButton);

// let divglo = document.createElement("div");
// divglo.class = "fabutton";
// divglo.id = "obtn";
// divglo.title = 'Wer spielt gerade?';
// divglo.innerHTML = "divglo";
// divele.appendChild(divglo);
// divele.appendChild(document.createTextNode(<font-awesome-icon icon="globe"></font-awesome-icon>));
/*
    <div id="onlineButton" class="fabutton" v-on:click="whosOnline" title="Wer spielt denn da?" >
       <font-awesome-icon icon="globe"></font-awesome-icon>
    </div>
*/

// var par = document.createElement('paragraph');
// par.innerHTML = <font-awesome-icon icon="globe"></font-awesome-icon>;
// divele.appendChild(par);

      divele.appendChild(document.createElement("br")); 
      divele.appendChild(newInput);
      divele.appendChild(document.createElement("br")); 

showSignin = true;
  const { value: formValues } = await this.$swal({
    background: "rgba(133,133,133, 0.8)",
    // padding: ".5rem",
    width: 270,
    title:
      '<span style="text-shadow:none;color:blue;font-family: Verdana,Arial,Helvetica;font-size: 20px;font-weight: bold;">' +
      "Anmeldung" +
      '</span>',
    allowOutsideClick: false,
    html: divele,
      // '<label for="swal-input1" style="color:white;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">Name</label>' +
      // '<input id="swal-input1" style="color:white;" class="swal2-input" placeholder=' + username + '>' +
      // // '<input id="swal-input1" style="color:white;" class="swal2-input" placeholder=Name:&nbsp;' + username + '>' +
      // '<label for="swal-input2" style="text-shadow:none;color:white;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">Tisch</label>' +
      // '<input id="swal-input2" style="color:white;" class="swal2-input" placeholder=' + tablename + '>',
      // // '<input id="swal-input2" style="color:white;" class="swal2-input" placeholder=Tisch:&nbsp;' + tablename + '>',
    focusConfirm: false,
  onClose: () => { // dialog closed by user
     if (debug) { log("signin dialog closed by user"); }
     showSignin = false;
  },
  onDestroy: () => { // dialog closed by other popup
    if (debug) { log("signin dialog destroyed by popup"); }
    showSignin = false;
  },
    // inputAttributes: {
    //   maxlength: 10,
    //   color: "blue",
    //   //autocapitalize: 'off',
    //   spellcheck: "false",
    //   autocorrect: "off"
    // },
    // inputValidator: (value) => {
    // return new Promise((resolve) => {
    //   if (value.length > 0 && value.length <= 5) {
    //     resolve()
    //   } else {
    //     resolve('You need to select oranges :)')
    //   }
    //   })
    // },
    preConfirm: () => {
      let name = document.getElementById('swal-input1').value.trim().replace(/\s+/g, '');
      uname = name;
      let table = document.getElementById('swal-input2').value.trim().replace(/\s+/g, '');
      tname = table;
      var np = document.getElementById('swal-input1').getAttribute("pattern");
      var nr = new RegExp(np); ///^[a-zA-Z0-9]+$/);
      var tp = document.getElementById('swal-input2').getAttribute("pattern");
      var tr = new RegExp(tp);
      var namevalid = nr.test(name);
      var tablevalid = tr.test(table);
      // var namevalid = document.getElementById('swal-input1').checkValidity();
      // var tablevalid = document.getElementById('swal-input2').checkValidity();
      if (namevalid 
          && tablevalid 
          // && name.length > 0 
          // && name.length <= 10 
          // && table.length > 0 
          // && table.length <= 5
        ) {
    uname = "";
    tname = "";
    showSignin = false;
    document.removeEventListener("click", that.handleSigninInfoButton);

return [
          name || username,
          table || tablename,
        ]
      } else {
        //  that.saShowTimerInfoDialog("Bitte max 5 Zeichen eingeben");
        alert("Falsche Eingaben, bitte für Name 1-5 Zeichen, Tisch 1-3 Ziffern einzeichen");
        // that.saShowInfoDialog("Falsche Eingaben, bitte Name 1-5 Zeichen, Tisch 1-5 Zeichen");
        return false;
      }
    }
  })

  if (formValues) {
    // Swal.fire(JSON.stringify(formValues));
    // chrome list event listeners: getEventListeners(document)
    showSignin = false;
    document.removeEventListener("click", this.handleSigninInfoButton);
    if (debug) { log("signin dialog closed by user OK, showSignin="+showSignin); }
 
    this.createUser({name: formValues[0], room: formValues[1]});

    //this.socket.emit("createUser", this.playerInfo.p1Name);
    //this.socket.emit("joinRoom", {name: formValues[0], room: formValues[1]});
  } else {
    //  that.saShowTimerInfoDialog("Bitte max 5 Zeichen eingeben");
  }

  })()
},
handleSigninInfoButton(event) {
  // alert(this.id);
    var targetElement = event.target || event.srcElement;
    if (debug) { log("handleSigninInfoButton: event = " + event + " on " + targetElement.id); }
    if (targetElement.id === "") {
      targetElement.id = "whosonline";
    }
    if (targetElement.id === "obtn") {
      let name = document.getElementById('swal-input1').value.trim().replace(/\s+/g, '');
      uname = name;
      let table = document.getElementById('swal-input2').value.trim().replace(/\s+/g, '');
      tname = table;
      that.whosOnline();
    } else if (!targetElement.id.startsWith("swal-input")) {
      if (debug) { log("handleSigninInfoButton: open signin, showSignin="+showSignin); }
      if (!showSignin && uname !== "") {
        if (multiplayer) {
          that.signin();
        }
      }
    }
},
randStr(len, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let s = '';
    while (len--) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  },
randNumberStr(len, chars='123456789') {
    let s = '';
    while (len--) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  },

async createUser (user) {
  if (debug) { log("createUser: " + JSON.stringify(user)); }

  if (multiplayer && !connstate) {
      multiplayer = false;
      heartbeat.style.display = "none";
      numElem.style.display = "none";
      pNr.style.display = "none";
      exitbtn.style.display = "none";
      chatbtn.style.display = "none";
      onlinebtn.style.display = "none";
      that.saShowTimerInfoDialog("Server nicht verfügbar, Solospiel!")
      that.socket.disconnect(true);
      //that.signoutUser();// sign out from socket
      // we continue the current game, do not start new game
      that.newGame();
       
      return;
  }
  const { id } = await this.socket.emit("createUser", user);
  if (debug) { log("createUser join table, user id = " + id); }
  
  that.playername = user.name;
  that.joinRoom(user);
},
joinRoom (user) {
  // const { id } = await this.socket.emit("createUser", user);
  // log("createUser done, id = " + id);
  this.roomname = user.room;
  
  this.socket.emit("joinRoom", user, function(data) {
    if (debug) { log("joinRoom: " + JSON.stringify(data)); }
    that.playernr = data.nr;

    if (debug) { log("joinRoom done, playernr = " + that.playernr); }
    if (that.playernr === 0) {
      let msg = "Der Tisch " +  user.room + " ist bereits besetzt. Möchtest Du alleine gegen die KI weiterspielen?"
      that.saGetAnswer("Anmeldung", msg, "Nein", "Ja")
        .then(function(result) {
          //gameReplay = false;
          if (debug) { log("joinRoom.saGetAnswer confirm: " + result); }
          that.killGame();
          // that.socket.emit("joinRoomAsKibitz", user, function(data) {
          //     log("joinRoom.joinRoomAsKibitz : " + JSON.stringify(data));
          //     pNr.innerHTML = "Gast " + data.name + "-" + data.room;
          //     //@todo: 
          //     // data.name and data.room are undefined in pnr
          //     // set player names
          //     // send cards to guest
          //     // ...
          // });
        })
        .catch(function(error) {
           if (debug) { log("joinRoom.saGetAnswer, result: " + error.message); }
          that.playerInfo.p1Name = that.playername;
          that.playerInfo.p2Name = "KI";
          multiplayer = false;
          heartbeat.style.display = "none";
          numElem.style.display = "none";
          pNr.style.display = "none";
          exitbtn.style.display = "none";
          chatbtn.style.display = "none";
          onlinebtn.style.display = "none";
          uname = "";
          tname = "";
          that.socket.disconnect(true);
          // we continue the current game, do not start new game
          that.newGame();
        }); 

    } else if (that.playernr === 1) {
      // that.playersTurn = true;
      that.playerInfo.p1Name = user.name;
      that.playersOnline++;
      that.updateHeartbeatSpan(); 
      let msg = "Ja > ich warte auf Mitspieler, <br>Nein > ich spiele ganz alleine."
      that.saGetAnswer("Warte auf Mitspieler", msg, "Nein", "Ja")
        .then(function(result) {
          //gameReplay = false;
          if (debug) { log("joinRoom, saGetAnswer confirm: " + result); }
          //that.playerInfo.p1Name = that.playername;
          //that.playerInfo.p2Name = "KI";
          multiplayer = false;
          heartbeat.style.display = "none";
          numElem.style.display = "none";
          pNr.style.display = "none";
          exitbtn.style.display = "none";
          chatbtn.style.display = "none";
          onlinebtn.style.display = "none";
          that.newGame();
        })
        .catch(function(error) {
          if (debug) { log("joinRoom.saGetAnswer, negative result: " + error.message); }
          that.saShowInfoDialog("Warte auf Mitspieler am Tisch: " + that.roomname)
        });                   
    } else if (that.playernr === 2) {
      that.playerInfo.p2Name = user.name;
      // that.playersTurn = false;
      that.playersOnline++;
      that.updateHeartbeatSpan();
      //that.playersTurn = false;
    }
  });
},
signoutUser() {
      // send nickname to server, get answer
   let userName = this.playernr === 1 ? this.playerInfo.p1Name : this.playerInfo.p2Name;
   let tableName = this.roomname;
      this.socket.emit('signout', {
        'nickname' : userName,
        'tablename' : tableName
       }, function(data) {  
            if (data) {
              // nickname on server 
              if (debug) { log('signoutUser: nickname sent successfully to server'); }
              // callback(null, 'signoutUser done!');
            } else {
              if (debug) { log('signoutUser: Sorry, Spieler: ' + userName + ' nicht gefunden!'); }
            }
          }); // function(data) { 
},
whosOnline() {
   if (debug) { log("whosOnline"); }
   this.socket.emit('whosonline', {}, function(data) {
    if (debug) { log("whosOnline: " + JSON.stringify(data)); }
      if (data.playersOnline > 0) {
        //$('#friends').val("Online: " + data.playersOnline);
      // alert(' Freunde online: ' + data.playersOnline + '\n' + data.playerNames);
        that.saShowPlayersOnline(data.playersOnline, data.playerNames);
      } else {
        that.saShowPlayersOnline(0, 'Leider ist noch niemand angemeldet!');
        // alert('Sorry, niemand ist angemeldet!');
      }
  })
},
onUpdatePlayers(data) {
  if (debug) { log("onUpdatePlayers, data = " + JSON.stringify(data)); }
  this.playersOnline--;
  this.updateHeartbeatSpan();
  //multiplayer = false;
  this.playernr = 1;
  let msg = data.name + " ist raus, Du gegen KI!<br>" +
            "Ja > am Tisch spielen.<br>Nein > Tisch verlassen für Solospiel."
  if (debug) { log(msg); }
  this.saGetAnswer("SPIELERFLUCHT", msg, "Nein", "Ja")
        .then(function(result) {
          //gameReplay = false;
          if (debug) { log("onUpdatePlayers, saGetAnswer nein: " + result); }
          that.playerInfo.p1Name = that.playername;
          that.playerInfo.p2Name = "KI";
          multiplayer = false;
          heartbeat.style.display = "none";
          numElem.style.display = "none";
          pNr.style.display = "none";
          exitbtn.style.display = "none";
          chatbtn.style.display = "none";
          onlinebtn.style.display = "none";
          that.newGame();
        })
        .catch(function(error) {
          if (debug) { log("onUpdatePlayers.saGetAnswer, ja: " + error.message); }
          that.newGame();
        });  

},
onStartGame(data) {
  if (debug) { log("onStartGame, data = " + JSON.stringify(data)); }
  this.playersOnline++;
  this.updateHeartbeatSpan();
  this.saShowTimerInfoDialog("Der Tisch ist voll, " + data[0].name + " beginnt!");

  if (!multiplayer) {
    if (debug) { log(">>> onStartGame other player wants to play... "); }
    //@todo: alert user and ask if he would like a player
    //    alert(data[1].name + " möchte mitspielen, ok?");
    let msg = data[1].name + " möchte mitspielen, ok?";
    this.saGetAnswer("Mitspieler", msg, "Nein", "Ja")
      .then(function(result) {
        //gameReplay = false;
        if (debug) { log("onStartGame.saGetAnswer, dont allow other player: " + result); }
        //that.newGame();
      })
      .catch(function(error) {
        // ooops, glitch or finito
        if (debug) { log("onStartGame.saGetAnswer, yes, allow other player: " + error.message); }
          if (automode) {
            that.toggleAutomode();
          }
          multiplayer = true;
          //that.newGame();
          gameStarted = true;
          that.playersTurn = false;
          that.prepareTableLayout();
          that.playerInfo.p1Name = data[0].name;
          that.playerInfo.p2Name = data[1].name;
          that.createCardDeck();

stopAlertPlayer("p1deck"); 
stopAlertPlayer("p2deck");
    
          if (multiplayer && that.playernr === 1) {
            that.dumpCards(); //this.replaystr = str;
            that.socket.emit("sendDeck", {room:that.roomname, deck:that.replaystr}, function(data) {
                if (debug) { log("onStartGame sendDeck: " + JSON.stringify(data)); }
            });
          } 
          that.startGame(); 
      });  
  } else {
    if (debug) { log(">>> onStartGame: 2 want to play... "); }
    gameStarted = true;
    this.playerInfo.p1Name = data[0].name;
    this.playerInfo.p2Name = data[1].name;
    this.createCardDeck();
 stopAlertPlayer("p1deck"); 
 stopAlertPlayer("p2deck");
 
    if (multiplayer && this.playernr === 1) {
      this.dumpCards(); //this.replaystr = str;
      this.socket.emit("sendDeck", {room:this.roomname, deck:this.replaystr}, function(data) {
          if (debug) { log("onStartGame sendDeck: " + JSON.stringify(data)); }
      });
    }  
    this.startGame();
  }
  if (debug) { log(">>> onStartGame exit "); }

},
onStartNewGame(data) {
  if (debug) { log("onStartNewGame, data = " + JSON.stringify(data)); }
  this.saShowTimerInfoDialog("Neue Partie, " + data[0].name + " beginnt!");
  if (automode) {
    this.toggleAutomode();
  }
  // automode = false;
  this.prepareTableLayout();
  this.createCardDeck();
  this.playersTurn = false;
  if (multiplayer && this.playernr === 1) {
    this.dumpCards(); //this.replaystr = str;
    this.socket.emit("sendDeck", {room:this.roomname, deck:this.replaystr}, function(data) {
        if (debug) { log("onStartNewGame sendDeck: " + JSON.stringify(data)); }
    });
  }  
  this.startGame();
},
onAutomode(data) {
  if (debug) { log("onAutomode, data = " + JSON.stringify(data)); }
  if (this.playernr === 1) { 
    return; 
  }
  else {
    if (debug) {  log(" other player, use deck from player 1 " + JSON.stringify(data));}
//    this.toggleAutomode();
    automode = data.automode;
    this.titleStyle.backgroundColor = automode ? "blue" : "black";

  }
},
onUseDeck(data) {
  if (debug) { log("onUseDeck, data = " + JSON.stringify(data)); }

  if (this.playernr === 1) { 
    return; 
  }
  else {
    if (debug) { log(" other player, use deck from player 1 " + JSON.stringify(data)); }
    // player 2 receives cards from player 1, so it's a special card deck
    // let ps = playSpecialDeck;
    // playSpecialDeck = true;
    this.displaySpecialDeck(data);
    // playSpecialDeck = ps;
  }
},
onChangeNumCards(data) {
  if (debug) { log("onChangeNumCards, data = " + JSON.stringify(data)); }
  // console.log("onChangeNumCards, data = " + JSON.stringify(data)); 
  numcards = data.numCards;
  // stop a started game
  this.gameStarted = false;
  this.displayInitialDeck();
  if (this.playernr === 1) {
    let movedata = {room: this.roomname, fromplayer: this.playernr};
    this.socket.emit("newGame", movedata, function(data) {
        if (debug) { log("onChangeNumCards.newGame: " + JSON.stringify(data)); }
    });
  }
  else {
    if (debug) { log(" other player, use deck from player 1 " + JSON.stringify(data)); }
    // player 2 receives cards from player 1, so it's a special card deck
  }
},
onFlipCard(data) {
  if (debug) { log("onFlipCard, data = " + JSON.stringify(data));}
  if (this.playernr === data.fromplayer) { 
    return; 
  }
  else {
    if (debug) { log(" other player, flip card data = " + JSON.stringify(data));}
    if (data.fromplayer === 1) {
      setImgurl(this.p1deck, data.card.imgurl);
    } else {
      setImgurl(this.p2deck, data.card.imgurl);
    }
  }
},
onSwitchStack(data) {
  if (debug) { log("onSwitchStack, data = " + JSON.stringify(data)); }
  if (this.playernr === data.fromplayer) { 
    return; 
  }
  else {
    if (debug) {  log(" other player, switch player stack data = " + JSON.stringify(data));}
    let decklen = (data.fromplayer === 1) ? this.p1deck.cards.length : this.p2deck.cards.length;
    if (decklen === 0) {
      this.switchPlayerStack(data.fromplayer);
    }
  }
},
onMoveCard(data) {
  if (debug) { log("onMoveCard, data = " + JSON.stringify(data)); }
  if (this.playernr === data.fromplayer) { 
    return; 
  }
  else {
    if (debug) { log(" other player, move card data = " + JSON.stringify(data)); }
    this.moveCard(data.card, data.fromplayer, data.toplayer, data.srcel, data.destel);
  }
},
onMoveCardAndSwitchPlayer(data) {
  //  { console.log("onMoveCardAndSwitchPlayer, data = " + JSON.stringify(data)); }
  if (debug) { log("onMoveCardAndSwitchPlayer, data = " + JSON.stringify(data)); }
  this.clearAmpeln();

  if (this.playernr === data.fromplayer) {
    this.playersTurn = false; 
    if (this.playernr === 2) {
      // HTMLCollection
      document.getElementsByClassName("p1info")[0].style.backgroundColor = "green";
      document.getElementsByClassName("p2info")[0].style.backgroundColor = "red";
    } else {
      document.getElementsByClassName("p2info")[0].style.backgroundColor = "green";
      document.getElementsByClassName("p1info")[0].style.backgroundColor = "red";
    }
    return; 
  }
  else {
     if (debug) { log(" other player, move card data = " + JSON.stringify(data)); }

    this.moveCardToOwnStack(data.fromplayer);
    this.switchPlayers();
  }
},
updateConnectionStatus() {
   if (debug) { log("updateConnectionStatus: connstate = " + connstate + ", " + heartbeat);}

  // NOK heartbeat.firstElementChild.className = connstate ? "fabuttonMissing fas fa-heart" : "fabutton fas fa-heart";
  this.conStateColor = connstate ? "color: red" : "color: blue";
},
checkConnstate() {
   if (debug) { log("checkConnstate");}
  this.socket.emit('serverstatus', {id: this.socket.id}, function(data) { 
    
    if (data) {
      if (debug) { log('checkConnstate: server is alive, data = ' + JSON.stringify(data)); }
      connstate = true;
      that.updateConnectionStatus();  
    } else {
      if (debug) { log('checkConnstate: server does not answer!'); }
      connstate = false;
      that.updateConnectionStatus();
      setTimeout(this.checkConnstate, 5000); 
    }
  }); // function(data) 
},
updateHeartbeatSpan() {
		if (this.playersOnline > 0) {
      numElem.innerHTML = this.playersOnline;
      pNr.innerHTML = this.playernr + " " + this.playername + "-" + this.roomname;
		} else {
			numElem.innerHTML = "";
			pNr.innerHTML = "";
    }

},
onSocketDisconnect() {  
   if (debug) { log("onSocketDisconnect: server went down..."); }
  connstate = false; 
  this.checkConnstate();
},

    openContextMenu(evt) {
      evt.preventDefault();
    },
    onDragStart: (evt) => {
      //https://stackoverflow.com/questions/59084929/pointer-events-none-doesnt-work-on-mobile
      //https://medium.com/swlh/how-to-add-drag-and-drop-to-your-vuejs-project-3fc36e7b766a
      //https://www.mediaevent.de/javascript/drag-and-drop.html

      let target = evt.target,
        card = null,
        fromTarget = evt.target.id;
      if (debug) { log("onDragStart: target = " + target.id + ", evt = " + JSON.stringify(evt)); }
//nok polyfill.dragImageOffset = {x: target.x, y: target.y};
      //https://www.kryogenix.org/code/browser/custom-drag-image.html
      //let imgelem = new Image(100,100);
      //imgelem.width = "10px");
      //imgelem.height = "auto";
      //imgelem.setAttribute("alt", "Arrkei");
      //imgelem.setAttribute("title", "Arrkei");
      //imgelem.setAttribute("src", "../img/sword.e00fed84.png");

      //is drag allowed from target ?
      if (multiplayer) {
        if (that.playersTurn) {
          if (that.playernr === 1) {
            if (fromTarget === "p2deck" || fromTarget === "p2stack") {
              if (debug) { log(" illegal source"); }
              evt.preventDefault();
              return;              
            }
          } else {
            if (fromTarget === "p1deck" || fromTarget === "p1stack") {
              if (debug) { log(" illegal source"); }
              evt.preventDefault();
              return;              
            }
          }
        } else {
             if (debug) { log(" illegal source"); }
              evt.preventDefault();
              return;              
        }
      } else {
          if (!that.playersTurn && (fromTarget === "p1deck" || fromTarget === "p1stack")) {
            if (debug) { log(" illegal source"); }
            evt.preventDefault();
            return;
          }
          if (that.playersTurn &&
            (fromTarget === "p2deck" || fromTarget === "p2stack")
          ) {
            if (debug) { log(" illegal source"); }
            //that.$swal("Warte!", "Geht's noch? Erst bei Gün bitte!", "error");
            evt.preventDefault();
            return;
          }
      }

      switch (fromTarget) {
        case "p1deck":
          if (that.p1deck.cards.length === 0) {
            if (debug) { log("onDragStart not possible, no card in " + fromTarget); }
            return;
          }
          card = that.p1deck.cards[that.p1deck.cards.length - 1];
          break;
        case "p1stack":
          if (that.p1stack.cards.length === 0) {
            if (debug) { log("onDragStart not possible, no card in " + fromTarget); }
            return;
          }
          card = that.p1stack.cards[that.p1stack.cards.length - 1];
          break;
        case "p2deck":
          if (that.p2deck.cards.length === 0) {
            if (debug) { log("onDragStart not possible, no card in " + fromTarget); }
            return;
          }
          card = that.p2deck.cards[that.p2deck.cards.length - 1];
          break;
        case "p2stack":
          if (that.p2stack.cards.length === 0) {
            if (debug) { log("onDragStart not possible, no card in " + fromTarget); }
            return;
          }
          card = that.p2stack.cards[that.p2stack.cards.length - 1];
          break;
      }
      if (!card.flipped) {
        return;
      }
      let cardobj = {
        fromTarget: fromTarget,
        suit: card.suit,
        rank: card.rank,
        value: card.value,
        imgurl: card.imgurl,
      };

      let datastr = JSON.stringify(cardobj);
      evt.dataTransfer.dropEffect = "move";
      //      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("text/plain", "" + datastr);
      /*
      let imgelem = new Image;
//nok  imgelem.width = '3%';
//nok  imgelem.height = 'auto';
      imgelem.src = "https://ergeka.com/images/rkices.png"; //require("../" + card.imgurl); //
      evt.dataTransfer.setDragImage(imgelem, 0, 0);
*/
      //evt.currentTarget.classList.add('bgGreen');
      // hide card
      // setTimeout(function() {
      //   target.style.display = "none";
      // }, 0);

      if (debug) { log("onDragStart: " + evt.currentTarget.classList); }
      //evt.stopPropagation();
      //evt.preventDefault();

      if (debug) { log("onDragStart, evt.dataTransfer.setData: " + datastr); }
    },

    onDragOver(evt) {
      if (debug) { log("onDragOver"); }
      // Change the target element's border to signify a drag over event
      // has occurred
      //evt.currentTarget.style.background = "lightblue";
      evt.preventDefault();
    },
    onDragEnd(evt) {
      // let mouse go
      if (debug) { log("onDragEnd, evt = " + evt); }
      // Restore source's border
      //evt.target.style.border = "solid red";
      // Remove all of the drag data
      // evt.currentTarget.classList.remove("bgGreen");
      // evt.dataTransfer.clearData();
      // if (debug) { log("onDragEnd: " + evt.currentTarget.classList); }
    },
    onDragLeave(evt) {
      // dragged elem leaves droppable elem
      if (debug) { log("onDragLeave, evt = " + evt); }
      // evt.currentTarget.classList.remove("bgGreen");
     // if (evt.dataTransfer) { evt.dataTransfer.clearData(); }

    },
    onDrop(evt) {
      // evt.dataTransfer.getData must be the first line because of Firefox!!!
      // get the dataTransfer passed from onDragStart
      if (!evt.dataTransfer) { return; }
      let cardstr = evt.dataTransfer.getData("text/plain"),
        target = evt.target;
      if (debug) { log("onDrop typeof cardstr === " + typeof cardstr); }
      if (
        cardstr.startsWith("{") === false ||
        cardstr.indexOf("fromTarget") === -1
      ) {
        if (debug) { log(" illegal source"); }
        //this.$swal("Äää", "Geht's noch?", "error");
        return;
      }

      let that = this;
        // url = "";
      //this.cardDropped = true;
      var targetid = evt.target.id;
      if (debug) { log("onDrop: to target = " + JSON.stringify(target)); }
      evt.preventDefault();
      // make card object from data Transfer string
      let cardobj = JSON.parse(cardstr);
      // extract and remove card from target name
      let fromTarget = cardobj.fromTarget;
      delete cardobj.fromTarget;

      //if (debug) { log("onDrop: cardstr = " + cardstr + " from target: " + fromTarget);
      if (debug) { log(
        "onDrop: card obj = " +
          JSON.stringify(cardobj) +
          " from target: " +
          fromTarget
      ); }
        // wiggle card, now done with animate.css
        // evt.currentTarget.classList.add("bounce");
        // fromTarget.classList.add('animate__animated', 'animate__rubberBandIn');
        // target.classList.add('animate__animated', 'animate__rubberBandIn');
      // evt.currentTarget.classList.remove("bgGreen");
      // document.getElementById("p1deck").style.display = "block";
      switch (fromTarget) {
        case "p1deck":
          if (targetid === "p2stack") {
            if (this.mayMoveCardToPlayerStack(cardobj, 1, 2) ) {
              // this.moveCardToPlayerStack(cardobj, 1, 2);
              this.moveCard(cardobj, 1, 2, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.p2stack);
            }
          } else if (targetid === "stack") {
            if (this.mayMoveCardToStack(cardobj, 1) ) {
//              this.moveCardToStack(cardobj, 1);
              this.moveCard(cardobj, 1, -1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.stack);
            }
          } else if (targetid === "p1stack") {
            this.moveCardToOwnStack(1);
            if (multiplayer) { 
              return; 
            }

            if (!playSolo) {
              this.switchPlayers();
              setTimeout(function() {
                //@todo play stack cards, when done play deck card
                that.playStackCards(2, function() {
                  // play deck card
                  document.getElementById("p2deck").click();
                });
                //  document.getElementById("p2deck").click();
              }, timeout);
            } else {
              that.switchPlayers();
            }
          }
          break;
        case "p1stack":
          if (targetid === "p2stack") {
            if (this.mayMoveCardToPlayerStack(cardobj, 1, 2) ) {
//              this.moveCardFromPlayerStackToOpponentStack(cardobj, 1, 2);
              this.moveCard(cardobj, 1, 2, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.p2stack);
            }
          } else if (targetid === "stack") {
            if (this.mayMoveCardToStack(cardobj, 1) ) {
              // this.moveCardFromPlayerStackToStack(cardobj, 1);
              this.moveCard(cardobj, 1, -1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.stack);
            }
          }
          break;
        case "p2deck":
          if (targetid === "p1stack") {
            if (this.mayMoveCardToPlayerStack(cardobj, 2, 1) ) {
              // this.moveCardToPlayerStack(cardobj, 2, 1);
              this.moveCard(cardobj, 2, 1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.p1stack);
            }
          } else if (targetid === "stack") {
            if (this.mayMoveCardToStack(cardobj, 2) ) {
              // this.moveCardToStack(cardobj, 2);
              this.moveCard(cardobj, 2, -1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.stack);
            }
          } else if (targetid === "p2stack") {
            this.moveCardToOwnStack(2);
            if (multiplayer) { 
              return; 
            }
            if (playSolo) {
              this.switchPlayers();
            }
          }
          break;
        case "p2stack":
          if (targetid === "p1stack") {
            if (this.mayMoveCardToPlayerStack(cardobj, 2, 1) ) {
              // this.moveCardFromPlayerStackToOpponentStack(cardobj, 2, 1);
              this.moveCard(cardobj, 2, 1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.p1stack);
            }
          } else if (targetid === "stack") {
            if (this.mayMoveCardToStack(cardobj, 2) ) {
              // this.moveCardFromPlayerStackToStack(cardobj, 2);
              this.moveCard(cardobj, 2, -1, fromTarget, targetid);
            } else {
              showIllegalMoveToStack(this.stack);
            }
          }
          break;
      }
      // setTimeout(function() { 
      //    target.classList.remove('animate__animated', 'animate__zoomIn');
      // }, 1000);

    },
    createCardDeck() {
      if (playSpecialDeck) {
        //this.displaySpecialDeck("s10,ek,so,g10,eo,h10,ho,ea,hu,gu,sa,hk,ga,ha,eu,go,sk,e10,su,gk");
        this.displaySpecialDeck("gu,gk,e10,go,sk,ek,sa,h10,s10,ga,eo,hu,su,ha,ho,eu,hk,ea,so,g10");
        //this.displaySpecialDeck("eu,eo,ek,ea,e10,su,so,sk,s10,sa,go,gu,g10,gk,ho,hk,h10,ga,hu,ha");
        //this.displaySpecialDeck("gu,g10,sk,eu,go,ek,sa,su,ha,ea,ga,eo,ho,s10,e10,hu,gk,hk,so,h10");
      }else{
        this.displayInitialDeck();
        //done in above this.shuffleDeck();
      }      
    },
    displayInitialDeck() {
      if (debug) { log("displayInitialDeck"); }

      let id = 1,
        len = numcards === 20 ? this.ranks20.length : this.ranks36.length;
      this.cards = [];
      for (let s = 0; s < this.suits.length; s++) {
        for (let r = 0; r < len; r++) {
          let rank = numcards === 20 ? this.ranks20[r] : this.ranks36[r];
          let value = numcards === 20 ? this.values20[r] : this.values36[r];
          let card = {
            id: id,
            rank: rank,
            value: value,
            suit: this.suits[s],
            flipped: false,
            imgurl: "assets/" + this.suits[s] + rank + ".png",
          };
          this.cards.push(card);
          id++;
        }
      }
      this.isDeckShuffled = false;
      this.shuffleCount = 0;
      this.shuffleDeck();
      this.dealCards();
    },
    displaySpecialDeck(cardstr) {
      if (debug) { log("displaySpecialDeck: cardstr = " + cardstr); }
      let id = 1,
        arr = cardstr.split(","),
        len = arr.length;
      this.cards = [];
      for (let i = 0; i < len; i++) {
        let cs = arr[i];
        let suit = cs.charAt(0);
        let rank = cs.substring(1, cs.length);
        let idx = len === 20 ? this.ranks20.indexOf(rank) : this.ranks36.indexOf(rank);
        let value = len === 20 ? this.values20[idx] : this.values36[idx];
        let card = {
          id: id,
          rank: rank,
          value: value,
          suit: suit,
          flipped: false,
          imgurl: "assets/" + suit + rank + ".png",
        };
        this.cards.push(card);
        if (debug) { log("displaySpecialDeck: card = " + JSON.stringify(card)); }
        id++;
      }
      this.isDeckShuffled = true;
      this.shuffleCount = 1;
      this.dealCards();
    },
    shuffleDeck() {
      if (debug) { log("shuffleDeck"); }
      for (let i = this.cards.length - 1; i > 0; i--) {
        let randomIndex = Math.floor(Math.random() * i);

        let temp = this.cards[i];
        temp.flipped = false;
        // vm.$set error  'vm' is not defined  no-undef
        this.$set(this.cards, i, this.cards[randomIndex]);
        this.$set(this.cards, randomIndex, temp);
      }

      this.isDeckShuffled = true;
      this.shuffleCount = this.shuffleCount + 1;
    },
    dealCards() {
      if (debug) { log("dealCards"); }
      this.p1deck.cards.length = 0;
      this.p2deck.cards.length = 0;
      this.p1stack.cards.length = 0;
      this.p2stack.cards.length = 0;
      this.stack.cards.length = 0;
      for (let i = 0; i < this.cards.length; i++) {
        let card = this.cards[i];
        i % 2 === 0
          ? this.p1deck.cards.push(card)
          : this.p2deck.cards.push(card);
      }
      // if (debug) {
      //   this.dumpPlayerDecks();
      // }
    },
    dumpPlayerDecks() {
      if (debug) { log("dumpPlayerDecks: "); }
      if (debug) { log(" --> deck player 1: "); }
      for (var i = 0, l = this.p1deck.cards.length; i < l; i++) {
        if (debug) { log(
          " card no = " +
            i +
            " --> " +
            this.p1deck.cards[i].suit +
            " " +
            this.p1deck.cards[i].rank
        );
      } }
      if (debug) { log(" --> Deck player 2: "); }
      for (i = 0, l = this.p2deck.cards.length; i < l; i++) {
        if (debug) { log(
          " card no = " +
            i +
            " --> " +
            this.p2deck.cards[i].suit +
            " " +
            this.p2deck.cards[i].rank
        );
      } }
    },
    dumpCards() {
      //console.if (debug) { log("dumpCards: ");
      let str = "";
      for (var i = 0, l = this.cards.length; i < l; i++) {
        str += this.cards[i].suit + this.cards[i].rank;
        if (i < l - 1) {
          str += ",";
        }
      }
      if (debug) { log(str); }
      //alert(str);
      this.replaystr = str;
    },
    replayGame() {
      this.newGame();
      this.displaySpecialDeck(this.replaystr);
      this.replaystr = "";
    },
    startGame() {
      gameStarted = true;
      this.setGameTimeout();
      this.clearAmpeln();

      // data playersTurn = false so we need to set it to true
      if (!multiplayer) {
        this.switchPlayers();
      } else {
       if (this.playernr === 1) {
         this.switchPlayers();
       } else {
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "red";
       }
      }
    },
    prepareTableLayout() {
      setImgurl(this.p1deck, backImgurl);
      setImgurl(this.p2deck, backImgurl);
      setImgurl(this.p1stack, blankImgurl);
      setImgurl(this.p2stack, blankImgurl);
      setImgurl(this.stack, blankImgurl);
      // this.p1deck.imgurl = require("../assets/back7.png");
      // this.p2deck.imgurl = require("../assets/back7.png");
      // this.p1stack.imgurl = require("../assets/black.png");
      // this.p2stack.imgurl = require("../assets/black.png");
      // this.stack.imgurl = require("../assets/black.png");
      this.isDeckShuffled = false;
      this.playerInfo.p1Hands = 0;
      this.playerInfo.p2Hands = 0;
      gameStarted = true;
      gameOver = false;
      winner = 0;      
    },
    newGame() {
      this.prepareTableLayout();
      this.createCardDeck()
      this.dealCards();
      this.playersTurn = false;
      this.switchPlayers();
    },
    resetGameParameters() {
      gameStarted = false;
      this.p1deck.cards.length = 0;
      this.p2deck.cards.length = 0;
      this.p1stack.cards.length = 0;
      this.p2stack.cards.length = 0;
      this.stack.cards.length = 0;
    },
    killGame() {
      this.gameKilled = true;
      if (debug) { log("killGame, gameKilled = " + this.gameKilled); }
      this.resetGameParameters();

      setImgurl(this.p1deck, illegalImgurl);
      setImgurl(this.p1stack, illegalImgurl);
      setImgurl(this.p2deck, illegalRotImgurl);
      setImgurl(this.p2stack, illegalRotImgurl);
      setImgurl(this.stack, killerImgurl);      

      if (multiplayer) {
        heartbeat.style.display = "none";
        numElem.style.display = "none";
        pNr.style.display = "none";
        exitbtn.style.display = "none";
        chatbtn.style.display = "none";
        onlinebtn.style.display = "none";

      }
      // gameStarted = false;
      // this.p1deck.cards.length = 0;
      // this.p2deck.cards.length = 0;
      // this.p1stack.cards.length = 0;
      // this.p2stack.cards.length = 0;
      // this.stack.cards.length = 0;

      // setImgurl(this.p1deck, illegalImgurl);
      // setImgurl(this.p1stack, illegalImgurl);
      // setImgurl(this.p2deck, illegalRotImgurl);
      // setImgurl(this.p2stack, illegalRotImgurl);
      // setImgurl(this.stack, killerImgurl);
      // this.p1deck.imgurl = require("../assets/sword2.png");
      // this.p1stack.imgurl = require("../assets/sword2.png");
      // this.p2deck.imgurl = require("../assets/sword2rot.png");
      // this.p2stack.imgurl = require("../assets/sword2rot.png");
      // this.stack.imgurl = require("../assets/tenor.gif");
    },
    stopGame() {
      if (multiplayer) {
      //  alert("Willst Du wirklich das Spiel verlassen?");
      this.saGetAnswer("SPIELERFLUCHT", "Willst Du wirklich das Spiel verlassen?", "Nein", "Ja")
        .then(function(result) {
          //gameReplay = false;
          if (debug) { log("stopGame.saGetAnswer: " + result); }
         })
        .catch(function(error) {
          // ooops, glitch or finito
          if (debug) { log("stopGame.saGetAnswer, negative result: " + error.message); }
            that.signoutUser();
              that.killGame();
              that.playersOnline = 0;
              that.updateHeartbeatSpan();
              heartbeat.style.display = "none";
              exitbtn.style.display = "none";
              chatbtn.style.display = "none";
              onlinebtn.style.display = "none";

              gameStarted = false;
              //that.signin();
        });  
      }
    },
    toggleAutomode() {
      automode = !automode;
      this.setGameTimeout();
      if (debug) { log("toggleAutomode, automode = " + automode); }
      if (multiplayer) {
        // game owner may start automode
        if (this.playernr === 1) {
          this.titleStyle.backgroundColor = automode ? "blue" : "black";
          if (debug) { log("toggleAutomode emit automode: "); }
          this.socket.emit("automode", {room:this.roomname, automode: automode}, function(data) {
              if (debug) { log("toggleAutomode: " + JSON.stringify(data)); }
          });
        }
      } else {
        this.titleStyle.backgroundColor = automode ? "blue" : "black";
      }
    },
    setGameTimeout(ms) {
      let to = ms || 1000;
      // if (multiplayer) { /* due to socket comm it cant go to fast*/ to = 1000; }
      timeout = to; //automode ? 50 : 1000;
      if (debug) { log("setGameTimeout: timeout = " + timeout); }
    },
    switchPlayers() {
      // if (multiplayer) { 
      //   (this.playernr === 1) ? this.playersTurn = true : this.playersTurn = false; 
      // } else {
      //   this.playersTurn = !this.playersTurn;
      // }
      this.playersTurn = !this.playersTurn;
      if (debug) { log("switchPlayers, player nr = " + this.playernr + ", players turn = " + this.playersTurn); }
      if (multiplayer) {
        if (this.playernr === 1) {
          // HTMLCollection
          this.p1ampel.backgroundColor = "green";
          this.p2ampel.backgroundColor = "transparent";
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "red";
          alertPlayer("p1deck");
          if (automode) {
            document.getElementById("p1deck").click();
          }
        } else {
          this.p2ampel.backgroundColor = "green";
          this.p1ampel.backgroundColor = "transparent";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "red";
          alertPlayer("p2deck");
          if (automode) {
            document.getElementById("p2deck").click();
          }
        }
      } else {
        if (this.playersTurn) {
          this.p1ampel.backgroundColor = "green";
          this.p2ampel.backgroundColor = "transparent";
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "red";
          alertPlayer("p1deck");

        } else {
          this.p2ampel.backgroundColor = "green";
          this.p1ampel.backgroundColor = "transparent";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "red";
          if (playSolo) {
            alertPlayer("p2deck");
          } 
        }
      }
      setTimeout(function() {
        that.setStackAmpeln();
      },  timeout);
    },
    clearAmpeln() {
      this.p1ampel.backgroundColor = "transparent";
      this.p2ampel.backgroundColor = "transparent";
      this.p1stackampel.backgroundColor = "transparent";
      this.p2stackampel.backgroundColor = "transparent";
    },
    setStackAmpeln() {
      let card,
        fromplayer = 1,
        toplayer = 2;

      if (debug) { log("setStackAmpeln..."); }
      // if (multiplayer) { 
      //   (this.playernr === 1) ? this.playersTurn = true : this.playersTurn = false; 
      // } else {
      //   this.playersTurn = !this.playersTurn;
      // }
      //player 1
      // if (this.playersTurn) {
      //    if (this.playernr === 1) {
      //     fromplayer = 1;
      //     toplayer = 2;
      //    } else {
      //     fromplayer = 2;
      //     toplayer = 1;
      //    }
      // } else {
      //    if (this.playernr === 1) {
      //     fromplayer = 1;
      //     toplayer = 2;
      //     this.p1stackampel.backgroundColor = "transparent";
      //    } else {
      //     fromplayer = 2;
      //     toplayer = 1;
      //     this.p2stackampel.backgroundColor = "transparent";
      //    }
      // }
      if (this.p1stack.cards.length === 0) {
        this.p1stackampel.backgroundColor = "transparent";
        //this.p1stackcard.backgroundColor = "transparent";
      } else if (!this.playersTurn) {
        this.p1stackampel.backgroundColor = "transparent";
        //this.p1stackcard.backgroundColor = "transparent";
      } else {
        card = this.p1stack.cards[this.p1stack.cards.length - 1];
        if (this.mayMoveCardToPlayerStack(card, fromplayer, toplayer)) {
          this.p1stackampel.backgroundColor = "green";
          //this.p1stackcard.backgroundColor = "#f1da0a";
        } else {
          if (this.mayMoveCardToStack(card, fromplayer)) {
            this.p1stackampel.backgroundColor = "green";
            //this.p1stackcard.backgroundColor = "#f1da0a";
          } else {
            this.p1stackampel.backgroundColor = "transparent";
            //this.p1stackcard.backgroundColor = "transparent";
          }
        }
      }
      //player 2
      fromplayer = 2;
      toplayer = 1;
      if (this.p2stack.cards.length === 0) {
        this.p2stackampel.backgroundColor = "transparent";
        //this.p2stackcard.backgroundColor = "transparent";
      } else if (!this.playersTurn) {
        this.p2stackampel.backgroundColor = "transparent";
      } else {
        card = this.p2stack.cards[this.p2stack.cards.length - 1];
        if (this.mayMoveCardToPlayerStack(card, fromplayer, toplayer)) {
          this.p2stackampel.backgroundColor = "green";
          //this.p2stackcard.backgroundColor = "#f1da0a";
        } else {
          if (this.mayMoveCardToStack(card, fromplayer)) {
            this.p2stackampel.backgroundColor = "green";
            //this.p2stackcard.backgroundColor = "#f1da0a";
          } else {
            this.p2stackampel.backgroundColor = "transparent";
            //this.p2stackcard.backgroundColor = "transparent";
          }
        }
      }
      if (debug) { log("setStackAmpeln done."); }

    },
    switchPlayerStack(player) {
      let cnt = 0;
      if (debug) { log("switchPlayerStack of player: " + player); }
      if (player === 1) {
        while (this.p1stack.cards.length > 0) {
          let card = this.p1stack.cards.pop();
          card.flipped = false;
          this.p1deck.cards.push(card);
          cnt++;
        }
        this.p1deck.imgurl = require("../assets/back7.png");
        this.p1stack.imgurl = require("../assets/black.png");
      } else {
        while (this.p2stack.cards.length > 0) {
          let card = this.p2stack.cards.pop();
          card.flipped = false;
          this.p2deck.cards.push(card);
          cnt++;
        }
        this.p2deck.imgurl = require("../assets/back7.png");
        this.p2stack.imgurl = require("../assets/black.png");
      }

      if (debug) { log("  --> switched cards: " + cnt); }
    },
    playCard(evt) {
      let that = this, 
        el = evt.currentTarget.id,
        fromplayer = 0,
        toplayer = -1;


      if (debug) { log("playCard: click on = " + el); }

      // game over ?
      if (gameOver) {
//console.log("playCard game over after last move...");
        if (debug) { log("playCard game over after last move..."); }
        let wname = (winner === 1) ? this.playerInfo.p1Name : this.playerInfo.p2Name;
        let lname = (winner === 1) ? this.playerInfo.p2Name : this.playerInfo.p1Name;
        let msg = "Sorry " + lname + ", " + wname + " gewinnt!";
        setTimeout(function() {
          if (winner === 1) {
            setImgurl(that.p1deck, winnImgurl);
            setImgurl(that.p1stack, winnImgurl);
            setImgurl(that.p2deck, looseImgurl);
            setImgurl(that.p2stack, looseImgurl);
          } else {
            setImgurl(that.p1deck, looseImgurl);
            setImgurl(that.p1stack, looseImgurl);
            setImgurl(that.p2deck, winnImgurl);
            setImgurl(that.p2stack, winnImgurl);
          }
          // if (multiplayer) {
          //   if (winner === that.playernr) {

          //   }
          // }
          that.handleGameOver(msg, winner === that.playernr);
        }, timeout);
        return;
      }
      // did the right player click?
      if (!multiplayer) {
        if (el === "p1deck") {
            if (!this.playersTurn) {
                if (debug) { log("playCard not allowed, it's oppenents turn!"); }
                return;
            } else {
                fromplayer = 1;
                toplayer = 2;
                // stop player alert
                stopAlertPlayer("p1deck");
                // document.getElementById("p1deck").classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
            }
          } else if (el === "p2deck") {
            if (this.playersTurn) {
                if (debug) { log("playCard not allowed, it's players turn!"); }
                return;
            } else {
                fromplayer = 2;
                toplayer = 1;
          if (playSolo) {
            // stop player alert
            stopAlertPlayer("p2deck");
            // document.getElementById("p2deck").classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
          }
         }
      } else {
        if (debug) { log("playCard not allowed on element = " + el); }
        return;
      }
      } else {
        if (el === "p1deck") {
          if (!this.playersTurn) {
              if (debug) { log("playCard not allowed, it's oppenents turn!"); }
              return;
          } else {
              fromplayer = 1;
              toplayer = 2;
              // stop player alert
              document.getElementById("p1deck").classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
          }
        } else if (el === "p2deck") {
          if (!this.playersTurn) {
              if (debug) { log("playCard not allowed, it's players turn!"); }
              return;
          } else {
              fromplayer = 2;
              toplayer = 1;
              if (multiplayer || playSolo) {
                // stop player alert
                stopAlertPlayer("p2deck");
                // document.getElementById("p2deck").classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
              }
          }
        } else {
          if (debug) { log("playCard not allowed on element = " + el); }
          return;
        }
      }

      // test: shortcut for game over 
      // if (testGameOver) {
      //   if (this.p1deck.cards.length === 8) {
      //     this.handleGameOver(that.playerInfo.p1Name + " Heinz gewinnt!");
      //     return;
      //   }
      // }

       //switch stack if necessary
      if (debug) { log("playCard switch stack if necessary..."); }
      let decklen = (fromplayer === 1) ? this.p1deck.cards.length : this.p2deck.cards.length;
      if (decklen === 0) {
        this.switchPlayerStack(fromplayer);
        if (multiplayer) {
          let movedata = {room: this.roomname, fromplayer: fromplayer};
          this.socket.emit("switchStack", movedata, function(data) {
              if (debug) { log("playCard switchStack: " + JSON.stringify(data)); }
          });
        }
        setTimeout(function() {
          document.getElementById(el).click();
        }, timeout);
        return;
      }
  
      // there are cards to play
      // if (debug) { this.dumpPlayerDecks();   }
      // take the top card
      let card = (fromplayer === 1) ? this.p1deck.cards[this.p1deck.cards.length - 1] : this.p2deck.cards[this.p2deck.cards.length - 1];
      if (debug) {  
        let cardstr = card.suit + " " + card.rank + " " + card.value;
        if (debug) { log(" flip card: " + cardstr + " image: " + card.imgurl); }
      }
      // flip the card from deck and change the cards img src
      if (fromplayer === 1) {
        setImgurl(this.p1deck, card.imgurl);
      } else {
        setImgurl(this.p2deck, card.imgurl);
      }
      if (!card.flipped) {
        card.flipped = true;
        // playHand = true;
        if (multiplayer) {
          let movedata = {room: this.roomname, card:card, fromplayer: fromplayer};
          this.socket.emit("flipCard", movedata, function(data) {
              if (debug) { log("playCard flipCard: " + JSON.stringify(data)); }
          });
        }
        // reenter this function and continue after timeout
        setTimeout(function() {
          document.getElementById(el).click();
        }, timeout);
        return;
      }

      // now the card may be moved
      if (debug) { log(" top card: " + JSON.stringify(card)); }

      if (automode) {
        // play stack cards, when done play deck card
        this.playStackCards(fromplayer, function() {
            // play deck card
            that.playDeckCard(card, el, fromplayer, toplayer);
        });
      } else {
        if (fromplayer === 1) {
          if (debug) { log(" user must drag the card: "); }
          return;
        } else {
          if (playSolo || multiplayer) {
            if (debug) { log(" user must drag the card: "); }
            return;
          } else {
            // play stack cards, when done play deck card
            this.playStackCards(fromplayer, function() {
                // play deck card
                that.playDeckCard(card, el, fromplayer, toplayer);
            });
          }
        }
      }
 

    },
    playDeckCard(card, el, fromplayer, toplayer) {
      let destel;
      if (debug) { log("playDeckCard: player: " + fromplayer); }
      // ist Einsacken möglich? 
      if (this.mayMoveCardToPlayerStack(card, fromplayer, toplayer)) {
        // this.moveCardToPlayerStack(card, fromplayer, toplayer);
        destel = toplayer === 1 ? "p1stack" : "p2stack";
        this.moveCard(card, fromplayer, toplayer, el, destel);
        // move stack cards if possible
        setTimeout(function() {
          //@todo play stack cards, when done resume with playCard by triggering a click
          that.playStackCards(fromplayer, function() {
            // play deck card
            document.getElementById(el).click();
          });
        }, timeout);
        // setTimeout(function() {
        //   document.getElementById(el).click();
        // }, timeout);
      } else { // ist Ablage möglich?
        if (this.mayMoveCardToStack(card, fromplayer)) {
          // this.moveCardToStack(card, fromplayer);
          destel = "stack";
          this.moveCard(card, fromplayer, -1, el, destel);
        setTimeout(function() {
          //@todo play stack cards, when done resume with playCard by triggering a click
          that.playStackCards(fromplayer, function() {
            // play deck card
            document.getElementById(el).click();
          });
        }, timeout);

          // setTimeout(function() {
          //   document.getElementById(el).click();
          // }, timeout);
        } else {
          this.moveCardToOwnStack(fromplayer);
            if (multiplayer) { 
              that.playersTurn = false;
              return; 
            }
          //that.playersTurn = false;
          this.switchPlayers();
//          this.playCardP2();
          el = (fromplayer === 1) ? "p2deck" : "p1deck";
          if (automode && fromplayer === 2) { // trigger p2 click on deck
            setTimeout(function() {
              document.getElementById(el).click();
            }, timeout);
          } else if (fromplayer === 1) {
              setTimeout(function() {
                document.getElementById(el).click();
              }, timeout);
          }
        }
      }
    },
    playStackCards(player, callback) {
      let that = this, ret = false, stacklen = 0;

      if (debug) { log("playStackCards: player: " + player); }
      stacklen = (player === 1) ? this.p1stack.cards.length : this.p2stack.cards.length;
      if (stacklen === 0) {
        if (debug) { log("playStackCards: players stack is empty"); }
        setTimeout(callback, 0);
        return;
      }
      // while (stacklen > 0) {
      //   ret = this.playStackCard(player);
      //   if (!ret) { return; }
      //   stacklen = (player === 1) ? this.p1stack.cards.length : this.p2stack.cards.length;
      // }
      (function loop() {
        ret = that.playStackCard(player);
        if (!ret) { 
          setTimeout(callback, 0);
          return; 
        }
        stacklen = (player === 1) ? that.p1stack.cards.length : that.p2stack.cards.length;
        if ( stacklen > 0 ) {
          setTimeout(loop, timeout);
        } else {
          setTimeout(callback, timeout);
          return;
        }
      }());
    },
    playStackCard(player) {
      let that = this,
        bret = false;
      // if (!gameStarted) {
      //   if (debug) { log("playStackCard game not started..."); }
      //   return;
      // }
      // if (player === 1 && !this.playersTurn) {
      //   if (debug) { log("playStackCard not allowed for player = " + player); }
      //   return;
      // }
      // if (player === 2 && this.playersTurn) {
      //   if (debug) { log("playStackCard not allowed for player = " + player); }
      //   return;
      // }
      // if (debug) { log("playStackCard enter..."); }
      // if (player === 1 && this.p1stack.cards.length === 0) {
      //   if (debug) { log(" player 1 stack is empty."); }
      //   return;
      // }
      // if (player === 2 && this.p2stack.cards.length === 0) {
      //   if (debug) { log(" player 2 stack is empty."); }
      //   return;
      // }
      if (debug) { log("playStackCard starts for player = " + player); }
      let card =
        player === 1
          ? this.p1stack.cards[this.p1stack.cards.length - 1]
          : this.p2stack.cards[this.p2stack.cards.length - 1];
      if (!card) {
        if (debug) { log("  players stack seems empty"); }
        return bret;
      }
      
      let fromplayer = player, toplayer = player === 1 ? 2 : 1;
      let el = fromplayer === 1 ? "p1stack" : "p2stack";
      let destel = "stack";

      if (debug) { 
          let cardstr = card.suit + " " + card.rank + " " + card.value;
          log(" top card: " + cardstr + " image: " + card.imgurl); 
      }
      //     setTimeout(function() {
      if (that.mayMoveCardToPlayerStack(card, fromplayer, toplayer)) {
        //that.moveCardFromPlayerStackToOpponentStack(card, fromplayer, toplayer);
        
        destel = toplayer === 1 ? "p1stack" : "p2stack";
        this.moveCard(card, fromplayer, toplayer, el, destel);
        bret = true;
      } else {
        if (that.mayMoveCardToStack(card, fromplayer)) {
          // that.moveCardFromPlayerStackToStack(card, fromplayer);
          destel = "stack";
          this.moveCard(card, fromplayer, -1, el, destel);
          bret = true;
        }
      }
      //      }, timeout);
      return bret;
    },
    mayMoveCardToPlayerStack(card, fromplayer, toplayer) {
      var bret = false;
      var that = this;
      if (debug) { log ("mayMoveCardToPlayerStack from player: " + fromplayer + " to player: " +  toplayer); }
     
      if (debug) { 
        let cardstr = card.suit + " " + card.rank + " " + card.value;
        log(" top card: " + cardstr + " image: " + card.imgurl); 
      }

      // handle move to player 2 stack
      let stacklen =
        toplayer === 1 ? that.p1stack.cards.length : that.p2stack.cards.length;
      if (stacklen > 0) {
        let stackcard =
          toplayer === 1
            ? that.p1stack.cards[that.p1stack.cards.length - 1]
            : that.p2stack.cards[that.p2stack.cards.length - 1];
        if (stackcard.suit === card.suit) {
          let cardval = card.value;
          let stackval = stackcard.value;
          bret = this.isMovePossible(cardval, stackval);
        }
      }
      if (debug) { log(" allowed: " + bret); }

      return bret;
    },
    mayMoveCardToStack(card, player) {
      var bret = false;
      var that = this;
      if (debug) { log("mayMoveCardToStack from player: " + player); }
      
      if (debug) { 
        let cardstr = card.suit + " " + card.rank + " " + card.value;
        log(" top card: " + cardstr + " image: " + card.imgurl); 
        }


      if (that.stack.cards.length === 0) {
        if (card.value === 11) {
           bret = true;
        }
      } else {
        // there are cards on the stack
        let stackcard = that.stack.cards[that.stack.cards.length - 1];
        let cardval = card.value;
        let stackval = stackcard.value;
        if (stackcard.suit === card.suit) {
          bret = this.isMovePossible(cardval, stackval);
        } else {
          // Ein anders farbiges Ass auf eine 10 erlaubt im Stack
          if (cardval === 11) {
            bret = this.isMovePossible(cardval, stackval);
          }
        }
      }
      if (debug) { log(" allowed: " + bret); }
      return bret;
    },
    isMovePossible(cardval, stackval) {
      if (debug) { log("isMovePossible: cardval = " + cardval + ", stackval = " + stackval); }
      if (numcards === 20) {
        if (stackval === 2 && cardval === 3) return true;
        if (stackval === 3 && cardval === 4) return true;
        if (stackval === 4 && cardval === 10) return true;
        if (stackval === 10 && cardval === 11) return true;
        if (stackval === 11 && cardval === 2) return true;
      } else {
        //-- if (cardval === 10) { automode = !automode; }
        if (stackval === 6 && cardval === 7) return true;
        if (stackval === 7 && cardval === 8) return true;
        if (stackval === 8 && cardval === 9) return true;
        if (stackval === 9 && cardval === 10) return true;
        if (stackval === 10 && cardval === 2) return true;
        if (stackval === 2 && cardval === 3) return true;
        if (stackval === 3 && cardval === 4) return true;
        if (stackval === 4 && cardval === 11) return true;
        if (stackval === 11 && cardval === 6) return true;
      }
      return false;
    },
    moveCard(card, fromplayer, toplayer, srcel, destel) {
      let topcard = null;
      let src, dest; 
      // console.log("moveCard: " + fromplayer + " " + srcel + " to " + destel + ", players turn = " + this.playersTurn);
      if (debug) { log("moveCard: " + fromplayer + " " + srcel + " to " + destel + ", players turn = " + this.playersTurn); }
      if (fromplayer === 1) {
        if (srcel === "p1deck") {src = this.p1deck;} else {src = this.p1stack; }
      } else {
        if (srcel === "p2deck") {src = this.p2deck;} else {src = this.p2stack; }
      }
      if (destel === "p1stack") {dest = this.p1stack;} else {dest = this.p2stack;}
      if (toplayer === -1) { dest = this.stack; }

      topcard = src.cards.pop();
      dest.cards.push(topcard);
      setImgurl(dest, topcard.imgurl);
      (fromplayer === 1) ? this.playerInfo.p1Hands++ : this.playerInfo.p2Hands++;

      if (src.cards.length > 0) {
        if(srcel.indexOf("deck") > 0) {
          // this.countCards();
          // let cnt = (fromplayer === 1) ? this.playerInfo.p1Cards : this.playerInfo.p2Cards;
          // if (cnt === 0) { setImgurl(src, siegImgurl); } else { setImgurl(src, backImgurl); }
          setImgurl(src, backImgurl);
          if (multiplayer && this.playersTurn) {
            // xxx alert to player
            if (this.playernr === 1) {
              alertPlayer("p1deck");
            } else {
              alertPlayer("p2deck");
            }
          }
        } else {
          setImgurl(src, src.cards[src.cards.length - 1].imgurl);
        }
      } else {
        setImgurl(src, blankImgurl);
      }
      wiggle(destel);
      this.setStackAmpeln();
      if (this.playernr === fromplayer) {
        let movedata = {room: this.roomname, card:topcard, fromplayer: fromplayer, toplayer: toplayer, srcel: srcel, destel: destel};
        this.socket.emit("moveToStack", movedata, function(data) {
            if (debug) { log("moveCard moveToStack: " + JSON.stringify(data));}
        });
      }

      this.checkGameOver(fromplayer);
    },
    moveCardToOwnStack(player) {
      let card;
      // console.log("moveCardToOwnStack of player: " + player + ", players turn = " + this.playersTurn);
      if (debug) { log("moveCardToOwnStack of player: " + player + ", players turn = " + this.playersTurn); }
      if (player === 1) {
        card = this.p1deck.cards.pop();
        this.p1stack.cards.push(card);
        setImgurl(this.p1stack, card.imgurl)
        // this.p1stack.imgurl = require("../" + card.imgurl);
        if (this.p1deck.cards.length > 0) {
          // this.p1deck.imgurl = require("../assets/back7.png");
          setImgurl(this.p1deck, backImgurl);
        } else {
          // this.p1deck.imgurl = require("../assets/black.png");
          setImgurl(this.p1deck, blankImgurl);
        }
        this.playerInfo.p1Hands++;

      } else {
        card = this.p2deck.cards.pop();
        this.p2stack.cards.push(card);
        setImgurl(this.p2stack, card.imgurl)
        //this.p2stack.imgurl = require("../" + card.imgurl);
        if (this.p2deck.cards.length > 0) {
          // this.p2deck.imgurl = require("../assets/back7.png");
          setImgurl(this.p2deck, backImgurl);
          } else {
          // this.p2deck.imgurl = require("../assets/black.png");
           setImgurl(this.p2deck, blankImgurl);
        }
        this.playerInfo.p2Hands++;
      }
      if (multiplayer && this.playernr === player) {
        if (this.playernr === 1) {
         document.getElementsByClassName("p2info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "red";
        } else {
          document.getElementsByClassName("p1info")[0].style.backgroundColor = "green";
          document.getElementsByClassName("p2info")[0].style.backgroundColor = "red";
        }
        let movedata = {room: this.roomname, card:card, fromplayer: player};
        if (debug) { log("moveCardToOwnStack emit playerCardMovedToOwnStack: " +  JSON.stringify(movedata)); }
        this.socket.emit("moveToOwnStack", movedata, function(data) {
            if (debug) { log("moveToOwnStack: " + JSON.stringify(data)); }
        });
      }
    },
    checkGameOver(fromplayer) {
      let el = (fromplayer === 1) ? "p2deck" : "p1deck";
    
      if (debug) { log("checkGameOver from player: " + fromplayer); }
      if (fromplayer === 1) {
        if (this.p1deck.cards.length === 0 && this.p1stack.cards.length === 0) {
          gameOver = true;
          winner = 1;
          this.playerInfo.p1Score++;
        }
      } else {
        if (this.p2deck.cards.length === 0 && this.p2stack.cards.length === 0) {
          gameOver = true;
          winner = 2;
          this.playerInfo.p2Score++;
        }
      }
      if (gameOver) {
        if (debug) { log("checkGameOver signal game over to playCard: " + el); }
        setTimeout(function() {
          document.getElementById(el).click();
        }, timeout);        

      }
    },
    handleGameOver(msg, isWinnerPlayer) {
       if (debug) { log("handleGameOver winner player: " + isWinnerPlayer); }
     
      gameStarted = false;
      if (this.playernr === 1) { // table owner may decide what to do
        this.saGameOver("GAME OVER", msg)
          .then(function(result) {
            //play again //gameReplay = false;
            if (debug) { log("handleGameOver, saGameOver: " + JSON.stringify(result)); }
            if (multiplayer) {
              // that.newGame();
              let movedata = {room: that.roomname, fromplayer: that.playernr};
              that.socket.emit("newGame", movedata, function(data) {
                  if (debug) { log("handleGameOver.newGame: " + JSON.stringify(data)); }
              });
            }
            else { 
              that.newGame();
            }
          })
          .catch(function(error) {
            if (debug) { log("handleGameOver.saGameOver, negative result: " + error.message); }
            if (multiplayer) {
              that.stopGame();
            }
            else { 
              that.killGame(); 
            }
          });
      } else {
        this.saGameOverInfo("GAME OVER", msg);
      }
    },
    saGameOver(title, info) {
      var that = this;
      var promise = new Promise(function(resolve, reject) {
        that
          .$swal({
            position: "center",
            background: "rgba(33,33,33, 0.2)",
            //width: 320,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: "Nochmal",
            cancelButtonText: "Abbruch",
            reverseButtons: true,
            title:
              '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
              title +
              "</span>",
            html:
              '<span style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 24px;font-weight: bold;">' +
              info +
              "</span>",
          })
          .then(function(result) {
            if (result.value) {
              //that.newGame();
              resolve(result);
            } else {
              var reason = new Error("Abbruch");
              reject(reason); // reject
            }
          });
      }); // var promise
      return promise;
    },
    saGameOverInfo(title, info) {
      that
          .$swal({
            position: "center",
            background: "rgba(33,33,33, 0.2)",
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false,            
            title:
              '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
              title +
              "</span>",
            html:
              '<span style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 24px;font-weight: bold;">' +
              info +
              "</span>",
          })      
    },
    saGetAnswer(title, info, confirmtext, canceltext) {
      var that = this;
      var promise = new Promise(function(resolve, reject) {
        that
          .$swal({
            position: "center",
            background: "rgba(33,33,33, 0.2)",
            //width: 320,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: confirmtext,
            cancelButtonText: canceltext,
            reverseButtons: true,
            title:
              '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
              title +
              "</span>",
            html:
              '<span style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 24px;font-weight: bold;">' +
              info +
              "</span>",
          })
          .then(function(result) {
            if (result.value) {
              //that.newGame();
              resolve(result);
            } else {
              var reason = new Error("Abbruch");
              reject(reason); // reject
            }
          });
      }); // var promise
      return promise;
    },
    saShowPlayersOnline(count, playerlist, ) {
     let divele = document.createElement("div");
      // divele.classList.add("scroll-touch");
      divele.style.background = "grey";
      // divele.style.borderRadius = "15px";
      divele.style.color = "#f1da0a";
      divele.style.paddingLeft = "8px";
      divele.style.fontFamily = "Avenir, Helvetica, Arial, sans-serif";
      divele.style.fontSize = "16px";
      divele.style.fontWeight = "bold";
      divele.style.textAlign = "left";
      divele.style.textIndent = "10px";
      divele.style.overflowY = "scroll";
      divele.style.overflowX = "hidden";
      divele.style.maxHeight = "450px";
disableBodyScroll(divele);

      divele.appendChild(document.createElement("br")); 
      var arr = playerlist.split(";");
      for (var i=0, l=arr.length; i<l; i++) {
        var user = arr[i];
        var t = document.createTextNode(user);
        divele.appendChild(t);
        divele.appendChild(document.createElement("br"));       
      }
      divele.appendChild(document.createElement("br")); 
      this.$swal({
        position: "center",
        background: "rgba(33,33,33, 0.6)",
        width: 400,
        title:'<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;"> Online: ' + count + '</span>',
        // input: 'textarea',
        // // inputPlaceholder: 'Type your message here...',
        // inputAttributes: {
        //   spellcheck: "false",
        //   autocorrect: "off"
        // },
        // //showCancelButton: true,
        // inputValue: playerlist
        showCloseButton: true,
        showConfirmButton: false,
        html: divele,
        showClass: {
          popup: "animated fadeInDown faster",
        },
        hideClass: {
          popup: "animated fadeOutUp faster",
        },        
      })
    }, 
    showInfo() {
      let title = "Infos";
      let divele = document.createElement("div");
      // divele.classList.add("scroll-touch");
      divele.style.background = "grey";
      divele.style.borderRadius = "15px";
      divele.style.color = "#f1da0a";
      divele.style.paddingLeft = "8px";
      divele.style.fontFamily = "Avenir, Helvetica, Arial, sans-serif";
      divele.style.fontSize = "19px";
      divele.style.fontWeight = "bold";
      divele.style.textAlign = "left";
      divele.style.textIndent = "10px";
      divele.style.overflowY = "scroll";
      divele.style.overflowX = "hidden";
      divele.style.maxHeight = "450px";
disableBodyScroll(divele);

      let msg = "66 Kriegeln / war66";
      var t = document.createTextNode(msg);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      
      let aut = document.createElement("div");
      var a = document.createElement('a');
      a.setAttribute('href', "https://www.ergeka.com");
      a.appendChild(document.createTextNode("Arrkei"));
      aut.appendChild(a);

      //divele.appendChild(document.createElement("br"));
      msg = " \u00A9 2020 V" + version + "";
      let t1 = document.createTextNode(msg);
      aut.appendChild(t1);
      divele.appendChild(aut);
      divele.appendChild(document.createElement("br"));

      msg = "Dieses Spiel speichert keine Daten und verwendet keine Cookies."
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      
      var imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Herz.png"));
      imgelem.setAttribute("width", "43px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Herz");
      imgelem.setAttribute("title", "Herz");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Eichel.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Eichel");
      imgelem.setAttribute("title", "Eichel");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Gras.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Gras");
      imgelem.setAttribute("title", "Gras");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Schell.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Schell");
      imgelem.setAttribute("title", "Schell");
      divele.appendChild(imgelem);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));


      msg =
        "Als Bataille royale oder Casino War ein vor allem in französischen und amerikanischen Spielbanken betriebenes Glücksspiel.";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      msg =
        "Der Ursprung dieses Casinospiels liegt in einem weit verbreiteten Kartenspiel für Kinder, das im deutschen Sprachraum ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      //divele.appendChild(document.createElement("br"));
      //divele.appendChild(document.createElement("br"));
      msg =
        "als Leben und Tod bzw. Krieg und Frieden, in Österreich als Kriegeln, " +
        "in der Schweiz als Burechrieg (Bauernkrieg) und in Frankreich als Bataille (dt. Schlacht) bekannt ist. ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      msg =
        "In Großbritannien heißt das Spiel Battle, in den USA War (dt. Krieg).";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      msg = "Mehr Infos auf: ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      var link = "https://de.wikipedia.org/wiki/Bataille_royale";
      var element = document.createElement("a");
      element.setAttribute("href", link);
      element.innerHTML = "Wikipedia";
      divele.appendChild(element);
      //this.$swal("Info", "hello", "success");

      this.$swal({
        position: "center",
        background: "rgba(33,33,33, 0.9)",
        //allowOutsideClick: false,
        showCloseButton: true,
        title:
          '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
          title +
          "</span>",
        html: divele,
        showClass: {
          popup: "animated fadeInDown faster",
        },
        hideClass: {
          popup: "animated fadeOutUp faster",
        },
      });
    },
    saOpenChatDialog(chats) {
      var that = this;
      let divele = document.createElement("div");
      // divele.classList.add("scroll-touch");
      divele.style.background = "grey";
      // divele.style.borderRadius = "15px";
      divele.style.color = "#f1da0a";
      divele.style.paddingLeft = "8px";
      divele.style.fontFamily = "Avenir, Helvetica, Arial, sans-serif";
      divele.style.fontSize = "16px";
      divele.style.fontWeight = "bold";
      divele.style.textAlign = "left";
      divele.style.textIndent = "10px";
      divele.style.overflowY = "scroll";
      divele.style.overflowX = "hidden";
      divele.style.maxHeight = "250px";
disableBodyScroll(divele);
      let arr = chats.reverse();
      var l = arr.length; 
      var tit = document.createTextNode(" " + l + " chats");
      divele.appendChild(tit);
      divele.appendChild(document.createElement("br")); 
      divele.appendChild(document.createElement("br")); 
      for (var i=0; i<l; i++) {
        var chat = arr[i];
        var t = document.createTextNode(chat);
        divele.appendChild(t);
        divele.appendChild(document.createElement("br"));       
      }
      divele.appendChild(document.createElement("br")); 
      if (debug) { log("saOpenChatDialog..."); }
      // var promise = new Promise(
      //   function(resolve) {
          that.$swal({    
          background: "rgba(33,33,33, 0.9)",
          width: 370,
          position: "bottom",
          showConfirmButton: false,
//allowOutsideClick: false,
        allowEscapeKey: false,          
        html: divele,
        showClass: {
          popup: "animated fadeInDown faster",
        },
        hideClass: {
          popup: "animated fadeOutUp faster",
        },  
            // preConfirm: function () { 
            //   log("saOpenChatDialog.preConfirm return false"); 
            //   return false; },
          // }).then((result) => {
          //   resolve(result);
          })
        //   .catch(error => {
        //     log("saOpenChatDialog.catch return false: " + error); 
        // })
        // } // function(resolve, reject)
    //   ); // var promise
    // return promise;
    },
    saShowInfoDialog(msg) {
      this.$swal({    
          background: "rgba(33,33,33, 0.9)",
          width: 270,
          position: "center",
          showConfirmButton: false,
          html:
            '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 14px;font-weight: bold;">' +
            msg +
            "</span>",
          })
    },    
    saShowTimerInfoDialog(msg) {
      var that = this;
      var promise = new Promise(
        function(resolve) {
          that.$swal({    
          background: "rgba(33,33,33, 0.9)",
          width: 270,
          position: "top-end",
          //icon: 'error',
          //title: 'Punktverlust!',
          showConfirmButton: false,
          html:
            '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 14px;font-weight: bold;">' +
            msg +
            "</span>",
            timerProgressBar: true,
            timer: 3000
          }).then((result) => {
            resolve(result);
          })
        } // function(resolve, reject)
      ); // var promise
    return promise;
    },
    showHelp() {
      let title = "Hilfe";
      let divele = document.createElement("div");
      // nok divele.classList.add("scroll-touch");
      divele.style.background = "grey";
      divele.style.borderRadius = "15px";
      divele.style.color = "#f1da0a";
      divele.style.paddingLeft = "8px";
      divele.style.fontFamily = "Avenir, Helvetica, Arial, sans-serif";
      divele.style.fontSize = "19px";
      divele.style.fontWeight = "bold";
      divele.style.textAlign = "left";
      divele.style.textIndent = "10px";
      divele.style.overflowY = "scroll";
      divele.style.overflowX = "hidden";
      divele.style.maxHeight = "450px";
disableBodyScroll(divele);

      let msg = "66 Kriegeln";
      var t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg =
        "Ein Spiel für 2 Spieler. Jeder Spieler bekommt die gleiche Anzahl Karten und gewinnt, wenn er keine Karten mehr hat." +
        " Man kann gegen die Maschine oder alleine und mit 20 oder 36 Karten spielen, diese Auswahl kann in den Einstellungen erfolgen.";

      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg =
        "Karten: gespielt wird mit den 66 Karten in den Farben: Herz, Eichel, Blatt oder Gras und Schellen oder Schell.";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      var imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Herz.png"));
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Herz");
      imgelem.setAttribute("title", "Herz");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Eichel.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Eichel");
      imgelem.setAttribute("title", "Eichel");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Gras.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Gras");
      imgelem.setAttribute("title", "Gras");
      divele.appendChild(imgelem);

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/Schell.png"));
      imgelem.setAttribute("paddingTop", "10px");
      imgelem.setAttribute("width", "40px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Schell");
      imgelem.setAttribute("title", "Schell");
      divele.appendChild(imgelem);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg =
        "Bei 20 Blatt Karten spielt man mit Ass, Zehn, König, Ober und Unter, sonst zusätzlich mit 9, 8, 7 und 6";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/66Karten.png"));
      imgelem.setAttribute("width", "390px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Herz");
      imgelem.setAttribute("title", "Herz");
      divele.appendChild(imgelem);
      divele.appendChild(document.createElement("br"));

      msg = "Schalter";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      imgelem = document.createElement("img");
      imgelem.setAttribute("src", require("../assets/66war-title.jpg"));
      imgelem.setAttribute("width", "390px");
      imgelem.setAttribute("height", "auto");
      imgelem.setAttribute("alt", "Schalter");
      imgelem.setAttribute("title", "Schalter");
      divele.appendChild(imgelem);
      t = document.createTextNode("Links neben dem roten Herz steht die Anzahl der Spieler am Tisch, rechts daneben die Spielernummer. Nummer 1 hat den Tisch reserviert und beginnt das Spiel.");
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "Regeln";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "Spielziel: Als erster alle Karten los werden. ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg =
        "Spielaufbau: jeder Spieler hat einen Kartenstapel und eine Halde, in der Mitte ist eine " +
        "neutrale Ablageplatz für Karten die aus dem Spiel sind. Über jedem Stapel oder Halde wird die " +
        "Anzahl der dort befindlichen Karten angezeigt. Die Grüne Ampel zeigt dem Spieler, der an der " +
        "Reihe ist, dass ein Spielzug möglich ist.";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "Spielablauf:";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      msg =
        "Es wird immer abwechselnd gespielt, der Spieler der an der Reihe ist darf einen oder mehrere Züge machen. Dabei klickt er auf den Stapel und bewegt die Karte wie folgt:";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      msg =
        "--> ein Ass auf die noch leere oder auf eine volle Serie in der Ablage, das hängt von der Anzahl der gespielten Karten ab.";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      msg =
        "--> andere Karten auf die Halde des Gegners oder Ablage wenn möglich. Sonst muss die Karte auf die eigene Halde bewegt werden und der andere Spieler ist am Zug." +
        "Ein ungültiger Zug wird angezeigt, gültige Züge sind folgende: ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));

      msg =
        "--> andere Karten auf die Halde des Gegners oder Ablage wenn möglich. Sonst muss die Karte auf die eigene Halde bewegt werden und der andere Spieler ist am Zug." +
        "Ein ungültiger Zug wird angezeigt, gültige Züge sind folgende: ";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "Reihefolge bei 20 Karten";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "--> Farbe 1: Ass, Unter, Ober, König, Zehn Farbe 2: Ass, Unter...";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg = "Reihefolge bei 36 Karten";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      msg =
        "--> Farbe 1: Ass, 6, 7, 8, 9, Zehn, Unter, Ober, König Farbe 2: Ass, 6, ...";
      t = document.createTextNode(msg);
      divele.appendChild(t);
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));
      divele.appendChild(document.createElement("br"));

      this.$swal({
        position: "center",
        background: "rgba(33,33,33, 0.9)",
        //allowOutsideClick: false,
        showCloseButton: true,
        title:
          '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
          title +
          "</span>",
        html: divele,
        showClass: {
          popup: "animated fadeInDown faster",
        },
        hideClass: {
          popup: "animated fadeOutUp faster",
        },
      });
    },
    showSettings() {
      var that = this,
        newgame = false,
        newdeck = false;
      if (this.playernr !== 1) {
        this.saShowInfoDialog("Nur " + this.playerInfo.p1Name + " - Spieler 1 - darf Einstellungen ändern.");
        return;
      }
      this.saChangeSettings("Einstellungen", playSolo, numcards === 36, multiplayer)
        .then(function(result) {
          if (debug) { log("showSettings, user input: " + JSON.stringify(result)); }
          // play solo or not?
          if (playSolo !== result.playsolo) {
            newgame = true;
          } else {
            newgame = false;
          }
          playSolo = result.playsolo;
          if (!multiplayer) {
            that.playerInfo.p1Name = playSolo ? "Ich" : "IQ";
            that.playerInfo.p2Name = playSolo ? "Ego" : "KI";
          }

          // card number changed?
          if (result.cards36) {
            if (numcards !== 36) {
              numcards = 36;
              newdeck = true;
            }
          } else { //if (numcards !== 20) {
            numcards = 20;
            newdeck = true;
          }
          //console.log("showSettings: 36 = " + result.cards36 + ", numcards = " + numcards);
          if (newdeck) {
            if (debug) { log("showSettings, newGame with different deck... "); }
            if (multiplayer) {
               //xxxx
              let mydata = {room: that.roomname, fromplayer: that.playernr, numCards: numcards};
              that.socket.emit("changeNumCards", mydata, function(data) {
                  if (debug) { log("showSettings.newGame: " + JSON.stringify(data)); }
              });
              
            } else {
              that.displayInitialDeck();
              if (gameStarted) {
                gameStarted = false;
                that.newGame();
              }
              else if (newgame) {
                if (debug) { log("showSettings, newGame"); }
                that.newGame();
              }
            }
          }
        })
        .catch(function(error) {
          if (debug) { log("showSettings, user input: " + error.message); }
        });
    },
    saChangeSettings(title, iplaysolo, icards36, imultiplayer) {
      if (debug) { log(
        "saChangeSettings,  iplaysolo, icards36: " + iplaysolo + ", " + icards36
      ); }
      var that = this;
      var text = {};
      var promise = new Promise(function(resolve, reject) {
        that
          .$swal({
            position: "center",
            background: "rgba(33,33,33, 0.9)",
            allowOutsideClick: false,
            showCloseButton: true,
            title:
              '<span style="text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 18px;font-weight: bold;">' +
              title +
              "</span>",
            //			info: 'Normales Spiel gegen Maschine mit 20 Karten',
            html:
              '<span style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 16px;font-weight: bold;">' +
              "Normales Spiel:<br> Mensch gegen Maschine <br> 20 Karten" +
              "</span><br>" +
              //				'<input id="swal-input1" class="swal2-input">' +
              //				'<input id="swal-input2" class="swal2-input">' +
              '<br><div class="form-check"><input class="form-check-input" type="checkbox" value="" id="checkbox1" >' +
              '<label class="form-check-label" for="checkbox1" style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 16px;font-weight: bold;">Ich spiele auch für die Maschine</label>' +
              "</div>" +
              '<br><div class="form-check"><input class="form-check-input" type="checkbox" value="" id="checkbox2" checked=' + icards36 + '>' +
              '<label class="form-check-label" for="checkbox2" style="text-align: left;text-shadow:none;color:#f1da0a;font-family: Verdana,Arial,Helvetica;font-size: 16px;font-weight: bold;">Ich spiele mit 36 Karten</label>' +
              "</div>",
            focusConfirm: false,
            preConfirm: () => {
              //				text.i1 = document.getElementById('swal-input1').value;
              //				text.i2 = document.getElementById('swal-input2').value;
              text.playsolo = document.getElementById("checkbox1").checked;
              text.cards36 = document.getElementById("checkbox2").checked;
            },
            onOpen: function() {
              if (imultiplayer) { document.getElementById("checkbox1").disabled = true; }
              document.getElementById("checkbox1").checked = iplaysolo;
              document.getElementById("checkbox2").checked = icards36;
            },
          })
          .then(function(result) {
            if (result.value) {
              resolve(text);
            } else {
              var reason = new Error("Abbruch");
              reject(reason); // reject
            }
          });
      }); // var promise
      return promise;
    },
  },
};

//--------------------------------------------------------------------
// utilities
//--------------------------------------------------------------------


function wiggle(el) {
    document.getElementById(el).classList.remove('animate__animated', 'animate__bounceIn');
    setTimeout(function() { 
        document.getElementById(el).classList.add('animate__animated', 'animate__bounceIn');
    }, 0);      
    
    // setTimeout(function() { 
    //     document.getElementById(bin).classList.remove('animate__animated', 'animate__zoomIn');
    // }, 1000);      
}
function alertPlayer(el) {
   document.getElementById(el).classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
    setTimeout(function() { 
      document.getElementById(el).classList.add('animate__animated', 'animate__rubberBand', 'animate__infinite');
      document.getElementById(el).style.setProperty('--animate-duration', '10s');
      //document.getElementById(el).style.setProperty('--animate-delay', '10s');
    }, 0);      
}
function stopAlertPlayer(el) {
   document.getElementById(el).classList.remove('animate__animated', 'animate__rubberBand', 'animate__infinite');
}
function setImgurl(el, imgurl) {
    setTimeout(function() {
      el.imgurl = require("../" + imgurl);
    }, 0);
}
function showIllegalMoveToStack(el) {
    let url = el.imgurl;
    // let that = this;
    el.imgurl = require("../" + illegalImgurl);
    setTimeout(function() {
      el.imgurl = url;
    }, 500);
}
function log(str) {
  if (debug) {
    var date = new Date();
    console.log(
      date.toLocaleDateString() + " " + date.toLocaleTimeString() + ": " + str
    );
    //document.getElementById("output").innerHTML = str;
    //writeMessage(str);
  }
}
/*
  function logit(str) {
	  var date = new Date();
	  console.log(
		date.toLocaleDateString() + " " + date.toLocaleTimeString() + ": " + str
	  );
  }
*/

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#apptitle {
  display: block;
  position: relative;
  top: -5px;
  margin: auto;
  width: 100%;
  height: 33px;
  color: #f1da0a;
  padding-top: 6px;
   /* background-color: blue;
   border: 5px solid #f1da0a; */
}

#controls {
  position: absolute;
  top: 0px;
  right: -7px;
  width: 20%;
  height: 30px;
  background-color: transparent;
  /* box-sizing: border-box;
  border: 5px solid #f1da0a;
  border-style: ridge; */
  padding-top: 3px;
}

.scroll-touch {
  position: relative;
  -webkit-overflow-scrolling: scroll; /* Lets it scroll lazy */
  scroll-behavior: smooth;
}
#onlineButton {
  position: absolute;
  top: 6px;
  left: 10px;
  font-size: 1.3rem;
}
#chatsButton {
  position: absolute;
  top: 6px;
  left: 40px;
  font-size: 1.3rem;
}
#heartbeat {
  position: absolute;
  top: 6px;
  left: 70px;
  font-size: 1.3rem;
  cursor: pointer;
}
/* #heartbeat:hover {
  color: white;
  transform: scale(1.1);
} */
#settingsButton {
  position: absolute;
  top: 6px;
  right: 10px;
}
#helpButton {
  position: absolute;
  top: 6px;
  right: 40px;
}
#infoButton {
  position: absolute;
  top: 6px;
  right: 70px;
}
#exitButton {
  position: absolute;
  top: 6px;
  right: 100px;
}

.fabutton {
  color: #f1da0a;
  font-size: 1.3rem;
  z-index: 100;
  cursor: pointer;
}
.fabuttonPressed {
  font-size: 1.3rem;
}
.fabuttonMissing {
  color: red;
  font-size: 1.3rem;
}
.fabutton:hover {
  color: white;
  transform: scale(1.3);
  cursor: pointer;
}

#overlay {
  position: absolute;
  top: 40px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1.6em;
  text-align: center;
  margin: auto;
  width: 100%;
  height: 100%;
  color: #f1da0a;
  margin-top: 0px;

  /*
  border: 1px solid #f1da0a;
  background: black;
  border: 15px solid #f1da0a;
  border-style: groove;
  z-index: 1;
  */
}
#messagearea {
  position: absolute;
  bottom: 0px;
  background-color:black;
  border-radius: 10px;
  box-sizing: border-box;
  border: 2px solid rgba(88, 88, 88, 0.8);
  margin: 0 auto;
  width: 100%;
  height: 34px;
  color: #f1da0a;
  z-index: 100;
}
#msgbuttons {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 100px;
  height: 30px;
  padding-right: 10px;
  background-color:black;
  /* box-sizing: border-box; */
  /* border: 2px solid rgba(88, 88, 88, 0.8); */
  border-radius: 10px;
}
#msg {
  position: relative;
  float: left;
  margin-left: 2px;
  top: 0px;
  width: 90%;
  height: 28px;
  padding-left: 10px;
  background-color:black;
  border-radius: 10px;
  color:  #f1da0a;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.1rem;
  text-align: left;
  border:0;
  outline:0;
  cursor: pointer;  
}

#msg:focus {outline:none!important;}

#sendChatButton {
  position: relative;
  float: right;
  bottom: -4px;
  right: 60px;
  /* font-size: 1.4rem; */
  
}
#toggleDialogButton {
  position: relative;
  float: right;
  bottom: -4px;
  right: -10px;
  /* font-size: 1.4rem; */
  
}
#playerInfo {
  /* display: block; */
  position: absolute;
  /* display: table;
  margin: 0 auto; */
  text-align: center;
  /* color: white; */
  font-size: 1.6rem;
  top: 50px;
  width: 50%;
  box-sizing: border-box;
  /* background-color: rgba(88,88,88, 0.8); */
  border: 5px solid rgba(88, 88, 88, 0.8);
  border-style: ridge;
}

#tablecontainer {
  position: absolute;
  top: 44px;
  border-collapse: collapse;
  width: 100%;
  margin: auto;
  font-size: 1.4rem;
  box-sizing: border-box;
  /* border: 3px solid #ddd; */
  color: #f1da0a;
  box-shadow: 0 0 5px 5px;
  /*0 10px 10px -5px;*/
  border-radius: 50px;
  /* background-color: #4CAF50; */
  --animate-duration: 0.5s;
}

#tablecontainer th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
}

#tablecontainer td {
  /* border: 1px solid #ddd; */
  border-radius: 50px;
  background-color: black;
  padding-top: 12px;
  padding-bottom: 12px;
}

.centerText {
  text-align: center;
}

#player {
  display: table;
  margin: 0 auto;
  width: 96%;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: rgba(88, 88, 88, 0.8);
  box-shadow: inset 0 0 10px white;
}
#player th {
  /* padding-top: 6px;
  padding-bottom: 6px; */
  font-size: 1rem;
  text-align: center;
  font-family: monospace;
  /* background-color: #4CAF50; */
  /* color: white; */
}
#player.subtable td,
#player.subtable th {
  /* border: 1px solid #ddd; */
  /* padding: 4px; */
  padding: 1px;
  border-radius: 20px;
}
#stackplayer {
  display: table;
  margin: 0 auto;
  width: 96%;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: rgba(88, 88, 88, 0.8);
  box-shadow: inset 0 0 10px white;
}
#stackplayer th {
  /* padding-top: 12px;
  padding-bottom: 12px; */
  font-size: 1rem;
  text-align: center;
  font-family: monospace;
  /* background-color: #4CAF50; */
  /* color: white; */
}
#stackplayer.subtable td,
#stackplayer.subtable th {
  /* border: 1px solid #ddd; */
  padding: 1px;
  border-radius: 20px;
}
.p1info {
  display: table;
  margin: 0 auto;
  text-align: right;
  /*  font-family: "Brush Script MT"; */
  font-size: 1.3rem;
  font-weight: bold;
  /*text-shadow: 2px 2px 8px #ffff00;*/
  margin-top: -12px;
  margin-bottom: 1px;
  color: #f1da0a;
  /* top: -80px; */
  /* background-color: rgba(88,88,88, 0.8); */
  /* border: 1px solid #ddd; */
}

.info {
  display: table;
  margin: 0 auto;
  text-align: center;
  margin-top: -12px;
  margin-bottom: 1px;
  font-size: 1.6rem;
  color: #f1da0a;
  /* top: -80px; */
  /* border: 1px solid #ddd; */
  /* background-color: rgba(88,88,88, 0.8); */
}
.p2info {
  display: table;
  margin: 0 auto;
  text-align: left;
  color: #f1da0a;
  margin-top: -12px;
  margin-bottom: 1px;
  /*  font-family: "Monaco"; */
  font-size: 1.3rem;
  font-weight: bold;
  /* text-shadow: 2px 2px 8px #ffff00; */

  /* top: -80px; */
  /* background-color: rgba(88,88,88, 0.8); */
}
.ampel {
  /*display:table;*/
  margin: 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /*margin-left:calc(50% - 25px);*/
  padding: 2px;
  background-color: green;
  border: 2px solid white;
  text-align: center;
}
.stackampel {
  background-color: transparent;
}
.num {
  /* nok
  display: inline-block;
  vertical-align: middle;
  */
  position: relative;
  top: 8px;
  color: white;
  /* font-size: 34px; */
}

.img {
  margin: 0 auto;
  margin-top: 5px;
  width: 90%;
  height: auto;
  /* border: 1px solid #ddd; */
  border-radius: 15px;
  /* hide context menu on touch */
  -webkit-touch-callout: none;

  /* for span etc 
https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/SafariJSProgTopics/DragAndDrop.html
-webkit-user-drag: element; 
-webkit-user-select:none;
 */
  /* transition: width 2s, height 2s, transform 2s; */
  /* transform: scale(1.0); */
  /* transition-property: width, height;
  transition-duration: 2s;
  transition-timing-function: ease-in-out; */
}

.img:hoverOK {
  transform: scale(0.99) rotate(0.01deg);
  cursor: grab;
}
/* 
.bgGreen {
  background: green;
  width: 50%;
  height: auto;
}

#hint {
  display: none;
  position: absolute;
  margin-left: 20px;
  top: -50px;
}
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
} */

/*Eine fehlerhafte Eingabe:*/
input:invalid{
 color:red;
}
/*Eine korrekte Eingabe:*/
input:valid{
 color:green;
}
/*Ein Plichtfeld:*/
input[required]{
 background-color:#F08080;
}

@media (max-width: 1210px) {
  .sword {
    position: initial;
    top: 0;
  }
}
</style>
