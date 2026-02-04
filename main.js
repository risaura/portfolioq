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
    
    // Reposition elements after resize
    if (character) {
        character.x = canvas.width / 2;
        character.y = canvas.height - 150;
    }
    
    // Reposition signs
    repositionSigns();
}

function repositionSigns() {
    if (!signs || signs.length === 0) return;
    
    const signSpacing = 170;
    const totalWidth = signs.length * signSpacing - 20;
    const startX = (canvas.width - totalWidth) / 2;
    
    signs.forEach((sign, index) => {
        sign.x = startX + (index * signSpacing);
        sign.y = 50;
    });
}

// Set initial canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize scene and character
const scene = new Scene(canvas);
const character = new Character(canvas);

// Initialize wooden signs for all sections
const aboutSign = new WoodenSign(50, 50, "About Me", () => {
    document.getElementById('aboutModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('about');
    }
    if (window.audioManager) {
        audioManager.play('click');
    }
});

const gamesSign = new WoodenSign(220, 50, "Games", () => {
    document.getElementById('gamesModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('games');
    }
    if (window.audioManager) {
        audioManager.play('click');
    }
    updateHighScores();
});

const achievementsSign = new WoodenSign(390, 50, "Achievements", () => {
    document.getElementById('achievementsModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('achievements');
    }
    if (window.audioManager) {
        audioManager.play('click');
    }
});

const projectsSign = new WoodenSign(50, 130, "Projects", () => {
    document.getElementById('projectsModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('projects');
    }
    if (window.audioManager) {
        audioManager.play('click');
    }
});

const contactSign = new WoodenSign(220, 130, "Contact", () => {
    document.getElementById('contactModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('contact');
    }
    if (window.audioManager) {
        audioManager.play('click');
    }
});

const signs = [aboutSign, gamesSign, achievementsSign, projectsSign, contactSign];
repositionSigns();

// Current active game
let currentGame = null;
let animationId = null;
let gameAnimationId = null;

// Mouse handling for main canvas
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    let hoveringSomething = false;
    signs.forEach(sign => {
        sign.hovered = sign.isMouseOver(mouseX, mouseY);
        if (sign.hovered) {
            hoveringSomething = true;
        }
    });
    
    canvas.style.cursor = hoveringSomething ? 'pointer' : 'default';
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    signs.forEach(sign => {
        if (sign.isMouseOver(mouseX, mouseY)) {
            sign.callback();
        }
    });
});

// Modal controls
document.getElementById('closeAbout').addEventListener('click', () => {
    document.getElementById('aboutModal').style.display = 'none';
});

document.getElementById('closeGames').addEventListener('click', () => {
    document.getElementById('gamesModal').style.display = 'none';
});

document.getElementById('closeAchievements').addEventListener('click', () => {
    document.getElementById('achievementsModal').style.display = 'none';
});

document.getElementById('closeProjects').addEventListener('click', () => {
    document.getElementById('projectsModal').style.display = 'none';
});

document.getElementById('closeContact').addEventListener('click', () => {
    document.getElementById('contactModal').style.display = 'none';
});

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

// High score management
function updateHighScores() {
    const flappyScore = localStorage.getItem('flappyHighScore') || 0;
    const snakeScore = localStorage.getItem('snakeHighScore') || 0;
    const pongScore = localStorage.getItem('pongHighScore') || 0;
    
    document.getElementById('flappyHighScore').textContent = flappyScore;
    document.getElementById('snakeHighScore').textContent = snakeScore;
    document.getElementById('pongHighScore').textContent = pongScore;
}

function saveHighScore(game, score) {
    const currentHigh = parseInt(localStorage.getItem(`${game}HighScore`) || 0);
    if (score > currentHigh) {
        localStorage.setItem(`${game}HighScore`, score);
    }
}

// Game button handlers
document.getElementById('playFlappy').addEventListener('click', () => {
    startGame('Flappy Bird');
    document.getElementById('gamesModal').style.display = 'none';
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
});

document.getElementById('playSnake').addEventListener('click', () => {
    startGame('Snake');
    document.getElementById('gamesModal').style.display = 'none';
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
});

document.getElementById('playPong').addEventListener('click', () => {
    startGame('Pong');
    document.getElementById('gamesModal').style.display = 'none';
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
});

document.getElementById('playPong2P').addEventListener('click', () => {
    startGame('Pong 2P');
    document.getElementById('gamesModal').style.display = 'none';
    document.getElementById('multiplayerStatus').classList.remove('hidden');
    document.getElementById('playerCount').textContent = '2';
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
});

document.getElementById('playSnakeRace').addEventListener('click', () => {
    startGame('Snake Race');
    document.getElementById('gamesModal').style.display = 'none';
    document.getElementById('multiplayerStatus').classList.remove('hidden');
    document.getElementById('playerCount').textContent = '2';
    
    if (window.achievementSystem) {
        achievementSystem.unlock('first_game');
    }
});

document.getElementById('restartGame').addEventListener('click', () => {
    if (currentGame) {
        currentGame.reset();
    }
});

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
            runPong();
            break;
        case 'Snake Race':
            currentGame = new SnakeRace(miniCanvas);
            gameInstructions.innerHTML = 'Player 1: WASD | Player 2: Arrow Keys<br>Race to the highest score!';
            runSnake();
            break;
    }
    
    document.getElementById('gameModal').style.display = 'block';
    currentGame.updateScoreDisplay();
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

function runFlappyBird() {
    function loop() {
        if (!currentGame) return;
        currentGame.update();
        currentGame.draw();
        
        // Check achievements during gameplay
        if (window.achievementSystem && !currentGame.gameOver) {
            achievementSystem.checkFlappyScore(currentGame.score);
        }
        
        // Play game over sound
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
        
        // Check achievements during gameplay
        if (window.achievementSystem && !currentGame.gameOver) {
            achievementSystem.checkSnakeScore(currentGame.score);
        }
        
        // Play game over sound
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
        
        // Play game over sound
        if (currentGame.gameOver && window.audioManager && !currentGame.soundPlayed) {
            if (currentGame.player.score >= 5) {
                audioManager.play('achievement');
            } else {
                audioManager.play('gameOver');
            }
            currentGame.soundPlayed = true;
        }
        
        gameAnimationId = requestAnimationFrame(loop);
    }
    loop();
}

// Main game loop for portfolio scene
function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw scene
    scene.drawSky();
    scene.drawGround();
    
    // Update and draw character
    character.update();
    character.draw();
    
    // Draw signs
    signs.forEach(sign => sign.draw(ctx));
    
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
    const mouseX = (touch.clientX - rect.left) * scaleX;
    const mouseY = (touch.clientY - rect.top) * scaleY;
    
    signs.forEach(sign => {
        if (sign.isMouseOver(mouseX, mouseY)) {
            sign.callback();
        }
    });
    
    // Check character tap
    if (character.isPointInCharacter(mouseX, mouseY)) {
        character.onCharacterClick();
    }
}, { passive: false });
