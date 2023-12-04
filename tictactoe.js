
class TicTacToeMiniMaxBot {
    constructor(player=1, max_depth=-1) {
        /***  **Player**: This determines the bots' role in the game. If it is player 1, it will value player 1's utility.
            If it is player 2, it will value player 2's utility, and so on.\n
            **Max_depth**: determines how far into the future this bot will consider. The further the bot can consider,
            the more resources it will require, but it will be more accurate.*/
        this.player = player;
        this.max_depth = max_depth;
    }
    decide(game) {
        let current_state = game.get_current_state();
        let action = this.__minimax_alpha_beta_pruning(current_state, current_state.playing);
        return action;
    }

    __optimistic(state, depth = 0) {
        /*Returns an action that results in the fastest win.*/
        if (!state.is_terminal()) {
            if (state.actions().length === 0) { return 0; }
            let best_action = null;
            let best_action_score = -999999999;
            let current_score = 0;
            for(action of state.actions()) {
                current_score = 0;
                current_score += this.__optimistic(state.result(action), depth + 1) - 0.1;
                if (current_score > best_action_score) {
                    best_action = action;
                    best_action_score = current_score;
                }
            }
            if (depth === 0) { return best_action; }
            else { return best_action_score; }
                
        }
        else {
            if (state.winner === this.player) { 
                return 1; 
            }
            return 0;
        }
    }

    __minimax_alpha_beta_pruning(state, player = 2, depth = 0, maximum=9999999999) {
        /* Returns an action using a minimax search with alpha beta pruning */
        if (depth === this.max_depth) { return state.utility(player); }
        if (!state.is_terminal()) {
            if (state.actions().length === 0) {
                return state.utility(player);
            }
            let next_player = 1
            if (player === 1) { next_player = 2; }

            let best_action = null;
            let best_action_score = -9999999999
            let current_score = 0;

            for (let action of state.actions()) {
                current_score = -this.__minimax_alpha_beta_pruning(state.result(action), next_player, depth + 1,
                                                                   -best_action_score);
                if (current_score > maximum) {
                    return current_score;
                }
                if (current_score > best_action_score) {
                    best_action = action;
                    best_action_score = current_score;
                }
            }
            if (depth === 0) { return best_action; }
            else { return best_action_score;  }
        }
        else { return state.utility(player); }
    }
}


class State {
    constructor(state_information=null, playing=0, terminal=null) {
        this.state_information = state_information      // contains the current state represented by some value
        this.playing = playing                          // the current player playing
        this.terminal = terminal                        // True if the current state is an end state
    }

    to_move() {
        /* Returns the turn of the player in the current state */
        return this.playing
    }

    actions() {
        /* Returns actions that can be done in this state by the current player */
        return []
    }

    result(action) {
        /* Returns the resulting state of doing the given action in the current state */
        return State()
    }

    is_terminal() {
        /* Returns if the current state is a terminal state */
        return this.terminal
    }

    utility(player) {
        /* Returns the value of the current state to the given player */
        return 0
    }
}

class TicTacToeState extends State {
    // 1s represent any of the same kind of entry (e.g.: X X X or O O O. X O X would not count)
    // 0s represent either an empty spot or other entry
    terminal_states = [
        "111",          // 3 horizontal top
        "100010001",    // 3 diagonal from top left
        "1001001",      // 3 vertical left
        "01001001",     // 3 vertical center
        "0010101",      // diagonal from top right
        "001001001",    // vertical right
        "000111",       // horizontal center
        "000000111"     // horizontal bottom
    ]
    weights = {
        "terminal": 300,    // if the current state is a terminal state, the score is 150 for the winning player
        "entry": 10,        // Player 1 played twice? 20 points. Player 1 player 44 times? Impossible but 440
        "near-win": 50      // when there is a way to win in the current state
    }

