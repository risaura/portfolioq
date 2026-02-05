class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.worldWidth = 3000;
        
        this.sections = {
            aboutMe: { x: 0, width: 800, name: 'About Me' },
            center: { x: 800, width: 400, name: 'Home' },
            games: { x: 1200, width: 1800, name: 'Games' }
        };
        
        this.currentSection = 'center';
    }

    moveCamera(dx) {
        this.cameraX += dx;
        this.cameraX = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.cameraX));
        
        const characterWorldX = this.cameraX + 150;
        
        if (characterWorldX < this.sections.aboutMe.x + this.sections.aboutMe.width) {
            if (this.currentSection !== 'aboutMe') {
                this.currentSection = 'aboutMe';
                this.onSectionEnter('aboutMe');
            }
        } else if (characterWorldX < this.sections.center.x + this.sections.center.width) {
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
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#B0E2FF');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sun
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(100 - this.cameraX * 0.1, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(100 - this.cameraX * 0.1, 80, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Clouds
        this.drawCloud(200 - this.cameraX * 0.5, 100, 1);
        this.drawCloud(500 - this.cameraX * 0.5, 80, 0.8);
        this.drawCloud(800 - this.cameraX * 0.5, 120, 1.2);
        this.drawCloud(1200 - this.cameraX * 0.4, 90, 0.9);
        this.drawCloud(1600 - this.cameraX * 0.4, 110, 1.1);
        this.drawCloud(2000 - this.cameraX * 0.3, 85, 1);
    }

    drawCloud(x, y, scale) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 25 * scale, y, 30 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 50 * scale, y, 25 * scale, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGround() {
        const groundY = this.canvas.height - 100;
        
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, groundY, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#7CCD7C';
        for (let i = -this.cameraX % 20; i < this.canvas.width; i += 20) {
            this.ctx.fillRect(i, groundY, 10, 5);
            this.ctx.fillRect(i + 5, groundY + 5, 8, 5);
        }
        
        // Flowers
        for (let i = 0; i < this.worldWidth; i += 150) {
            const flowerX = i - this.cameraX;
            if (flowerX > -50 && flowerX < this.canvas.width + 50) {
                this.drawFlower(flowerX, groundY - 10);
            }
        }
    }

    drawFlower(x, y) {
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + 15);
        this.ctx.stroke();
        
        const colors = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB'];
        const color = colors[Math.floor(x / 150) % colors.length];
        this.ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.arc(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSections() {
        this.ctx.save();
        this.drawAboutMeSection();
        this.drawGamesSection();
        this.ctx.restore();
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width && sectionX < this.canvas.width) {
            const signX = sectionX + 150;
            const signY = 60;
            
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(signX, signY, 500, 60);
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(signX, signY, 500, 60);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 28px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", signX + 250, signY + 40);
            
            const boardX = sectionX + 100;
            const boardY = 150;
            const boardWidth = 600;
            const boardHeight = 320;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            this.ctx.fillRect(boardX, boardY, boardWidth, boardHeight);
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 5;
            this.ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 24px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('About Me', boardX + boardWidth / 2, boardY + 35);
            
            this.ctx.fillStyle = '#333';
            this.ctx.font = '13px Poppins';
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
                this.ctx.fillText(line, boardX + 20, boardY + 70 + i * 16);
            });
            
            const btnX = boardX + boardWidth / 2 - 100;
            const btnY = boardY + boardHeight - 50;
            const btnWidth = 200;
            const btnHeight = 35;
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 14px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📧 Send Me a Message', btnX + btnWidth / 2, btnY + 22);
            
            if (!window.contactButton) {
                window.contactButton = {
                    worldX: this.sections.aboutMe.x + 100 + boardWidth / 2 - 100,
                    y: btnY,
                    width: btnWidth,
                    height: btnHeight
                };
            }
            
            this.ctx.fillStyle = '#666';
            this.ctx.font = 'bold 16px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('→ Move right to see my games! →', sectionX + 400, boardY + boardHeight + 50);
        }
    }

    drawGamesSection() {
        const sectionX = this.sections.games.x - this.cameraX;
        
        if (sectionX > -this.sections.games.width && sectionX < this.canvas.width) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 36px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', sectionX + 400, 100);
            
            const games = [
                { name: 'Flappy Bird', icon: '🐦', color: '#87CEEB' },
                { name: 'Panda', icon: '🐼', color: '#90EE90' },
                { name: 'Pong', icon: '🏓', color: '#FFB6C1' },
                { name: 'Pong 2P', icon: '🏓', color: '#DDA0DD' },
                { name: 'Snake Race', icon: '🐍', color: '#98FB98' }
            ];
            
            const cardWidth = 220;
            const cardHeight = 160;
            const gap = 30;
            const startX = sectionX + 100;
            const startY = 150;
            
            games.forEach((game, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = startX + col * (cardWidth + gap);
                const y = startY + row * (cardHeight + gap);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 4;
                this.ctx.fillRect(x, y, cardWidth, cardHeight);
                this.ctx.shadowBlur = 0;
                
                this.ctx.fillStyle = game.color;
                this.ctx.fillRect(x, y, cardWidth, 100);
                
                this.ctx.font = '48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardWidth / 2, y + 65);
                
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 18px Poppins';
                this.ctx.fillText(game.name, x + cardWidth / 2, y + 130);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '12px Poppins';
                this.ctx.fillText('Click to play', x + cardWidth / 2, y + 150);
                
                if (!window.gameCards) window.gameCards = [];
                window.gameCards[index] = {
                    worldX: this.sections.games.x + 100 + col * (cardWidth + gap),
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
        this.x = 150;
        this.y = canvas.height - 180;
        this.width = 60;
        this.height = 90;
        this.frame = 0;
        this.frameCount = 0;
        this.isWalking = false;
        this.facingRight = true;
        this.walkSpeed = 5;
        this.velocity = 0;
        
        this.minX = 50;
        this.maxX = canvas.width - 50;
        
        this.phrases = [
            "Hi there! 👋",
            "Use Arrow Keys to move!",
            "Let's explore! 🎮",
            "Check out my work!",
            "I love coding! 💻",
            "Move right for games!",
            "Move left for about me!",
            "Keep exploring!"
        ];
        
        this.setupControls();
    }

    setupControls() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
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
        return x >= this.x - 30 && x <= this.x + 30 && y >= this.y - 90 && y <= this.y + 10;
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
            this.velocity = -12;
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
            this.x -= this.walkSpeed;
            this.facingRight = false;
            this.isWalking = true;
            if (window.sceneManager) {
                sceneManager.moveCamera(-this.walkSpeed);
            }
        }
        
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.x += this.walkSpeed;
            this.facingRight = true;
            this.isWalking = true;
            if (window.sceneManager) {
                sceneManager.moveCamera(this.walkSpeed);
            }
        }
        
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && this.velocity === 0) {
            this.velocity = -12;
        }
        
        this.velocity += 0.5;
        this.y += this.velocity;
        
        const groundY = this.canvas.height - 180;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocity = 0;
        }
        
        if (this.isWalking) {
            this.frameCount++;
            if (this.frameCount % 8 === 0) {
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x, this.y + 45, 20, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        const legOffset = this.isWalking ? Math.sin(this.frame * Math.PI / 2) * 5 : 0;
        
        // Legs
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(this.x - 12, this.y + 20, 10, 25);
        this.ctx.fillRect(this.x + 2, this.y + 20 + legOffset, 10, 25 - Math.abs(legOffset));
        
        // Shoes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x - 14, this.y + 43, 14, 6);
        this.ctx.fillRect(this.x + 2, this.y + 43 + legOffset, 14, 6);
        
        // Body
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(this.x - 18, this.y - 10, 36, 30);
        
        // Arms
        const armSwing = this.isWalking ? Math.sin(this.frame * Math.PI / 2) * 8 : 0;
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.x - 25, this.y - 8 + armSwing, 8, 28);
        this.ctx.fillRect(this.x + 17, this.y - 8 - armSwing, 8, 28);
        
        // Neck
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.x - 6, this.y - 18, 12, 8);
        
        // Head
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y - 35, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair (afro)
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y - 38, 20, Math.PI, 0, false);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.x - 16, this.y - 35, 12, 0, Math.PI * 2);
        this.ctx.arc(this.x + 16, this.y - 35, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(this.x - 7, this.y - 37, 4, 0, Math.PI * 2);
        this.ctx.arc(this.x + 7, this.y - 37, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        const pupilOffsetX = this.facingRight ? 1 : -1;
        this.ctx.arc(this.x - 7 + pupilOffsetX, this.y - 37, 2, 0, Math.PI * 2);
        this.ctx.arc(this.x + 7 + pupilOffsetX, this.y - 37, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y - 30, 8, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        
        // Nose
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.x + 2, this.y - 33, 2, 4);
        
        this.ctx.restore();
    }
}
