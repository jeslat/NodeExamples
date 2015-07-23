var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

var players = [];
var board = [];
var turn;

io.on("connection", function(socket) {
    console.log("a user connected");
    console.log("Players 0: " + players[0]);
    console.log("Players 1: " + players[1]);
    if (players[0] === undefined)
    {
        players[0] = socket;
        socket.emit("player_name", "A");
        socket.emit("chat_message", "Wait for the other player");
    }
    else if (players[1] === undefined) {
        players[1] = socket;
        socket.emit("player_name", "B");
        io.emit("chat_message", "Players ready. Start player A");
        turn = 0;
        players[turn].emit("your_turn");
    } else {
        socket.emit("chat_message", "Too many players");
    }

    socket.on("click_on_cell", function(playerName, number) {
        board[number] = playerName;
        console.log("Click on cell: " + playerName + " - " + number);
        io.emit("print_cell", playerName, number);

        if (isTie()) {
            board = [];
            io.emit("tie");
            finishGame();
        } else {
            var winner = checkTheWinner();
            console.log("Winner: " + winner);
            if (winner === undefined) {
                changeTurn();
            } else {
                io.emit("win", winner);
                finishGame();
            }
        }
    });

    socket.on("disconnect", function() {
        console.log("user disconnected");
        var index = players.indexOf(socket);
        if (index > -1) {
            players[index] = undefined;
        }
    });
});

function finishGame() {
    board = [];
    turn = 0;
    players[0].emit("your_turn");
    players[1].emit("chat_message", "His turn");
}

function isTie() {
    var isTie = true;
    for (var i = 0; i < 9 && isTie; i++) {
        if (board[i] !== ""){
            isTie = false;
        }
    }
    return isTie;
}

function checkTheWinner() {
    console.log("Check the winner");
    for (var i = 0; i < 9; i++) {
        console.log("cell " + i + ": " + board[i]);
    }

    if (board[0] === "A" && board[1] === "A" && board[2] === "A" ||
        board[0] === "B" && board[1] === "B" && board[2] === "B") {
        return board[0];
    }
    if (board[3] === "A" && board[4] === "A" && board[5] === "A" ||
        board[3] === "B" && board[4] === "B" && board[5] === "B") {
        return board[3];
    }
    if (board[6] === "A" && board[7] === "A" && board[8] === "A" ||
        board[6] === "B" && board[7] === "B" && board[8] === "B") {
        return board[6];
    }
    if (board[0] === "A" && board[3] === "A" && board[6] === "A" ||
        board[0] === "B" && board[3] === "B" && board[6] === "B") {
        return board[0];
    }
    if (board[1] === "A" && board[4] === "A" && board[7] === "A" ||
        board[1] === "B" && board[4] === "B" && board[7] === "B") {
        return board[1];
    }
    if (board[2] === "A" && board[5] === "A" && board[8] === "A" ||
        board[2] === "B" && board[5] === "B" && board[8] === "B") {
        return board[2];
    }
    if (board[0] === "A" && board[4] === "A" && board[8] === "A" ||
        board[0] === "B" && board[4] === "B" && board[8] === "B") {
        return board[0];
    }
    if (board[2] === "A" && board[4] === "A" && board[6] === "A" ||
        board[2] === "B" && board[4] === "B" && board[6] === "B") {
        return board[2];
    }
}

function changeTurn() {
    if (turn === 0) {
        turn = 1;
    } else {
        turn = 0;
    }
    players[turn].emit("your_turn");
}

http.listen(3000, function() {
    console.log("listening on port:3000");
});
