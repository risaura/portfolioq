// Main application
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const maxWidth = 800;
    const maxHeight = 600;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (windowWidth < maxWidth) {
        canvas.width = windowWidth;
        canvas.height = (windowWidth / maxWidth) * maxHeight;
    } else {
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize scrolling scene manager
window.sceneManager = new SceneManager(canvas);
const character = new Character(canvas);

// Current active game
let currentGame = null;
let animationId = null;
let gameAnimationId = null;

// Hide movement hint after a few seconds
setTimeout(() => {
    const hint = document.getElementById('movementHint');
    if (hint) {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 1s';
        setTimeout(() => hint.style.display = 'none', 1000);
    }
}, 5000);

// Click handling for game cards
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    // Check if clicking on a game card
    if (window.gameCards) {
        window.gameCards.forEach(card => {
            const cardScreenX = card.worldX - sceneManager.cameraX;
            
            if (clickX >= cardScreenX && clickX <= cardScreenX + card.width &&
                clickY >= card.y && clickY <= card.y + card.height) {
                
                console.log('Clicked game:', card.game);
                startGame(card.game);
                
                if (window.audioManager) {
                    audioManager.play('click');
                }
            }
        });
    }
});

// Modal controls
document.getElementById('closeGame').addEventListener('click', () => {
    closeGameModal();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        if (e.target.id === 'gameModal') {
            closeGameModal();
        }
    }
});

// Music toggle achievement
const musicToggle = document.getElementById('musicToggle');
let musicToggled = false;
musicToggle.addEventListener('click', () => {
    if (!musicToggled && window.achievementSystem) {
        achievementSystem.unlock('music_lover');
        musicToggled = true;
    }
});

// Reset achievements button
document.getElementById('resetAchievements').addEventListener('click', () => {
    if (window.achievementSystem) {
        achievementSystem.reset();
    }
});

// Achievements modal
document.getElementById('closeAchievements').addEventListener('click', () => {
    document.getElementById('achievementsModal').style.display = 'none';
});

// Open achievements from music control area (add button)
setTimeout(() => {
    const musicControl = document.getElementById('musicControl');
    if (musicControl) {
        const achievementBtn = document.createElement('button');
        achievementBtn.className = 'music-btn';
        achievementBtn.textContent = '🏆 Achievements';
        achievementBtn.style.marginTop = '10px';
        achievementBtn.addEventListener('click', () => {
            document.getElementById('achievementsModal').style.display = 'block';
            if (window.achievementSystem) {
                achievementSystem.trackSectionVisit('achievements');
            }
        });
        musicControl.appendChild(achievementBtn);
    }
}, 100);

// High score management
function updateHighScores() {
    const flappyScore = localStorage.getItem('flappyHighScore') || 0;
    const snakeScore = localStorage.getItem('snakeHighScore') || 0;
    const pongScore = localStorage.getItem('pongHighScore') || 0;
    
    // Update if elements exist
    const flappyEl = document.getElementById('flappyHighScore');
    const snakeEl = document.getElementById('snakeHighScore');
    const pongEl = document.getElementById('pongHighScore');
    
    if (flappyEl) flappyEl.textContent = flappyScore;
    if (snakeEl) snakeEl.textContent = snakeScore;
    if (pongEl) pongEl.textContent = pongScore;
}

function saveHighScore(game, score) {
    const currentHigh = parseInt(localStorage.getItem(`${game}HighScore`) || 0);
    if (score > currentHigh) {
        localStorage.setItem(`${game}HighScore`, score);
    }
}

function startGame(gameName) {
    const miniCanvas = document.getElementById('miniGameCanvas');
    const gameTitle = document.getElementById('gameTitle');
    const gameInstructions = document.getElementById('gameInstructions');
    
    // Clean up previous game
    if (currentGame && currentGame.cleanup) {
        currentGame.cleanup();
    }
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }
    
    gameTitle.textContent = gameName;
    
    // Create new game instance
    switch(gameName) {
        case 'Flappy Bird':
            currentGame = new FlappyBird(miniCanvas);
            gameInstructions.innerHTML = 'Click or press SPACE to flap!<br>Avoid the pipes!';
            runFlappyBird();
            break;
        case 'Snake':
            currentGame = new Snake(miniCanvas);
            gameInstructions.innerHTML = 'Use arrow keys to move<br>Eat apples to grow!';
            runSnake();
            break;
        case 'Pong':
            currentGame = new Pong(miniCanvas);
            gameInstructions.innerHTML = 'Use ↑↓ or W/S keys to move<br>First to 5 wins!';
            runPong();
            break;
        case 'Pong 2P':
            currentGame = new Pong2P(miniCanvas);
            gameInstructions.innerHTML = 'Player 1: W/S keys | Player 2: ↑↓ keys<br>First to 5 wins!';
            document.getElementById('multiplayerStatus').classList.remove('hidden');
            document.getElementById('playerCount').textContent = '2';
            runPong();
            break;
        case 'Snake Race':
            currentGame = new SnakeRace(miniCanvas);
            gameInstructions.innerHTML = 'Player 1: WASD | Player 2: Arrow Keys<br>Race to the highest score!';
            document.getElementById('multiplayerStatus').classList.remove('hidden');
            document.getElementById('playerCount').textContent = '2';
            runSnake();
            break;
    }
    
    document.getElementById('gameModal').style.display = 'block';
    currentGame.updateScoreDisplay();
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
}