    constructor(state_information="000000000", playing=1, terminal=null) {
        /* **State information**: A 9-digit string that contains either 0s, 1s, or 2s. It represents a tictactoe board
            read from left to right.\n
            **playing**: The current player in a state is either 1 or 2\n
            **terminal**: This is true if either player 1 or 2 has won (has three Xs or Os in a row respectively)\n
            **winner**: If terminal is true, this contains either 1 or 2. If terminal is not true, this contains null\n
            **near_wins**: This is an array which is analogous to the terminal_states array. Each index contains either
            a 1 or 2, which corresponds to who has a near win for a given terminal state.
            EX: [1, 2, 2, 0, 0, 1] */
        super(state_information, playing, terminal)
        this.winner = null;
        this.near_wins = [];     // Who has a near win for each possible terminal state
    }

    actions() {
        /* Returns actions that can be done in this state by the current player
            tictactoe action: 0 = top left. 1 = top middle. 5 = middle right. 8 = bottom left */
        let actions = [];
        let state_info = this.state_information;
        for (let index in this.state_information) {
            let char = state_info[index];
            if (char === "0") {
                actions.push(index);
            }
        }
        return actions;
    }

    result(action) {
        /* Returns the state that results from doing the given action in the current state if the action is valid */
        if (this.actions().includes(`${action}`)) {
            let new_state_info = `${this.state_information.substring(0, action)}${this.to_move()}${this.state_information.substring(Number(action)+1, this.state_information.length)}`;
            let playing = 1;
            if (this.to_move() === 1) {
                playing = 2;
            }
            return new TicTacToeState(new_state_info, playing)
        }
        else {
            console.log(`You are trying to do a action (${action}) in a state (${this.state_information}), but that action is not allowed`)
            return this;
        }
    }

    is_terminal() {
        /* Returns whether the current state is a terminal state or not, and calculates **winner** */
        if (this.terminal === null) {
            // compares each terminal state with the current state
            let terminal = false;
            let winning_char = "";
            for (let terminal_state of this.terminal_states) {
                if (!terminal) {
                    winning_char = ""   // winning char will be either X or O.
                    terminal = true     // this is true until proven false
                    let open_terminals = 0  // if a terminal state is X X X, but the current char is X _ X, this equal to 1.
                    let blocked = false     // if the terminal is X X X, but the state is X O X, it is blocked.
                    // uses index to compare current state with terminal state
                    for (let index in terminal_state) {
                        if (terminal_state[index] === "1") {
                            // given the current index is supposed to be filled by the winning character
                            if (this.state_information[index] == "0") {
                                // if it isn't filled by any character, then it is not a terminal state
                                terminal = false
                                open_terminals += 1
                                if (open_terminals > 1) { break; }
                            }
                            else if (winning_char === "") {
                                // if winning character is undefined and current character is either X or O,
                                // define winning character
                                winning_char = this.state_information[index];
                            }
                            else {
                                // winning character is defined, and current character is either X or O
                                if (this.state_information[index] === winning_char) {
                                    // if the current character is the winning character, then keep continue
                                }
                                else {
                                    // if the current character is not the winning character, then stop searching
                                    terminal = false;
                                    blocked = true;
                                    break;
                                }
                            }
                        }
                    }
                    if ((!blocked) && open_terminals < 2) {
                        this.near_wins.push(winning_char);
                    }
                    else {
                        this.near_wins.push('0')
                    }
                }
                else {
                    this.winner = Number(winning_char)
                }
            }
            if (!terminal) {
                // it is possible for it to be a stalemate
                if (this.actions().length === 0) {
                    this.terminal = true
                }
                else {
                    this.terminal = false;
                }
            }
            else {
                this.terminal = terminal;
                this.winner = Number(winning_char)
            }
        }
        return this.terminal;
    }

    utility(player) {
        /* Uses weights to calculate the score in a given state.
            Player 1s score will always be the opposite of player 2's score.\n
            EX: P1 = 140, P2 = -140. */
        if (this.is_terminal()) {
            // if the current state is terminal
            if (this.winner === null) {
                return 0;
            }
            let coef = -1;
            if (this.winner === player){
                coef = 1;
            }
            return coef*this.weights["terminal"];
        }
        else {
            // if the current state is not terminal, consider the number of entries + number of "near wins"
            // A near win is X _ X or O _ O in any of the possible terminal states.
            score = 0
            for (near_win in this.near_wins) {
                if (near_win === '0') {
                    
                }
                else if (near_win == f`${player}` && this.playing == player) {
                    score += this.weights['near-win'];
                }
                else if (near_win != f`${player}` && this.playing != player) {
                    score -= this.weights['near-win'];
                }
            }
            return score;
        }
    }
}


