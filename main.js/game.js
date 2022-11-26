"use stirct";
// const LIFE = "💗"

var gBoard = [];
var gTimerInterval;
var elIcon;
var elLives;
var elSeconds;
var gTimer;
var elH2;
var undoBank;
var gLevel = {
  SIZE: 0,
  MINES: 0,
};
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  gameOver: false,
  lives: 3,
};

function onInit(level, mines) {
  undoBank = [];
  clearInterval(gTimer);
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gGame.secsPassed = 0;
  elH2 = document.querySelector(".timer span");
  elH2.innerText = "00:00";
  elSeconds = 0;
  elIcon = document.querySelector(".restGame");
  elIcon.innerText = "😁";
  gGame.gameOver = false;
  gLevel.SIZE = level;
  gLevel.MINES = mines;
  gGame.lives = 3;
  livesPlayer();

  createBoard();
  renderBoard(gBoard);
  gGame.isOn = false;
  document.getElementById("minesCount").innerText = mines;
}
//resets the game at the same position/level.
function resetCurrLevel() {
  onInit(gLevel.SIZE, gLevel.MINES);
}
//creating the board.
function createBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    var newline = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      newline.push(cell);
    }
    board.push(newline);
  }

  gBoard = board;
  renderBoard(board);
  return board;
}
//rendering the board to html.
function renderBoard() {
  var elBoard = document.querySelector(".board");
  var strHTML = "";
  for (var i = 0; i < gBoard.length; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = getCellImg(i, j);

      strHTML += `<td class="cell" oncontextmenu="setFlag(${i},${j},event)" onclick="cellClicked(this,${i},${j})">${currCell}`;

      strHTML += "</td>";
    }
    strHTML += "</tr>";
  }

  elBoard.innerHTML = strHTML;
}
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

//putting randomaly bombs on the board.
function getRandomMines() {
  var counterMines = 0;
  while (counterMines < gLevel.MINES) {
    var i = getRandomInt(0, gLevel.SIZE - 1);
    var j = getRandomInt(0, gLevel.SIZE - 1);
    if (gBoard[i][j].isShown === false && gBoard[i][j].isMine === false) {
      gBoard[i][j].isMine = true;
      counterMines++;
    }
  }
}
//return back your last move on the board.
function undoMove() {
  if (undoBank.length === 0) return;

  var lastMove = undoBank[0];

  gBoard = lastMove;
  undoBank.splice(0, 1);
  renderBoard();
}
function hintMe() {}

// runs in a loop around the location recived to set the mines around that location of the cell
function setMinesNegsCount(board, rowIdx, colIdx) {
  var counter = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      if (gBoard[i][j].isMine) counter++;
    }
  }
  gBoard[rowIdx][colIdx].minesAroundCount = counter;
}
//checks every cell negs if theres mines around it
function checkMinesNegs() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      setMinesNegsCount(gBoard, i, j);
    }
  }
}
//what happen when you click on cell.
function cellClicked(elCell, i, j) {

  if (gGame.gameOver === true || gBoard[i][j].isMarked === true||gBoard[i][j].isShown) return;

  gBoard[i][j].isShown = true;

  // First click of the game
  if (!gGame.isOn) {
    gGame.isOn = true;
    gTimer = setInterval(showTime, 1000);
    getRandomMines();
    checkMinesNegs();
    showCellNxt(i, j);
  }
//click on bomb.
  if (gBoard[i][j].isMine) {
    elIcon.innerText = "🤕";
    gGame.lives--;
    livesPlayer();
  } else {
    gGame.shownCount++;
    showCellNxt(i, j);
    gameOver();
  }

  var boardCopy = JSON.parse(JSON.stringify(gBoard));
  undoBank.unshift(boardCopy);
  renderBoard(gBoard);
}
function hintMe() {}
//shows the numbers or other icom on every cell.
function getCellImg(i, j) {
  var cell = gBoard[i][j];
  if (!cell.isShown && cell.isMarked)
    return `<img class='cellImg' src="./imegs/flag.jpeg"/>`;
  if (!cell.isShown) return `<img class="cellImg" src="./imegs/cell.jpeg"/>`;
  if (cell.isShown && cell.isMine)
    return `<img class="cellImg" src="./imegs/mine.jpeg"/>`;
  if (cell.isShown && cell.minesAroundCount === 0)
    return `<img class="cellImg" src="./imegs/empty.jpeg"/>`;
  if (cell.isShown && cell.minesAroundCount === 1)
    return `<img class="cellImg" src="./imegs/one.jpeg"/>`;
  if (cell.isShown && cell.minesAroundCount === 2)
    return `<img class="cellImg" src="./imegs/two.jpeg"/>`;
  if (cell.isShown && cell.minesAroundCount === 3)
    return `<img class="cellImg" src="./imegs/three.jpeg"/>`;
  if (cell.isShown && cell.minesAroundCount === 4)
    return `<img class="cellImg" src="./imegs/four.jpeg"/>`;
}
//marked cell with a flag.
function setFlag(i, j, ev) {
  ev.preventDefault();
  if (gGame.gameOver) return;
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
  if (gBoard[i][j].isMarked) {
    gGame.markedCount--;
  } else {
    gGame.markedCount++;
  }
  renderBoard();
}
//shows the cell next to it if it is empty.
function showCellNxt(i, j) {
  var celli = i;
  var cellJ = j;

  if (gBoard[i][j].minesAroundCount === 0) {
    for (var celli = i - 1; celli <= i + 1; celli++) {
      if (celli < 0 || celli >= gBoard.length) continue;
      for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
        if (i === celli && j === cellJ) continue;
        if (cellJ < 0 || cellJ >= gBoard[celli].length) continue;
        if (gBoard[celli][cellJ].isMine === true) return;
        if (!gBoard[celli][cellJ].isShown) {
          gBoard[celli][cellJ].isShown = true;
          gGame.shownCount++;
          showCellNxt(celli, cellJ);
        }
      }
    }
  }
}
//shows how many lives the player has.
function livesPlayer() {
  var heartsString = "";
  var elLives = document.querySelector("h2 .lives-count");
  elLives.style.color = "white";
  for (var i = 0; i < gGame.lives; i++) {
    heartsString += "❤";
  }
  if (gGame.lives === 0) {
    gGame.gameOver = true;
    heartsString = "Game Over";
    elLives.style.color = "black";
    clearInterval(gTimer);
  }
  elLives.innerText = heartsString;
}

//timer.
function showTime() {
  let mins = Math.floor(elSeconds / 60);
  let secs = Math.floor(elSeconds % 60);
  let output =
    mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");

  elH2.innerText = output;
  elSeconds++;
}
//check if the game over and the result.
function gameOver() {
  if (gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
    elIcon.innerText = "🤩";
    clearInterval(gTimer);
  }
}
//get random number from min - max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
