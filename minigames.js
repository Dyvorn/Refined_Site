// minigames.js
document.addEventListener('DOMContentLoaded', () => {
    initTicTacToe();
    initMinigames();
});

function initTicTacToe() {
    const statusDisplay = document.getElementById('statusDisplay');
    const cells = document.querySelectorAll('.cell');
    const restartBtn = document.getElementById('restartBtn');

    if (!statusDisplay || !cells.length || !restartBtn) return; // Only run if on a page with the minigame

    let gameActive = true;
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];

    const winningMessage = () => `Player ${currentPlayer} has won!`;
    const drawMessage = () => `Game ended in a draw!`;
    const currentPlayerTurn = () => `Player ${currentPlayer}'s turn`;

    statusDisplay.innerHTML = currentPlayerTurn();

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
        clickedCell.style.transform = 'scale(0.9)';
        setTimeout(() => { clickedCell.style.transform = 'scale(1)'; }, 100);
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = currentPlayerTurn();
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = drawMessage();
            gameActive = false;
            return;
        }

        handlePlayerChange();
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = currentPlayerTurn();
        cells.forEach(cell => {
            cell.innerHTML = "";
            cell.classList.remove('x', 'o');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', handleRestartGame);
}

function initMinigames() {
    // Tab switching logic
    const tabs = document.querySelectorAll('.game-tab');
    const containers = document.querySelectorAll('.game-container');

    if (!tabs.length || !containers.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            containers.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetContainer = document.getElementById(targetId);
            if (targetContainer) {
                targetContainer.classList.add('active');
                targetContainer.style.display = 'block';
            }
        });
    });

    initMemoryMatch();
    initReactionTimer();
    initRockPaperScissors();
    initNumberGuesser();
}

function initMemoryMatch() {
    const memoryBoard = document.getElementById('memoryBoard');
    const memoryStatus = document.getElementById('memoryStatus');
    const restartBtn = document.getElementById('restartMemoryBtn');
    
    if (!memoryBoard || !memoryStatus || !restartBtn) return;

    const emojis = ['🚀', '💻', '☕', '🎮', '💡', '🔥', '🚀', '💻', '☕', '🎮', '💡', '🔥'];
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let lockBoard = false;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createBoard() {
        memoryBoard.innerHTML = '';
        shuffle(emojis);
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        lockBoard = false;
        updateStatus();

        emojis.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.index = index;
            card.dataset.emoji = emoji;

            card.innerHTML = `
                <div class="front">?</div>
                <div class="back">${emoji}</div>
            `;

            card.addEventListener('click', flipCard);
            memoryBoard.appendChild(card);
            cards.push(card);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            updateStatus();
            checkForMatch();
        }
    }

    function checkForMatch() {
        let isMatch = flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        flippedCards[0].classList.add('matched');
        flippedCards[1].classList.add('matched');
        matchedPairs++;
        updateStatus();
        flippedCards = [];

        if (matchedPairs === 6) {
            memoryStatus.innerHTML = `You won in ${moves} moves!`;
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            flippedCards[0].classList.remove('flipped');
            flippedCards[1].classList.remove('flipped');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }

    function updateStatus() {
        if (matchedPairs < 6) {
            memoryStatus.innerHTML = `Moves: ${moves} | Matches: ${matchedPairs}/6`;
        }
    }

    restartBtn.addEventListener('click', createBoard);
    createBoard();
}

