console.log('Main.js loading...');

// Main application
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make sure canvas exists
if (!canvas) {
    console.error('Canvas not found!');
}

console.log('Canvas found:', canvas);

// Fullscreen responsive canvas sizing
function resizeCanvas() {
    // Make canvas take most of the screen but leave room for UI
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60; // Leave room for controls at top
    
    console.log('Canvas resized:', canvas.width, 'x', canvas.height);
    
    // Reposition character to ground level
    if (window.character) {
        character.y = canvas.height - 180;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize scrolling scene manager
console.log('Creating SceneManager...');
window.sceneManager = new SceneManager(canvas);
console.log('SceneManager created');

console.log('Creating Character...');
const character = new Character(canvas);
console.log('Character created');

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
    
    console.log('Canvas clicked at:', clickX, clickY);
    
    // Check contact button (fixed position)
    if (window.contactButton) {
        if (clickX >= window.contactButton.x && clickX <= window.contactButton.x + window.contactButton.width &&
            clickY >= window.contactButton.y && clickY <= window.contactButton.y + window.contactButton.height) {
            
            console.log('Contact button clicked');
            document.getElementById('contactModal').style.display = 'block';
            
            if (window.audioManager) {
                audioManager.play('click');
            }
            return;
        }
    }
    
    // Check game cards (fixed positions)
    if (window.gameCards) {
        for (let card of window.gameCards) {
            if (clickX >= card.x && clickX <= card.x + card.width &&
                clickY >= card.y && clickY <= card.y + card.height) {
                
                console.log('Game card clicked:', card.game);
                startGame(card.game);
                
                if (window.audioManager) {
                    audioManager.play('click');
                }
                return;
            }
        }
    }
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        console.log('Contact form submitted:', { name, email, message });
        
        document.getElementById('contactForm').style.display = 'none';
        document.getElementById('formSuccess').classList.remove('hidden');
        
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
}

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
    console.log('Achievements button clicked');
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
if (musicToggle) {
    console.log('Music toggle found');
    let musicToggled = false;
    musicToggle.addEventListener('click', () => {
        console.log('Music toggle clicked');
        if (!musicToggled && window.achievementSystem) {
            achievementSystem.unlock('music_lover');
            musicToggled = true;
        }
    });
} else {
    console.error('Music toggle not found!');
}

// Reset achievements button
const resetBtn = document.getElementById('resetAchievements');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (window.achievementSystem) {
            achievementSystem.reset();
        }
    });
}

function startGame(gameName) {
    console.log('Starting game:', gameName);
    const miniCanvas = document.getElementById('miniGameCanvas');
    const gameTitle = document.getElementById('gameTitle');
    const gameInstructions = document.getElementById('gameInstructions');
    
    if (currentGame && currentGame.cleanup) {
        currentGame.cleanup();
    }
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }
    
    gameTitle.textContent = gameName;
    
    try {
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
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Error loading game: ' + error.message);
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
    
    if (currentGame && currentGame.score !== undefined) {
        if (currentGame.constructor.name === 'FlappyBird') {
            if (window.achievementSystem) {
                achievementSystem.checkFlappyScore(currentGame.score);
            }
        } else if (currentGame.constructor.name === 'Panda') {
            if (window.achievementSystem) {
                achievementSystem.checkSnakeScore(currentGame.score);
            }
        }
    }
    
    if (currentGame && currentGame.constructor.name === 'Pong') {
        if (currentGame.player && currentGame.player.score > currentGame.ai.score) {
            if (window.achievementSystem) {
                achievementSystem.checkPongWin(currentGame.player.score, currentGame.ai.score);
            }
        }
    }
    
    currentGame = null;
}

const restartBtn = document.getElementById('restartGame');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        if (currentGame) {
            currentGame.reset();
        }
    });
}

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
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update scene
        sceneManager.update();
        
        // Draw realistic room
        sceneManager.drawRealisticBackground();
        sceneManager.drawRealisticFloor();
        
        // Draw room elements
        sceneManager.drawRealisticWindow();
        sceneManager.drawRealisticBed(canvas.height - 200);
        sceneManager.drawRealisticDesk(canvas.height - 200);
        sceneManager.drawRealisticBookshelf();
        sceneManager.drawRealisticPosters();
        sceneManager.drawRealisticLamp(canvas.height - 200);
        
        // Draw sections (About Me, Games panels)
        sceneManager.drawSections();
        
        // Update and draw character
        character.update();
        character.draw();
        
        animationId = requestAnimationFrame(animate);
    } catch (error) {
        console.error('Animation error:', error);
        console.error(error.stack);
    }
}

// Start animation when page loads
console.log('Starting animation...');
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
    
    if (window.contactButton) {
        const btnScreenX = window.contactButton.worldX - sceneManager.cameraX;
        
        if (touchX >= btnScreenX && touchX <= btnScreenX + window.contactButton.width &&
            touchY >= window.contactButton.y && touchY <= window.contactButton.y + window.contactButton.height) {
            document.getElementById('contactModal').style.display = 'block';
        }
    }
    
    if (window.gameCards) {
        window.gameCards.forEach(card => {
            const cardScreenX = card.worldX - sceneManager.cameraX;
            
            if (touchX >= cardScreenX && touchX <= cardScreenX + card.width &&
                touchY >= card.y && touchY <= card.y + card.height) {
                startGame(card.game);
            }
        });
    }
    
    if (character.isPointInCharacter(touchX, touchY)) {
        character.onCharacterClick();
    }
}, { passive: false });

console.log('Main.js loaded successfully!');
