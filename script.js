//КОНСТАНТЫ
//константа, которая хранит все выигрышные комбинации
const COMBO = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const cells = document.querySelectorAll('.cell');
const humanCount = document.querySelector('.history__human-count');
const computerCount = document.querySelector('.history__computer-count');
const gameBoard = document.querySelector('.gameboard');
const gameOver = document.querySelector('.gameover');
const historyBtn = document.querySelector('.button__history');
const popup = document.querySelector('.popup');
const closePopup = document.querySelector('.popup__close');
const tablePopup = document.querySelector('.popup__table');
const allGameCount = document.querySelector('.popup__game');
const startBtn = document.querySelector('.welcome__button');
const game = document.querySelector('.wrapper');
const welcome = document.querySelector('.welcome');

//ПЕРЕМЕННЫЕ
let human = 'X';
let computer = 'O';
let GAME_OVER = false;
let move = 0;
let gameData = new Array(9);
let countComp = 0;
let countHum = 0;
let countGame = 1;

//СЛУШАТЕЛИ
startBtn.addEventListener('click', start);
historyBtn.addEventListener('click', toggleHistoryPopup);
closePopup.addEventListener('click', toggleHistoryPopup);


//ФУНКЦИИ
//открытие/закрытие окна с историей
function toggleHistoryPopup() {
    popup.classList.toggle('popup__isopened');
}

//вешаем обработчики на каждую клетку
function start() {
    game.classList.remove('hide');
    welcome.classList.add('hide');
    for (let cell of cells) {
        cell.addEventListener('click', turn);
    }
}

//ход компьютера
function computerMove() {
    if (GAME_OVER) return;
    let choiceLogic = randomInteger(0, 1);
    //определяем какую логику выберет компьютер для следующего хода
    if (choiceLogic) {
        //компьютер делает ход согласно алгоритму минимакс
        let id = minimax(gameData, computer).id;
        gameData[id] = computer;
        if (id !== undefined) {
            setTimeout(function () { document.getElementById(`cell-${id}`).innerHTML = computer }, 300);
        }
    } else {
        //компьютер делает рандомный ход
        let EMPTY_SPACES = getEmptySpaces(gameData);
        let randomMove = EMPTY_SPACES[Math.floor(Math.random() * EMPTY_SPACES.length)];
        gameData[randomMove] = computer;
        setTimeout(function () { document.getElementById(`cell-${randomMove}`).innerHTML = computer }, 300);
    }
    let gameWon = isVictory(gameData, computer);
    if (gameWon) {
        GAME_OVER = true;
        setTimeout(colorWinCell, 500, gameWon, computer);
        setTimeout(showGameOver, 1000, computer);
    } if (((!gameWon) && move === 7)) {
        GAME_OVER = true;
        setTimeout(showGameOver, 1000, 'ничья');
    }
    move++;
}

//смена очередности хода
function switchPlayer() {
    if (countGame % 2 === 0) {
        computerMove();
    }
}

