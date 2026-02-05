class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.worldWidth = 4000;
        this.time = 0;
        
        this.sections = {
            center: { x: 0, width: 1200, name: 'Home' },
            aboutMe: { x: -1200, width: 1200, name: 'About Me' },
            games: { x: 1200, width: 2800, name: 'Games' }
        };
        
        this.currentSection = 'center';
        
        // Trees data
        this.trees = [
            { x: -800, scale: 1.2 },
            { x: -400, scale: 1 },
            { x: 200, scale: 1.1 },
            { x: 600, scale: 0.9 },
            { x: 1000, scale: 1.3 },
            { x: 1400, scale: 1 },
            { x: 1800, scale: 1.1 },
            { x: 2200, scale: 1.2 }
        ];
    }

    moveCamera(dx) {
        this.cameraX += dx;
        this.cameraX = Math.max(-1200, Math.min(2800, this.cameraX));
        
        const characterWorldX = this.cameraX;
        
        if (characterWorldX < 0) {
            if (this.currentSection !== 'aboutMe') {
                this.currentSection = 'aboutMe';
                this.onSectionEnter('aboutMe');
            }
        } else if (characterWorldX < 1200) {
            if (this.currentSection !== 'center') {
                this.currentSection = 'center';
                this.onSectionEnter('center');
            }
        } else {
            if (this.currentSection !== 'games') {
                this.currentSection = 'games';
                this.onSectionEnter('games');
            }
        }
    }

    onSectionEnter(section) {
        console.log('Entered section:', section);
        const indicator = document.getElementById('sectionIndicator');
        if (indicator) {
            indicator.textContent = this.sections[section].name;
            indicator.classList.remove('hidden');
            indicator.classList.add('show');
        }
    }

    drawBackground() {
        this.time += 0.01;
        
        // Sky - pixel art style gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.6, '#b4d7f1');
        gradient.addColorStop(1, '#d4e8f4');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pixel art clouds
        this.drawPixelCloud(250 - this.cameraX * 0.3, 80, 1);
        this.drawPixelCloud(600 - this.cameraX * 0.4, 120, 0.8);
        this.drawPixelCloud(1000 - this.cameraX * 0.35, 60, 1.2);
        this.drawPixelCloud(1500 - this.cameraX * 0.3, 100, 0.9);
    }

    drawPixelCloud(x, y, scale) {
        const s = 8 * scale;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Cloud body (pixelated)
        this.ctx.fillRect(x, y, s * 4, s);
        this.ctx.fillRect(x - s, y + s, s * 6, s);
        this.ctx.fillRect(x + s, y - s, s * 2, s);
        this.ctx.fillRect(x - s, y + s * 2, s * 6, s);
    }

    drawGround() {
        const groundY = this.canvas.height - 200;
        
        // Dark soil base
        this.ctx.fillStyle = '#2d1b00';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Grass layers (pixel art style)
        const grassGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height - 50);
        grassGradient.addColorStop(0, '#7cb342');
        grassGradient.addColorStop(0.5, '#689f38');
        grassGradient.addColorStop(1, '#558b2f');
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, 150);
        
        // Grass details (small pixel tufts)
        this.ctx.fillStyle = '#8bc34a';
        for (let i = -this.cameraX % 30; i < this.canvas.width; i += 30) {
            const tuftHeight = 6 + Math.sin(i * 0.1) * 3;
            this.ctx.fillRect(i, groundY - 3, 3, tuftHeight);
            this.ctx.fillRect(i + 10, groundY - 2, 3, tuftHeight - 2);
            this.ctx.fillRect(i + 20, groundY - 4, 3, tuftHeight - 1);
        }
        
        // Draw trees
        this.trees.forEach(tree => {
            const treeX = tree.x - this.cameraX;
            if (treeX > -400 && treeX < this.canvas.width + 400) {
                this.drawPixelTree(treeX, groundY - 20, tree.scale);
            }
        });
        
        // Small rocks
        this.ctx.fillStyle = '#757575';
        for (let i = -this.cameraX % 200; i < this.canvas.width; i += 200) {
            this.ctx.fillRect(i + 50, groundY + 20, 15, 10);
            this.ctx.fillRect(i + 52, groundY + 15, 11, 5);
        }
    }

    drawPixelTree(x, y, scale) {
        const s = scale;
        
        // Tree trunk (brown with texture)
        this.ctx.fillStyle = '#5d4037';
        this.ctx.fillRect(x - 20 * s, y, 40 * s, 100 * s);
        
        // Trunk highlights
        this.ctx.fillStyle = '#6d4c41';
        this.ctx.fillRect(x - 15 * s, y + 10 * s, 10 * s, 80 * s);
        
        // Trunk shadows
        this.ctx.fillStyle = '#4e342e';
        this.ctx.fillRect(x + 5 * s, y + 10 * s, 10 * s, 80 * s);
        
        // Foliage - layered pixel art leaves
        const leafY = y - 80 * s;
        
        // Dark green base
        this.ctx.fillStyle = '#558b2f';
        this.ctx.beginPath();
        this.ctx.arc(x, leafY, 100 * s, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Medium green layer
        this.ctx.fillStyle = '#689f38';
        this.ctx.beginPath();
        this.ctx.arc(x - 20 * s, leafY - 10 * s, 80 * s, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 20 * s, leafY + 10 * s, 70 * s, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Light green highlights
        this.ctx.fillStyle = '#8bc34a';
        this.ctx.beginPath();
        this.ctx.arc(x - 30 * s, leafY - 20 * s, 50 * s, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 25 * s, leafY - 15 * s, 45 * s, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Brightest highlights
        this.ctx.fillStyle = '#aed581';
        this.ctx.beginPath();
        this.ctx.arc(x - 20 * s, leafY - 30 * s, 30 * s, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSections() {
        this.ctx.save();
        this.drawCenterSection();
        this.drawAboutMeSection();
        this.drawGamesSection();
        this.ctx.restore();
    }

    drawCenterSection() {
        const sectionX = this.sections.center.x - this.cameraX;
        
        if (sectionX > -this.sections.center.width && sectionX < this.canvas.width) {
            // Welcome wooden sign on tree
            const signX = this.canvas.width / 2 - 200;
            const signY = 100;
            
            // Rope
            this.ctx.strokeStyle = '#8B7355';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(signX + 200, 50);
            this.ctx.lineTo(signX + 200, signY);
            this.ctx.stroke();
            
            // Wooden board
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(signX, signY, 400, 80);
            
            // Wood texture
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(signX, signY + 15, 400, 3);
            this.ctx.fillRect(signX, signY + 40, 400, 3);
            this.ctx.fillRect(signX, signY + 65, 400, 3);
            
            // Border
            this.ctx.strokeStyle = '#5a3a1a';
            this.ctx.lineWidth = 5;
            this.ctx.strokeRect(signX, signY, 400, 80);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 28px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Mayowa's Portfolio", signX + 200, signY + 45);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '16px Poppins';
            this.ctx.fillText("← About Me | Games →", signX + 200, signY + 65);
        }
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width && sectionX < this.canvas.width) {
            const boardX = Math.max(50, sectionX + 100);
            const boardY = 120;
            const boardWidth = Math.min(700, this.canvas.width - 100);
            const boardHeight = this.canvas.height - 350;
            
            // Rope from tree
            this.ctx.strokeStyle = '#8B7355';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(boardX + boardWidth / 2, 50);
            this.ctx.lineTo(boardX + boardWidth / 2, boardY);
            this.ctx.stroke();
            
            // Board shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(boardX + 5, boardY + 5, boardWidth, boardHeight);
            
            // Wooden board
            this.ctx.fillStyle = '#D2691E';
            this.ctx.fillRect(boardX, boardY, boardWidth, boardHeight);
            
            // Wood grain
            this.ctx.fillStyle = '#A0522D';
            for (let i = 0; i < 8; i++) {
                this.ctx.fillRect(boardX, boardY + i * (boardHeight / 8), boardWidth, 2);
            }
            
            // Border
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 6;
            this.ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);
            
            // Paper background
            const paperX = boardX + 20;
            const paperY = boardY + 20;
            const paperWidth = boardWidth - 40;
            const paperHeight = boardHeight - 40;
            
            this.ctx.fillStyle = '#FFFEF0';
            this.ctx.fillRect(paperX, paperY, paperWidth, paperHeight);
            
            // Paper border
            this.ctx.strokeStyle = '#D4AF37';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(paperX, paperY, paperWidth, paperHeight);
            
            // Title
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 32px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", paperX + paperWidth / 2, paperY + 40);
            
            this.ctx.font = 'bold 24px Poppins';
            this.ctx.fillText('About Me', paperX + paperWidth / 2, paperY + 75);
            
            // Content
            this.ctx.fillStyle = '#333';
            this.ctx.font = '15px Poppins';
            this.ctx.textAlign = 'left';
            const lines = [
                'Hello, my name is Mayowa. I am 17 years old and I am from Avon, Indiana.',
                'I am interested in all things Medicine, Computer Science, Web Game',
                'Development and Engineering. These are my projects that I\'ve developed',
                'over some time. Feel free to play and let me know what you think!',
                '',
                'I recreated classic games to play, but added my own mini-twists to them,',
                'because my school banned all websites that had these games, but since',
                'it is my website, it is not on the registry.',
                '',
                'FOR ROBLOX USERS (Update): The game is coming together, I plan to',
                'release everything by May 2026. Due to college applications, I haven\'t',
                'been able to put much time into finishing the games. I am a one man',
                'operation and it will take some time. I am sorry for the delay and hope',
                'to post some more updates soon.'
            ];
            
            lines.forEach((line, i) => {
                this.ctx.fillText(line, paperX + 20, paperY + 110 + i * 22);
            });
            
            // Contact button
            const btnX = paperX + paperWidth / 2 - 120;
            const btnY = paperY + paperHeight - 50;
            const btnWidth = 240;
            const btnHeight = 40;
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            this.ctx.strokeStyle = '#764ba2';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📧 Send Me a Message', btnX + btnWidth / 2, btnY + 25);
            
            window.contactButton = {
                worldX: this.sections.aboutMe.x + (boardX - sectionX) + paperWidth / 2 - 120,
                y: btnY,
                width: btnWidth,
                height: btnHeight
            };
        }
    }

    drawGamesSection() {
        const sectionX = this.sections.games.x - this.cameraX;
        
        if (sectionX > -this.sections.games.width && sectionX < this.canvas.width) {
            // Wooden sign
            const signX = sectionX + 200;
            const signY = 80;
            
            this.ctx.strokeStyle = '#8B7355';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(signX + 150, 50);
            this.ctx.lineTo(signX + 150, signY);
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(signX, signY, 300, 60);
            
            this.ctx.strokeStyle = '#5a3a1a';
            this.ctx.lineWidth = 5;
            this.ctx.strokeRect(signX, signY, 300, 60);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 36px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', signX + 150, signY + 42);
            
            const games = [
                { name: 'Flappy Bird', icon: '🐦', color: '#87CEEB' },
                { name: 'Panda', icon: '🐼', color: '#90EE90' },
                { name: 'Pong', icon: '🏓', color: '#FFB6C1' },
                { name: 'Pong 2P', icon: '🏓', color: '#DDA0DD' },
                { name: 'Snake Race', icon: '🐍', color: '#98FB98' }
            ];
            
            const cardWidth = 260;
            const cardHeight = 200;
            const gap = 40;
            const startX = sectionX + 150;
            const startY = 180;
            
            window.gameCards = [];
            
            games.forEach((game, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = startX + col * (cardWidth + gap);
                const y = startY + row * (cardHeight + gap);
                
                // Shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fillRect(x + 5, y + 5, cardWidth, cardHeight);
                
                // Card
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x, y, cardWidth, cardHeight);
                
                // Thumbnail
                this.ctx.fillStyle = game.color;
                this.ctx.fillRect(x, y, cardWidth, 130);
                
                // Icon
                this.ctx.font = '60px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardWidth / 2, y + 85);
                
                // Title
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 20px Poppins';
                this.ctx.fillText(game.name, x + cardWidth / 2, y + 160);
                
                // Subtitle
                this.ctx.fillStyle = '#666';
                this.ctx.font = '14px Poppins';
                this.ctx.fillText('Click to play', x + cardWidth / 2, y + 180);
                
                window.gameCards[index] = {
                    worldX: this.sections.games.x + 150 + col * (cardWidth + gap),
                    y: y,
                    width: cardWidth,
                    height: cardHeight,
                    game: game.name
                };
            });
        }
    }
}

class Character {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height - 230;
        this.frame = 0;
        this.frameCount = 0;
        this.isWalking = false;
        this.facingRight = true;
        this.walkSpeed = 6;
        this.velocity = 0;
        this.waveFrame = 0;
        this.isWaving = true;
        
        this.phrases = [
            "Hi there! 👋",
            "Use Arrow Keys!",
            "Let's explore!",
            "Check out my work!",
            "Move around!",
            "Games to the right!",
            "About me to the left!"
        ];
        
        this.setupControls();
        
        // Wave for 3 seconds at start
        setTimeout(() => {
            this.isWaving = false;
        }, 3000);
    }

    setupControls() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.isWaving = false;
            if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (this.isPointInCharacter(mouseX, mouseY)) {
                this.onCharacterClick();
            }
        });
    }

    isPointInCharacter(x, y) {
        const charScreenX = this.x;
        const charScreenY = this.y;
        return x >= charScreenX - 30 && x <= charScreenX + 30 && 
               y >= charScreenY - 50 && y <= charScreenY;
    }

    onCharacterClick() {
        if (window.achievementSystem) {
            achievementSystem.unlock('first_click');
        }
        if (window.audioManager) {
            audioManager.play('click');
        }
        this.showSpeech(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
        if (this.velocity === 0) {
            this.velocity = -15;
        }
        this.isWaving = true;
        setTimeout(() => {
            this.isWaving = false;
        }, 2000);
    }

    showSpeech(text) {
        const bubble = document.getElementById('speechBubble');
        const speechText = document.getElementById('speechText');
        
        if (!bubble || !speechText) return;
        
        speechText.textContent = text;
        bubble.classList.remove('hidden');
        
        bubble.style.left = this.x + 'px';
        bubble.style.top = (this.y - 80) + 'px';
        
        setTimeout(() => {
            bubble.classList.add('hidden');
        }, 2500);
    }

    update() {
        this.isWalking = false;
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.facingRight = false;
            this.isWalking = true;
            if (window.sceneManager) {
                sceneManager.moveCamera(-this.walkSpeed);
            }
        }
        
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.facingRight = true;
            this.isWalking = true;
            if (window.sceneManager) {
                sceneManager.moveCamera(this.walkSpeed);
            }
        }
        
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && this.velocity === 0) {
            this.velocity = -15;
        }
        
        this.velocity += 0.6;
        this.y += this.velocity;
        
        const groundY = this.canvas.height - 230;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocity = 0;
        }
        
        if (this.isWalking) {
            this.frameCount++;
            if (this.frameCount % 8 === 0) {
                this.frame = (this.frame + 1) % 2;
            }
        } else {
            this.frameCount = 0;
        }
        
        if (this.isWaving) {
            this.waveFrame++;
        }
    }

    draw() {
        this.ctx.save();
        
        const scale = 3;
        const baseX = this.x;
        const baseY = this.y;
        
        if (!this.facingRight) {
            this.ctx.translate(baseX * 2, 0);
            this.ctx.scale(-1, 1);
        }
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.beginPath();
        this.ctx.ellipse(baseX, baseY + 2, 18, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Legs
        const legOffset = this.isWalking ? (this.frame === 0 ? -2 : 2) : 0;
        
        // Left leg (gray pants)
        this.ctx.fillStyle = '#B0B0B0';
        this.ctx.fillRect(baseX - 6 * scale, baseY - 12 * scale, 5 * scale, 10 * scale);
        
        // Right leg
        this.ctx.fillRect(baseX + 1 * scale, baseY - 12 * scale + legOffset, 5 * scale, 10 * scale - Math.abs(legOffset));
        
        // Shoes (black)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(baseX - 7 * scale, baseY - 2 * scale, 6 * scale, 3 * scale);
        this.ctx.fillRect(baseX + 1 * scale, baseY - 2 * scale + legOffset, 6 * scale, 3 * scale);
        
        // Body (blue shirt)
        this.ctx.fillStyle = '#4A90E2';
        this.ctx.fillRect(baseX - 7 * scale, baseY - 22 * scale, 14 * scale, 10 * scale);
        
        // Arms
        this.ctx.fillStyle = '#8B4513';
        
        if (this.isWaving) {
            // Waving arm
            const waveAngle = Math.sin(this.waveFrame * 0.2) * 30;
            this.ctx.save();
            this.ctx.translate(baseX + 7 * scale, baseY - 20 * scale);
            this.ctx.rotate((waveAngle - 45) * Math.PI / 180);
            this.ctx.fillRect(0, 0, 3 * scale, 8 * scale);
            this.ctx.restore();
            
            // Other arm
            this.ctx.fillRect(baseX - 10 * scale, baseY - 20 * scale, 3 * scale, 8 * scale);
        } else {
            const armSwing = this.isWalking ? (this.frame === 0 ? 2 : -2) : 0;
            this.ctx.fillRect(baseX - 10 * scale, baseY - 20 * scale + armSwing, 3 * scale, 8 * scale);
            this.ctx.fillRect(baseX + 7 * scale, baseY - 20 * scale - armSwing, 3 * scale, 8 * scale);
        }
        
        // Neck
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(baseX - 3 * scale, baseY - 24 * scale, 6 * scale, 3 * scale);
        
        // Head (round)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(baseX - 5 * scale, baseY - 30 * scale, 10 * scale, 8 * scale);
        this.ctx.fillRect(baseX - 6 * scale, baseY - 28 * scale, 12 * scale, 6 * scale);
        
        // Hair (black afro)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(baseX - 6 * scale, baseY - 33 * scale, 12 * scale, 5 * scale);
        this.ctx.fillRect(baseX - 7 * scale, baseY - 31 * scale, 14 * scale, 3 * scale);
        
        // Eyes
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(baseX - 4 * scale, baseY - 28 * scale, 3 * scale, 3 * scale);
        this.ctx.fillRect(baseX + 1 * scale, baseY - 28 * scale, 3 * scale, 3 * scale);
        
        // Pupils
        this.ctx.fillStyle = '#000';
        const pupilX = this.facingRight ? 1 : 0;
        this.ctx.fillRect(baseX - 4 * scale + pupilX, baseY - 28 * scale + 1, 2 * scale, 2 * scale);
        this.ctx.fillRect(baseX + 1 * scale + pupilX, baseY - 28 * scale + 1, 2 * scale, 2 * scale);
        
        // Mouth (smile)
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(baseX - 2 * scale, baseY - 24 * scale, scale, scale);
        this.ctx.fillRect(baseX + scale, baseY - 24 * scale, scale, scale);
        
        this.ctx.restore();
    }
}
