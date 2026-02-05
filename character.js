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
        
        // Realistic sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0D4E3');
        gradient.addColorStop(0.8, '#E8F4F8');
        gradient.addColorStop(1, '#F0F8FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Realistic sun
        const sunX = 150 - this.cameraX * 0.05;
        const sunY = 100;
        
        // Sun glow
        const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 100);
        sunGlow.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
        sunGlow.addColorStop(0.5, 'rgba(255, 255, 150, 0.1)');
        sunGlow.addColorStop(1, 'rgba(255, 255, 100, 0)');
        this.ctx.fillStyle = sunGlow;
        this.ctx.fillRect(sunX - 100, sunY - 100, 200, 200);
        
        // Sun core
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
        sunGradient.addColorStop(0, '#FFF8DC');
        sunGradient.addColorStop(0.7, '#FFD700');
        sunGradient.addColorStop(1, '#FFA500');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Realistic clouds with depth
        this.drawRealisticCloud(300 - this.cameraX * 0.3, 120, 1.2, 0.9);
        this.drawRealisticCloud(600 - this.cameraX * 0.4, 90, 1, 1);
        this.drawRealisticCloud(900 - this.cameraX * 0.35, 140, 0.8, 0.85);
        this.drawRealisticCloud(1400 - this.cameraX * 0.3, 100, 1.1, 0.95);
        this.drawRealisticCloud(2000 - this.cameraX * 0.25, 130, 0.9, 0.8);
    }

    drawRealisticCloud(x, y, scale, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        
        const gradient = this.ctx.createRadialGradient(x + 30 * scale, y - 10 * scale, 0, x + 30 * scale, y, 60 * scale);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(240, 240, 240, 0.9)');
        gradient.addColorStop(1, 'rgba(220, 220, 220, 0.7)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 35 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 40 * scale, y - 5 * scale, 45 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 80 * scale, y, 35 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 50 * scale, y + 15 * scale, 30 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawGround() {
        const groundY = this.canvas.height - 150;
        
        // Ground gradient
        const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#8FBC8F');
        groundGradient.addColorStop(0.3, '#7CB97C');
        groundGradient.addColorStop(0.7, '#6B9B6B');
        groundGradient.addColorStop(1, '#5A8A5A');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, 150);
        
        // Grass texture
        this.ctx.fillStyle = 'rgba(76, 153, 76, 0.3)';
        for (let i = -this.cameraX % 15; i < this.canvas.width; i += 15) {
            for (let j = 0; j < 10; j++) {
                const grassX = i + (Math.random() - 0.5) * 10;
                const grassY = groundY + j * 15;
                this.ctx.fillRect(grassX, grassY, 2, 8);
                this.ctx.fillRect(grassX + 3, grassY - 2, 2, 6);
            }
        }
        
        // Animated flowers
        for (let i = -1200; i < this.worldWidth; i += 180) {
            const flowerX = i - this.cameraX;
            if (flowerX > -100 && flowerX < this.canvas.width + 100) {
                this.drawAnimatedFlower(flowerX, groundY - 5, i);
            }
        }
    }

    drawAnimatedFlower(x, y, seed) {
        const sway = Math.sin(this.time * 2 + seed * 0.1) * 3;
        
        // Stem
        this.ctx.strokeStyle = '#2D5016';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.quadraticCurveTo(x + sway, y - 15, x + sway, y - 25);
        this.ctx.stroke();
        
        // Petals
        const colors = [
            ['#FF1493', '#FF69B4'],
            ['#FFD700', '#FFA500'],
            ['#FF4500', '#FF6347'],
            ['#9370DB', '#BA55D3']
        ];
        const colorSet = colors[Math.floor(seed / 180) % colors.length];
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.time * 0.5;
            const petalX = x + sway + Math.cos(angle) * 8;
            const petalY = y - 25 + Math.sin(angle) * 8;
            
            const gradient = this.ctx.createRadialGradient(petalX, petalY, 0, petalX, petalY, 6);
            gradient.addColorStop(0, colorSet[0]);
            gradient.addColorStop(1, colorSet[1]);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(petalX, petalY, 6, 4, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Center
        const centerGradient = this.ctx.createRadialGradient(x + sway, y - 25, 0, x + sway, y - 25, 4);
        centerGradient.addColorStop(0, '#FFD700');
        centerGradient.addColorStop(1, '#FFA500');
        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x + sway, y - 25, 4, 0, Math.PI * 2);
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
            // Welcome message
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(sectionX + this.canvas.width / 2 - 300, 100, 600, 80);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 36px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Portfolio", sectionX + this.canvas.width / 2, 140);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '18px Poppins';
            this.ctx.fillText("← Move Left for About Me | Move Right for Games →", sectionX + this.canvas.width / 2, 165);
        }
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width && sectionX < this.canvas.width) {
            const boardX = sectionX + 100;
            const boardY = 80;
            const boardWidth = Math.min(700, this.canvas.width - 200);
            const boardHeight = this.canvas.height - 250;
            
            // Board shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(boardX + 5, boardY + 5, boardWidth, boardHeight);
            
            // Board background
            const boardGradient = this.ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardHeight);
            boardGradient.addColorStop(0, '#FFFFFF');
            boardGradient.addColorStop(1, '#F5F5F5');
            this.ctx.fillStyle = boardGradient;
            this.ctx.fillRect(boardX, boardY, boardWidth, boardHeight);
            
            // Border
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);
            
            // Title
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 32px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", boardX + boardWidth / 2, boardY + 50);
            
            this.ctx.font = 'bold 24px Poppins';
            this.ctx.fillText('About Me', boardX + boardWidth / 2, boardY + 90);
            
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
                this.ctx.fillText(line, boardX + 30, boardY + 130 + i * 22);
            });
            
            // Contact button with gradient
            const btnX = boardX + boardWidth / 2 - 120;
            const btnY = boardY + boardHeight - 60;
            const btnWidth = 240;
            const btnHeight = 45;
            
            const btnGradient = this.ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
            btnGradient.addColorStop(0, '#667eea');
            btnGradient.addColorStop(1, '#764ba2');
            this.ctx.fillStyle = btnGradient;
            this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📧 Send Me a Message', btnX + btnWidth / 2, btnY + 28);
            
            if (!window.contactButton) {
                window.contactButton = {
                    worldX: this.sections.aboutMe.x + 100 + boardWidth / 2 - 120,
                    y: btnY,
                    width: btnWidth,
                    height: btnHeight
                };
            }
        }
    }

    drawGamesSection() {
        const sectionX = this.sections.games.x - this.cameraX;
        
        if (sectionX > -this.sections.games.width && sectionX < this.canvas.width) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 48px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', sectionX + this.canvas.width / 2, 100);
            
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
            const startY = 150;
            
            games.forEach((game, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = startX + col * (cardWidth + gap);
                const y = startY + row * (cardHeight + gap);
                
                // Card shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(x + 4, y + 4, cardWidth, cardHeight);
                
                // Card background
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x, y, cardWidth, cardHeight);
                
                // Thumbnail with gradient
                const thumbGradient = this.ctx.createLinearGradient(x, y, x, y + 130);
                thumbGradient.addColorStop(0, game.color);
                thumbGradient.addColorStop(1, this.adjustColor(game.color, -30));
                this.ctx.fillStyle = thumbGradient;
                this.ctx.fillRect(x, y, cardWidth, 130);
                
                // Icon
                this.ctx.font = '60px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardWidth / 2, y + 85);
                
                // Title
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 20px Poppins';
                this.ctx.fillText(game.name, x + cardWidth / 2, y + 160);
                
                // Play hint
                this.ctx.fillStyle = '#666';
                this.ctx.font = '14px Poppins';
                this.ctx.fillText('Click to play', x + cardWidth / 2, y + 180);
                
                if (!window.gameCards) window.gameCards = [];
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

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
}

class Character {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height - 180;
        this.width = 48;
        this.height = 64;
        this.frame = 0;
        this.frameCount = 0;
        this.isWalking = false;
        this.facingRight = true;
        this.walkSpeed = 6;
        this.velocity = 0;
        
        this.phrases = [
            "Hi there! 👋",
            "Use Arrow Keys!",
            "Let's explore! 🎮",
            "Check out my work!",
            "Move around!",
            "Games to the right!",
            "About me to the left!",
            "Keep exploring!"
        ];
        
        this.setupControls();
    }

    setupControls() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            if (this.isPointInCharacter(mouseX, mouseY)) {
                this.onCharacterClick();
            }
        });
    }

    isPointInCharacter(x, y) {
        return x >= this.x - this.width / 2 && x <= this.x + this.width / 2 && 
               y >= this.y - this.height && y <= this.y;
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
    }

    showSpeech(text) {
        const bubble = document.getElementById('speechBubble');
        const speechText = document.getElementById('speechText');
        
        if (!bubble || !speechText) return;
        
        speechText.textContent = text;
        bubble.classList.remove('hidden');
        
        const canvasRect = this.canvas.getBoundingClientRect();
        bubble.style.left = (canvasRect.left + (this.x / this.canvas.width) * canvasRect.width - 60) + 'px';
        bubble.style.top = (canvasRect.top + (this.y / this.canvas.height) * canvasRect.height - 120) + 'px';
        
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
        
        const groundY = this.canvas.height - 180;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocity = 0;
        }
        
        if (this.isWalking) {
            this.frameCount++;
            if (this.frameCount % 6 === 0) {
                this.frame = (this.frame + 1) % 4;
            }
        } else {
            this.frame = 0;
            this.frameCount = 0;
        }
    }

    draw() {
        this.ctx.save();
        
        if (!this.facingRight) {
            this.ctx.translate(this.x * 2, 0);
            this.ctx.scale(-1, 1);
        }
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x, this.y + 2, 18, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pixel art style character
        const px = 4; // Pixel size
        const legMove = this.isWalking ? Math.sin(this.frame * Math.PI / 2) * 2 : 0;
        
        // Legs (dark blue pants)
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(this.x - 6*px, this.y - 4*px, 3*px, 4*px); // Left leg
        this.ctx.fillRect(this.x + 3*px, this.y - 4*px + legMove, 3*px, 4*px); // Right leg
        
        // Shoes (black)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x - 7*px, this.y - px, 4*px, px);
        this.ctx.fillRect(this.x + 3*px, this.y - px + legMove, 4*px, px);
        
        // Body (blue shirt)
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(this.x - 6*px, this.y - 10*px, 12*px, 6*px);
        
        // Arms
        const armSwing = this.isWalking ? Math.sin(this.frame * Math.PI / 2) * px : 0;
        this.ctx.fillStyle = '#8B4513'; // Skin tone
        this.ctx.fillRect(this.x - 8*px, this.y - 9*px + armSwing, 2*px, 5*px); // Left arm
        this.ctx.fillRect(this.x + 6*px, this.y - 9*px - armSwing, 2*px, 5*px); // Right arm
        
        // Neck
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.x - 2*px, this.y - 11*px, 4*px, 2*px);
        
        // Head (round)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.x - 4*px, this.y - 15*px, 8*px, 6*px);
        this.ctx.fillRect(this.x - 5*px, this.y - 14*px, 10*px, 4*px);
        
        // Hair (afro - black)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x - 5*px, this.y - 17*px, 10*px, 4*px);
        this.ctx.fillRect(this.x - 6*px, this.y - 16*px, 12*px, 3*px);
        this.ctx.fillRect(this.x - 6*px, this.y - 15*px, 2*px, 2*px);
        this.ctx.fillRect(this.x + 4*px, this.y - 15*px, 2*px, 2*px);
        
        // Eyes (white with black pupils)
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.x - 3*px, this.y - 14*px, 2*px, 2*px);
        this.ctx.fillRect(this.x + px, this.y - 14*px, 2*px, 2*px);
        
        this.ctx.fillStyle = '#000';
        const pupilDir = this.facingRight ? 1 : 0;
        this.ctx.fillRect(this.x - 3*px + pupilDir, this.y - 14*px, px, px);
        this.ctx.fillRect(this.x + px + pupilDir, this.y - 14*px, px, px);
        
        // Smile
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x - 2*px, this.y - 11*px, px, px);
        this.ctx.fillRect(this.x + px, this.y - 11*px, px, px);
        
        this.ctx.restore();
    }
}