//основная логика, ход игрока и вызов хода компьютера
function turn(event) {
    if (GAME_OVER) return;
    if (event.target.innerHTML !== '') return;

    gameData[parseInt(this.id.match(/\d+/))] = human;
    this.innerHTML = human;
    let gameWon = isVictory(gameData, human);
    if (gameWon) {
        GAME_OVER = true;
        setTimeout(colorWinCell, 500, gameWon, human);
        setTimeout(showGameOver, 1000, human);
    } if (((!gameWon) && move === 8)) {
        GAME_OVER = true;
        showGameOver('ничья');
    }
    computerMove();
    move++;
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

//определяем победителя
function isVictory(gameData, player) {
    let plays = gameData.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of COMBO.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

//раскрашиваем победившую комбинацию ячеек
function colorWinCell(gameWon, player) {
    for (let index of COMBO[gameWon.index]) {
        document.getElementById(`cell-${index}`).style.backgroundColor = player === human ? '#50C878' : '#e95159';
    }
}

//получаем список из пустых значений
function getEmptySpaces(gameData) {
    const EMPTY = [];
    for (let id = 0; id < gameData.length; id++) {
        if (!gameData[id]) EMPTY.push(id);
    }
    return EMPTY;
}

//алгоритм минимакса для "умных" ходов компьютера
function minimax(gameData, player) {
    const EMPTY_SPACES = getEmptySpaces(gameData);
    if (isVictory(gameData, computer)) return { evaluation: +10 };
    if (isVictory(gameData, human)) return { evaluation: -10 };
    if (EMPTY_SPACES.length === 0) return { evaluation: 0 };

    let moves = [];

    for (let i = 0; i < EMPTY_SPACES.length; i++) {

        let id = EMPTY_SPACES[i];

        let backup = gameData[id];

        gameData[id] = player;

        let move = {};
        move.id = id;

        if (player === computer) {
            move.evaluation = minimax(gameData, human).evaluation;
        } else {
            move.evaluation = minimax(gameData, computer).evaluation;
        }

        gameData[id] = backup;
        moves.push(move);
    }
    let bestMove;
    if (player === computer) {
        // MAXIMIZER
        let bestEvaluation = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].evaluation > bestEvaluation) {
                bestEvaluation = moves[i].evaluation;
                bestMove = moves[i];
            }
        }

    } else {
        //MINIMAZER
        let bestEvaluation = +Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].evaluation < bestEvaluation) {
                bestEvaluation = moves[i].evaluation;
                bestMove = moves[i];
            }
        }
    }
    return bestMove;
}

//конец игры
function showGameOver(winner) {
    let imgSrc = winner === 'ничья' ? `img/tie.svg` : winner === human ? `img/human.svg` : `img/robot.png`;
    let message = winner === 'ничья' ? 'Ничья' : winner === human ? 'Победа игрока' : 'Победа компьютера';
    gameOver.innerHTML = `
<h1 class="gameover__title">${message}</h1>
<img class="gameover__img" src=${imgSrc} alt=''>
<div class="buttons">
    <button class="button button__play">Продолжить</button>
    <button class="button button__reset">Начать заново</button>
</div>`
    const row = document.createElement('tr');
    const tdGame = document.createElement('td');
    const tdHuman = document.createElement('td');
    const tdComputer = document.createElement('td');
    const tdTie = document.createElement('td');

    row.appendChild(tdGame);
    row.appendChild(tdHuman);
    row.appendChild(tdComputer);
    row.appendChild(tdTie);

    tablePopup.appendChild(row);

    if (winner == computer) {
        computerCount.textContent = ++countComp;
        tdComputer.textContent = '+';
    } else if (winner == human) {
        humanCount.textContent = ++countHum;
        tdHuman.textContent = '+';
    } else if (winner == 'ничья') {
        tdTie.textContent = '+';
    }
    gameOver.classList.remove('hide');
    gameBoard.classList.add('hide');
    const btnPlay = document.querySelector('.button__play');
    const btnReset = document.querySelector('.button__reset');
    btnPlay.addEventListener('click', clearField);
    btnReset.addEventListener('click', clearAll);
    allGameCount.textContent = countGame;
    tdGame.textContent = countGame;
    historyBtn.removeAttribute('disabled', true);
}

//очищаем поле для следующей игры в серии
function clearField() {
    for (let cell of cells) {
        cell.innerHTML = '';
        cell.style.removeProperty('background-color');
    }
    gameOver.classList.add('hide');
    gameBoard.classList.remove('hide');
    GAME_OVER = false;
    gameData = new Array(9);
    move = 0;
    computer = [human, human = computer][0];
    ++countGame;
    switchPlayer();
}

//очищаем все целиком
function clearAll() {
    for (let cell of cells) {
        cell.innerHTML = '';
        cell.style.removeProperty('background-color');
    }
    gameOver.classList.add('hide');
    gameBoard.classList.remove('hide');
    computerCount.textContent = '0';
    humanCount.textContent = '0';
    GAME_OVER = false;
    gameData = new Array(9);
    countComp = 0;
    countHum = 0;
    move = 0;
    human = 'X';
    computer = 'O';
    countGame = 1;
    historyBtn.setAttribute('disabled', true);
    tablePopup.innerHTML = '';
}