class Game {
    constructor(current_state = new State()) {
        this.__current_state = current_state
    }

    do_move(action) {
        /* Executes the given action on the current state, and overrides the current state with the resulting state */
        this.__current_state = this.__current_state.result(action)
    }

    get_current_state() {
        return this.__current_state
    }
}

class TicTacToeGame extends Game {
    constructor(current_state = new TicTacToeState()) {
        super(current_state)
        this.__current_state = current_state
    }

    do_move(action) {
        /* Executes the given action on the current state, and overrides the current state with the resulting state */
        this.__current_state = this.__current_state.result(action)
    }

    get_current_state() {
        return this.__current_state
    }

    game_over() {
        return this.__current_state.is_terminal()
    }

    playing() {
        return this.__current_state.playing
    }

    winner() {
        if (this.game_over() != null) {
            return this.__current_state.winner
        }
        return null
    }
}


function print_tic_tac_toe(tic_tac_toe_str) {
    /* Converts a tic-tac-toe state to a string*/
    if (tic_tac_toe_str.length != 9) {
        console.log(`${tic_tac_toe_str} is invalid. Must be 9 digits long and contain either 0s, 1s, or 2s.`);
        return;
    }
    valid = true
    output = " "
    for (index in tic_tac_toe_str) {
        s = tic_tac_toe_str[index];
        if (s === "0") {
            output += " ";
        }
        else if (s === "1") {
            output += "X";
        }
        else if (s === "2") {
            output += "O";
        }
        else {
            valid = false;
            break;
        }
        if ((index+1) % 3 === 0) {
            if (index != 8) {
                output += "\n-----------\n ";
            }
        }  
        else {
            output += " | ";
        }
    }
    if (valid) {
        console.log(output);
    }
    else {
        console.log(`${tic_tac_toe_str} is invalid.`);
    }
}


// easy runner

// function c4() {
//     cfg = ConnectFourGame(ConnectFourState(ConnectFourState.create_using_action_series([]), 1))
//     cfb = ConnectFourMiniMaxBot(2)

//     while (!cfg.game_over()) {
//         cfg.get_current_state().console.log()
//         if (cfg.playing() == cfb.player) {
//             console.log("AI is deciding...")
//             action = cfb.decide(cfg)
//             cfg.do_move(action)
//         }
//         else {
//             try {
//                 action = int(input(`Select an action ${cfg.get_current_state().actions}: `))
//                 cfg.do_move(action)
//             }
//             catch(err) {
//                 console.log("The action provided is not a valid action. Please choose from the available list of actions.");
//             }
//         }
//     }
//     cfg.get_current_state().console.log()
//     console.log(f"Winner: Player {cfg.winner()}")
// }

function ttt() {
    tttmmb = new TicTacToeMiniMaxBot(2)
    tttg = new TicTacToeGame(new TicTacToeState("000000000", 2))
    
    current_state = tttg.get_current_state();

    print_tic_tac_toe(tttg.get_current_state().state_information)
    while (!tttg.game_over()) {
        if (tttg.playing() !== tttmmb.player) {
            try {
                move = Number(prompt(`Choose a move from: ${tttg.get_current_state().actions()}: `))
                tttg.do_move(move)
            }
            catch (err) {
                console.log("That isn't a number! Try again.")
            }
        }
        else {
            console.log("AI chose to play...")
            move = tttmmb.decide(tttg)
            tttg.do_move(move)
        }
        print_tic_tac_toe(tttg.get_current_state().state_information)
    }
    if (tttg.winner() === null) {
        console.log("No winner. Draw!")
    }
    else {
        console.log(`Player ${tttg.winner()} WINS!`)
    }
}

// while (true) {
//     game = prompt("Choose tic-tac-toe (0), Connect4 (1), or exit (2): ").trim().toLowerCase()

//     if (game == "0") {
//         ttt();
//     }
//     else if (game == "1") {
//         console.log("N/A...");
//     }
//     else if (game == "2") {
//         console.log("Goodbye")
//         break
//     }
//     else {
//         console.log(`Your input \"${game}\" is invalid.`)
//     }
// }
