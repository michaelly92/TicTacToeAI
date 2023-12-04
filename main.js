
let game_boxes = document.getElementsByClassName("game-box");
let reset_button = document.getElementById("reset-button");
let game_info_bar = document.getElementById("game_info");
// console.log(game_boxes);

let tttmmb = new TicTacToeMiniMaxBot(2);
let tttg = new TicTacToeGame(new TicTacToeState("000000000", 1));

let player_1_char = "X";
let player_2_char = "O";

update_game_info_bar();

function clicked(box_id, char="X") {
    tttg.do_move(box_id);

    d = document.createElement("div")
    if(char === "1") { char = player_1_char; }
    else if(char === "2") { char = player_2_char; }
    else { char = "X"; }
    d.innerHTML = char;
    d.classList = "absolute-position";
    d.top = -100;
    document.getElementById(box_id).appendChild(d);

    disable("111111111");
    update_game_info_bar();
    if (tttg.playing() == "2" && !tttg.game_over()) {
        setTimeout(ai_move, 50);
    }
    else if (tttg.game_over()) {
        update_game_info_bar();
    }
}

function ai_move() {
    move = tttmmb.decide(tttg);
    clicked(move, "2");
    disable(tttg.get_current_state().state_information);
    if (tttg.game_over()) {
        update_game_info_bar()
    }
}

function reset() {
    for(game_box of game_boxes) {
        game_box.innerHTML = "";
    }
    tttg = new TicTacToeGame(new TicTacToeState("000000000", 1));
    
    update_game_info_bar();
    disable(tttg.get_current_state().state_information);
}

function update_game_info_bar() {
    let info = ""
    if (tttg.game_over()) {
        if (tttg.winner() === null) { info = "It's a draw!"; }
        else { info = `Player ${tttg.winner()} wins!`; }
    }
    else {
        info = `Player ${tttg.playing()}'s turn`
    }
    game_info_bar.innerHTML = info;
}

function initialize(state_info) {
    for(let i = 0; i < state_info.length; i++) {
        if(state_info[i] === "0") {}
        else { clicked(i, state_info[i]); }
    }
}

function disable(state_info) {
    for(let i = 0; i < state_info.length; i++) {
        if(state_info[i] === "0") {
            game_boxes[i].classList.remove("disabled");
        }
        else { 
            game_boxes[i].classList.add("disabled");
        }
    }
}

for(let s = 0; s < game_boxes.length; s++) {
    game_boxes[s].onclick = clicked.bind(game_boxes[s], game_boxes[s].id);
}
reset_button.onclick = reset;

d = document.createElement("div")




// tttg = new TicTacToeGame(new TicTacToeState("000000000", 2))


// print_tic_tac_toe(tttg.get_current_state().state_information)
// while (!tttg.game_over()) {
//     if (tttg.playing() !== tttmmb.player) {
//         try {
//             move = Number(prompt(`Choose a move from: ${tttg.get_current_state().actions()}: `))
//             tttg.do_move(move)
//         }
//         catch (err) {
//             console.log("That isn't a number! Try again.")
//         }
//     }
//     else {
//         console.log("AI chose to play...")
//         move = tttmmb.decide(tttg)
//         tttg.do_move(move)
//     }
//     print_tic_tac_toe(tttg.get_current_state().state_information)
// }
// if (tttg.winner() === null) {
//     console.log("No winner. Draw!")
// }
// else {
//     console.log(`Player ${tttg.winner()} WINS!`)
// }


