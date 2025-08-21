// UI integration for live-chess
const P = ['a','b','c','d','e','f','g','h'];
const B = {
  white: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
  },
  black: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg'
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const boardEl = document.querySelector('.chess-board');
  const engine = new ChessEngine();
  const aiWhite = new ChessAI('WhiteBot');
  const aiBlack = new ChessAI('BlackBot');

  function O() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = document.createElement('div');
        square.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
        square.dataset.row = r;
        square.dataset.col = c;
        boardEl.appendChild(square);
      }
    }
  }

  function A() {
    // Clear old pieces
    boardEl.querySelectorAll('.piece').forEach(e => e.remove());
    // Render current board state
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = engine.board[r][c];
        if (p) {
          const pieceDiv = document.createElement('div');
          pieceDiv.className = 'piece';
          pieceDiv.style.backgroundImage = `url('${B[p.color][p.type]}')`;
          const idx = r * 8 + c;
          boardEl.children[idx].appendChild(pieceDiv);
        }
      }
    }
  }

  O();
  A();

  // Bot vs Bot play
  setInterval(async () => {
    if (engine.gameOver) return;
    const ai = engine.currentPlayer === 'white' ? aiWhite : aiBlack;
    const move = await ai.chooseMove(engine);
    if (move) {
      engine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
      A();
    }
  }, 1000);
});