function initReactionTimer() {
    const reactionBox = document.getElementById('reactionBox');
    const reactionStatus = document.getElementById('reactionStatus');
    const restartBtn = document.getElementById('restartReactionBtn');

    if (!reactionBox || !reactionStatus || !restartBtn) return;

    let state = 'waiting'; // waiting, ready, go, finished
    let startTime;
    let timeoutId;

    function resetGame() {
        state = 'waiting';
        reactionBox.className = 'reaction-box';
        reactionBox.innerHTML = 'Click to Start';
        reactionStatus.innerHTML = 'Reaction Timer';
        restartBtn.style.display = 'none';
        clearTimeout(timeoutId);
    }

    function startGame() {
        state = 'ready';
        reactionBox.className = 'reaction-box';
        reactionBox.innerHTML = 'Wait for green...';
        
        const delay = Math.floor(Math.random() * 3000) + 1500; // 1.5s to 4.5s
        
        timeoutId = setTimeout(() => {
            if (state === 'ready') {
                state = 'go';
                reactionBox.className = 'reaction-box green';
                reactionBox.innerHTML = 'CLICK NOW!';
                startTime = Date.now();
            }
        }, delay);
    }

    reactionBox.addEventListener('click', () => {
        if (state === 'waiting') {
            startGame();
        } else if (state === 'ready') {
            clearTimeout(timeoutId);
            state = 'finished';
            reactionBox.className = 'reaction-box blue';
            reactionBox.innerHTML = 'Too early!';
            restartBtn.style.display = 'inline-block';
        } else if (state === 'go') {
            const reactionTime = Date.now() - startTime;
            state = 'finished';
            reactionBox.className = 'reaction-box blue';
            reactionBox.innerHTML = `${reactionTime} ms`;
            reactionStatus.innerHTML = 'Great job!';
            restartBtn.style.display = 'inline-block';
        }
    });

    restartBtn.addEventListener('click', resetGame);
    resetGame();
}

function initRockPaperScissors() {
    const rpsBtns = document.querySelectorAll('.rps-btn');
    const rpsResult = document.getElementById('rpsResult');
    const rpsScore = document.getElementById('rpsScore');
    const restartRpsBtn = document.getElementById('restartRpsBtn');

    if (!rpsBtns.length || !rpsResult || !rpsScore || !restartRpsBtn) return;

    let wins = 0;
    let losses = 0;
    let ties = 0;
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

    function updateScore() {
        rpsScore.innerHTML = `Wins: ${wins} | Losses: ${losses} | Ties: ${ties}`;
    }

    function playRound(playerChoice) {
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        let outcome = '';

        if (playerChoice === computerChoice) {
            outcome = "It's a Tie!";
            ties++;
            rpsResult.style.color = 'var(--text-color)';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            outcome = 'You Win!';
            wins++;
            rpsResult.style.color = '#10b981'; // Green
        } else {
            outcome = 'You Lose!';
            losses++;
            rpsResult.style.color = '#ef4444'; // Red
        }

        rpsResult.innerHTML = `${emojis[playerChoice]} vs ${emojis[computerChoice]} <br> ${outcome}`;
        updateScore();
    }

    rpsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playRound(btn.getAttribute('data-choice'));
        });
    });

    restartRpsBtn.addEventListener('click', () => {
        wins = 0;
        losses = 0;
        ties = 0;
        rpsResult.innerHTML = '';
        updateScore();
    });
}

function initNumberGuesser() {
    const guessInput = document.getElementById('guessInput');
    const guessSubmit = document.getElementById('guessSubmit');
    const guessHint = document.getElementById('guessHint');
    const guessCount = document.getElementById('guessCount');
    const restartGuessBtn = document.getElementById('restartGuessBtn');

    if (!guessInput || !guessSubmit || !guessHint || !guessCount || !restartGuessBtn) return;

    let targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let isGameOver = false;

    function resetGame() {
        targetNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        isGameOver = false;
        guessInput.value = '';
        guessInput.disabled = false;
        guessSubmit.disabled = false;
        guessHint.innerHTML = '';
        guessHint.style.color = 'var(--accent-color)';
        guessCount.innerHTML = `Attempts: ${attempts}`;
    }

    function makeGuess() {
        if (isGameOver) return;
        
        const guess = parseInt(guessInput.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            guessHint.innerHTML = 'Please enter a number between 1 and 100.';
            return;
        }

        attempts++;
        guessCount.innerHTML = `Attempts: ${attempts}`;

        if (guess === targetNumber) {
            guessHint.innerHTML = `Correct! It was ${targetNumber}.`;
            guessHint.style.color = '#10b981';
            isGameOver = true;
            guessInput.disabled = true;
            guessSubmit.disabled = true;
        } else if (guess < targetNumber) {
            guessHint.innerHTML = 'Too low!';
        } else {
            guessHint.innerHTML = 'Too high!';
        }
        
        guessInput.value = '';
        guessInput.focus();
    }

    guessSubmit.addEventListener('click', makeGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });

    restartGuessBtn.addEventListener('click', resetGame);
    resetGame();
}
