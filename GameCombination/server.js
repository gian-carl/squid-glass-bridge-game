const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];

app.use(express.static(path.join(__dirname)));

io.on("connection", socket => {
    players.push(socket.id);
    io.emit("players", players);

    socket.on("startGame", () => {
        io.emit("forceStart");
    });

    socket.on("disconnect", () => {
        players = players.filter(p => p !== socket.id);
        io.emit("players", players);
    });
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});
