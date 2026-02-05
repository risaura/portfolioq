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

// Click handling for game cards and contact button
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    // Check contact button
    if (window.contactButton) {
        const btnScreenX = window.contactButton.worldX - sceneManager.cameraX;
        
        if (clickX >= btnScreenX && clickX <= btnScreenX + window.contactButton.width &&
            clickY >= window.contactButton.y && clickY <= window.contactButton.y + window.contactButton.height) {
            
            document.getElementById('contactModal').style.display = 'block';
            
            if (window.audioManager) {
                audioManager.play('click');
            }
        }
    }
    
    // Check game cards
    if (window.gameCards) {
        window.gameCards.forEach(card => {
            const cardScreenX = card.worldX - sceneManager.cameraX;
            
            if (clickX >= cardScreenX && clickX <= cardScreenX + card.width &&
                clickY >= card.y && clickY <= card.y + card.height) {
                
                startGame(card.game);
                
                if (window.audioManager) {
                    audioManager.play('click');
                }
            }
        });
    }
});

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    // In a real app, you'd send this to a server
    // For now, just show success message
    console.log('Contact form submitted:', { name, email, message });
    
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').classList.remove('hidden');
    
    // Save to localStorage for demonstration
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    setTimeout(() => {
        document.getElementById('contactModal').style.display = 'none';
        document.getElementById('contactForm').style.display = 'flex';
        document.getElementById('formSuccess').classList.add('hidden');
        document.getElementById('contactForm').reset();
    }, 3000);
});

// Modal controls
document.getElementById('closeContact').addEventListener('click', () => {
    document.getElementById('contactModal').style.display = 'none';
});

document.getElementById('closeGame').addEventListener('click', () => {
    closeGameModal();
});

document.getElementById('closeAchievements').addEventListener('click', () => {
    document.getElementById('achievementsModal').style.display = 'none';
});

// Achievements button
document.getElementById('achievementsBtn').addEventListener('click', () => {
    document.getElementById('achievementsModal').style.display = 'block';
    if (window.achievementSystem) {
        achievementSystem.trackSectionVisit('achievements');
    }
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
    const pandaScore = localStorage.getItem('pandaHighScore') || 0;
    const pongScore = localStorage.getItem('pongHighScore') || 0;
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
        case 'Panda':
            currentGame = new Panda(miniCanvas);
            gameInstructions.innerHTML = 'Use arrow keys to move<br>Eat bamboo to grow fatter!';
            runPanda();
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
            runPanda();
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
    
    if (currentGame && currentGame.cleanup) {
        currentGame.cleanup();
    }
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }
    
    // Check for high scores and achievements
    if (currentGame && currentGame.score !== undefined) {
        if (currentGame.constructor.name === 'FlappyBird') {
            saveHighScore('flappy', currentGame.score);
            if (window.achievementSystem) {
                achievementSystem.checkFlappyScore(currentGame.score);
            }
        } else if (currentGame.constructor.name === 'Panda') {
            saveHighScore('panda', currentGame.score);
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

function runPanda() {
    function loop(timestamp) {
        if (!currentGame) return;
        currentGame.update(timestamp);
        currentGame.draw();
        
        if (window.achievementSystem && !currentGame.gameOver) {
            if (currentGame.constructor.name === 'Panda') {
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
    
    // Draw scene
    sceneManager.drawBackground();
    sceneManager.drawGround();
    sceneManager.drawSections();
    
    // Update and draw character
    character.update();
    character.draw();
    
    animationId = requestAnimationFrame(animate);
}

// Initialize
updateHighScores();
animate();

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) * scaleX;
    const touchY = (touch.clientY - rect.top) * scaleY;
    
    // Check contact button
    if (window.contactButton) {
        const btnScreenX = window.contactButton.worldX - sceneManager.cameraX;
        
        if (touchX >= btnScreenX && touchX <= btnScreenX + window.contactButton.width &&
            touchY >= window.contactButton.y && touchY <= window.contactButton.y + window.contactButton.height) {
            document.getElementById('contactModal').style.display = 'block';
        }
    }
    
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