function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
    document.getElementById('multiplayerStatus').classList.add('hidden');
    document.getElementById('playerCount').textContent = '1';
    
    if (currentGame && currentGame.cleanup) {
        currentGame.cleanup();
    }
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }
    
    // Check for high scores and achievements before closing
    if (currentGame && currentGame.score !== undefined) {
        if (currentGame.constructor.name === 'FlappyBird') {
            saveHighScore('flappy', currentGame.score);
            if (window.achievementSystem) {
                achievementSystem.checkFlappyScore(currentGame.score);
            }
        } else if (currentGame.constructor.name === 'Snake') {
            saveHighScore('snake', currentGame.score);
            if (window.achievementSystem) {
                achievementSystem.checkSnakeScore(currentGame.score);
            }
        }
    }
    
    // Check Pong achievements
    if (currentGame && currentGame.constructor.name === 'Pong') {
        if (currentGame.player.score > currentGame.ai.score) {
            const wins = parseInt(localStorage.getItem('pongHighScore') || 0) + 1;
            localStorage.setItem('pongHighScore', wins);
            
            if (window.achievementSystem) {
                achievementSystem.checkPongWin(currentGame.player.score, currentGame.ai.score);
            }
        }
    }
    
    currentGame = null;
}

document.getElementById('restartGame').addEventListener('click', () => {
    if (currentGame) {
        currentGame.reset();
    }
});

function runFlappyBird() {
    function loop() {
        if (!currentGame) return;
        currentGame.update();
        currentGame.draw();
        
        if (window.achievementSystem && !currentGame.gameOver) {
            achievementSystem.checkFlappyScore(currentGame.score);
        }
        
        if (currentGame.gameOver && window.audioManager && !currentGame.soundPlayed) {
            audioManager.play('gameOver');
            currentGame.soundPlayed = true;
        }
        
        gameAnimationId = requestAnimationFrame(loop);
    }
    loop();
}

function runSnake() {
    function loop(timestamp) {
        if (!currentGame) return;
        currentGame.update(timestamp);
        currentGame.draw();
        
        if (window.achievementSystem && !currentGame.gameOver) {
            if (currentGame.constructor.name === 'Snake') {
                achievementSystem.checkSnakeScore(currentGame.score);
            }
        }
        
        if (currentGame.gameOver && window.audioManager && !currentGame.soundPlayed) {
            audioManager.play('gameOver');
            currentGame.soundPlayed = true;
        }
        
        gameAnimationId = requestAnimationFrame(loop);
    }
    gameAnimationId = requestAnimationFrame(loop);
}

function runPong() {
    function loop() {
        if (!currentGame) return;
        currentGame.update();
        currentGame.draw();
        
        if (currentGame.gameOver && window.audioManager && !currentGame.soundPlayed) {
            if (currentGame.player1 || currentGame.player) {
                const won = currentGame.player1 ? currentGame.player1.score >= 5 : currentGame.player.score >= 5;
                audioManager.play(won ? 'achievement' : 'gameOver');
            }
            currentGame.soundPlayed = true;
        }
        
        gameAnimationId = requestAnimationFrame(loop);
    }
    loop();
}

// Main game loop for scrolling world
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw scene (background, sections, etc.)
    sceneManager.drawBackground();
    sceneManager.drawGround();
    sceneManager.drawSections();
    
    // Update and draw character
    character.update();
    character.draw();
    
    animationId = requestAnimationFrame(animate);
}

// Initialize high scores display
updateHighScores();

// Start the animation
animate();

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * scaleX;
    const touchY = (touch.clientY - rect.top) * scaleY;
    
    // Check game cards
    if (window.gameCards) {
        window.gameCards.forEach(card => {
            const cardScreenX = card.worldX - sceneManager.cameraX;
            
            if (touchX >= cardScreenX && touchX <= cardScreenX + card.width &&
                touchY >= card.y && touchY <= card.y + card.height) {
                startGame(card.game);
            }
        });
    }
    
    // Check character tap
    if (character.isPointInCharacter(touchX, touchY)) {
        character.onCharacterClick();
    }
}, { passive: false });
