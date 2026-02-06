class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.worldWidth = 3000;
        this.time = 0;
        this.isNightTime = true; // Start at night like the image
        
        // Toggle day/night every 60 seconds
        setInterval(() => {
            this.isNightTime = !this.isNightTime;
        }, 60000);
        
        this.sections = {
            center: { x: 0, width: 1200, name: 'Home' },
            aboutMe: { x: -1200, width: 1200, name: 'About Me' },
            games: { x: 1200, width: 1800, name: 'Games' }
        };
        
        this.currentSection = 'center';
    }

    moveCamera(dx) {
        this.cameraX += dx;
        this.cameraX = Math.max(-1200, Math.min(1800, this.cameraX));
        
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
        
        // EXACT ROOM LIKE THE IMAGE
        
        // Wall color - dark purple
        const wallColor = '#4a3b5a';
        this.ctx.fillStyle = wallColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Wall paneling - vertical lines
        this.ctx.strokeStyle = '#3a2b4a';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < this.canvas.width; i += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height - 200);
            this.ctx.stroke();
        }
        
        // Horizontal wall trim
        this.ctx.strokeStyle = '#2a1b3a';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 200);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 200);
        this.ctx.stroke();
    }

    drawGround() {
        const floorY = this.canvas.height - 200;
        
        // Wooden floor - orange/brown tones
        const floorGradient = this.ctx.createLinearGradient(0, floorY, 0, this.canvas.height);
        floorGradient.addColorStop(0, '#d4895f');
        floorGradient.addColorStop(0.5, '#c47850');
        floorGradient.addColorStop(1, '#a0613d');
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, floorY, this.canvas.width, 200);
        
        // Wood planks - horizontal
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 200; i += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, floorY + i);
            this.ctx.lineTo(this.canvas.width, floorY + i);
            this.ctx.stroke();
        }
        
        // Vertical plank separations
        for (let i = 0; i < this.canvas.width; i += 150) {
            this.ctx.strokeStyle = 'rgba(100, 50, 20, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i, floorY);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Rug in center
        const rugX = this.canvas.width / 2 - 150;
        const rugY = floorY + 50;
        this.ctx.fillStyle = '#5a7a8a';
        this.ctx.fillRect(rugX, rugY, 300, 80);
        
        // Rug pattern
        this.ctx.strokeStyle = '#4a6a7a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(rugX + 10, rugY + 10, 280, 60);
        this.ctx.strokeRect(rugX + 20, rugY + 20, 260, 40);
    }

    drawRoomElements() {
        const floorY = this.canvas.height - 200;
        
        // WINDOW - Large with night view
        const windowX = this.canvas.width - 400;
        const windowY = 100;
        const windowW = 350;
        const windowH = 450;
        
        // Window frame - dark
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(windowX - 15, windowY - 15, windowW + 30, windowH + 30);
        
        // Window glass - night sky
        const skyGradient = this.ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowH);
        skyGradient.addColorStop(0, '#0a1628');
        skyGradient.addColorStop(0.6, '#1a2a48');
        skyGradient.addColorStop(1, '#2a3a58');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(windowX, windowY, windowW, windowH);
        
        // Moon
        this.ctx.fillStyle = '#e0e0f0';
        this.ctx.beginPath();
        this.ctx.arc(windowX + windowW / 2, windowY + 120, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Moon glow
        this.ctx.fillStyle = 'rgba(224, 224, 240, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(windowX + windowW / 2, windowY + 120, 90, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Stars
        this.ctx.fillStyle = '#ffffff';
        const stars = [
            [50, 50], [120, 80], [200, 40], [280, 70],
            [80, 150], [150, 180], [240, 160], [300, 200],
            [60, 250], [180, 280], [270, 320], [100, 350]
        ];
        stars.forEach(([sx, sy]) => {
            this.ctx.fillRect(windowX + sx, windowY + sy, 3, 3);
            // Twinkle effect
            if (Math.random() > 0.7) {
                this.ctx.fillRect(windowX + sx - 2, windowY + sy, 1, 3);
                this.ctx.fillRect(windowX + sx + 3, windowY + sy, 1, 3);
            }
        });
        
        // Window frame cross
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(windowX + windowW / 2 - 8, windowY, 16, windowH);
        this.ctx.fillRect(windowX, windowY + windowH / 2 - 8, windowW, 16);
        
        // BED - Left side
        const bedX = 80;
        const bedY = floorY - 120;
        
        // Bed frame
        this.ctx.fillStyle = '#5a3a2a';
        this.ctx.fillRect(bedX, bedY + 80, 280, 25);
        this.ctx.fillRect(bedX - 10, bedY + 80, 10, 40);
        this.ctx.fillRect(bedX + 280, bedY + 80, 10, 40);
        
        // Mattress
        this.ctx.fillStyle = '#8a6a5a';
        this.ctx.fillRect(bedX, bedY, 280, 80);
        
        // Sheets with folds
        this.ctx.fillStyle = '#d4a574';
        this.ctx.fillRect(bedX, bedY + 20, 280, 60);
        
        // Sheet highlights
        this.ctx.fillStyle = '#e4b584';
        this.ctx.fillRect(bedX + 20, bedY + 25, 100, 15);
        this.ctx.fillRect(bedX + 150, bedY + 35, 80, 10);
        
        // Pillow
        this.ctx.fillStyle = '#f0e0d0';
        this.ctx.fillRect(bedX + 20, bedY + 10, 100, 40);
        
        // Pillow shading
        this.ctx.fillStyle = '#e0d0c0';
        this.ctx.fillRect(bedX + 20, bedY + 30, 100, 20);
        
        // Blanket draped
        this.ctx.fillStyle = '#7a5a4a';
        this.ctx.fillRect(bedX + 150, bedY + 40, 130, 60);
        
        // DESK - Right side
        const deskX = windowX - 200;
        const deskY = floorY - 100;
        
        // Desk surface
        this.ctx.fillStyle = '#6a4a3a';
        this.ctx.fillRect(deskX, deskY, 180, 15);
        
        // Desk legs
        this.ctx.fillStyle = '#5a3a2a';
        this.ctx.fillRect(deskX + 10, deskY + 15, 15, 100);
        this.ctx.fillRect(deskX + 155, deskY + 15, 15, 100);
        
        // Monitor on desk
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(deskX + 50, deskY - 80, 80, 70);
        
        // Monitor screen (glowing)
        const monitorGlow = this.ctx.createLinearGradient(deskX + 55, deskY - 75, deskX + 125, deskY - 15);
        monitorGlow.addColorStop(0, '#4a6a8a');
        monitorGlow.addColorStop(1, '#2a4a6a');
        this.ctx.fillStyle = monitorGlow;
        this.ctx.fillRect(deskX + 55, deskY - 75, 70, 60);
        
        // Monitor glow on wall
        this.ctx.fillStyle = 'rgba(74, 106, 138, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(deskX + 90, deskY - 45, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Monitor stand
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(deskX + 80, deskY - 10, 20, 10);
        
        // Chair
        const chairX = deskX + 50;
        const chairY = floorY - 80;
        
        this.ctx.fillStyle = '#4a3a5a';
        this.ctx.fillRect(chairX, chairY, 50, 15);
        this.ctx.fillRect(chairX, chairY - 60, 50, 10);
        this.ctx.fillRect(chairX + 20, chairY + 15, 10, 80);
        
        // BOOKSHELF - Far right
        const shelfX = windowX + windowW + 20;
        const shelfY = 150;
        
        if (shelfX < this.canvas.width - 100) {
            this.ctx.fillStyle = '#5a3a2a';
            this.ctx.fillRect(shelfX, shelfY, 80, 300);
            
            // Shelves
            for (let i = 0; i < 5; i++) {
                this.ctx.fillStyle = '#4a2a1a';
                this.ctx.fillRect(shelfX, shelfY + i * 60, 80, 8);
                
                // Books
                const colors = ['#8a4a3a', '#4a6a5a', '#6a5a7a', '#7a6a4a'];
                for (let j = 0; j < 3; j++) {
                    this.ctx.fillStyle = colors[Math.floor((i + j) % colors.length)];
                    this.ctx.fillRect(shelfX + 5 + j * 25, shelfY + i * 60 + 10, 20, 45);
                }
            }
        }
        
        // POSTERS on wall
        const posterY = 200;
        
        // Poster 1
        this.ctx.fillStyle = '#6a4a5a';
        this.ctx.fillRect(100, posterY, 80, 100);
        this.ctx.strokeStyle = '#2a1a2a';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(100, posterY, 80, 100);
        
        // Poster design
        this.ctx.fillStyle = '#aa6a8a';
        this.ctx.beginPath();
        this.ctx.arc(140, posterY + 50, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // LAMP with warm glow
        const lampX = bedX + 290;
        const lampY = floorY - 140;
        
        // Lamp base
        this.ctx.fillStyle = '#3a2a1a';
        this.ctx.fillRect(lampX, lampY + 40, 30, 10);
        
        // Lamp pole
        this.ctx.fillStyle = '#4a3a2a';
        this.ctx.fillRect(lampX + 13, lampY, 4, 40);
        
        // Lamp shade
        this.ctx.fillStyle = '#8a6a4a';
        this.ctx.beginPath();
        this.ctx.moveTo(lampX + 5, lampY);
        this.ctx.lineTo(lampX, lampY - 30);
        this.ctx.lineTo(lampX + 30, lampY - 30);
        this.ctx.lineTo(lampX + 25, lampY);
        this.ctx.fill();
        
        // Warm lamp glow
        this.ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(lampX + 15, lampY - 15, 80, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSections() {
        this.ctx.save();
        
        // Floating info panel
        this.drawFloatingSign();
        
        this.drawCenterSection();
        this.drawAboutMeSection();
        this.drawGamesSection();
        this.ctx.restore();
    }

    drawFloatingSign() {
        // Wooden sign at top - drops down
        const signX = this.canvas.width / 2 - 200;
        const signY = 20;
        const dropY = Math.min(this.time * 100, 20);
        
        // Rope
        this.ctx.strokeStyle = '#8B7355';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(signX + 100, 0);
        this.ctx.lineTo(signX + 100, dropY);
        this.ctx.moveTo(signX + 300, 0);
        this.ctx.lineTo(signX + 300, dropY);
        this.ctx.stroke();
        
        // 3D wooden board effect
        this.ctx.fillStyle = '#5a3a1a';
        this.ctx.fillRect(signX + 5, dropY + 5, 400, 70);
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(signX, dropY, 400, 70);
        
        // Wood grain
        this.ctx.strokeStyle = '#6B3513';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(signX, dropY + i * 15);
            this.ctx.lineTo(signX + 400, dropY + i * 15);
            this.ctx.stroke();
        }
        
        // Border
        this.ctx.strokeStyle = '#4a2a0a';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(signX, dropY, 400, 70);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText("Mayowa's Room", signX + 200, dropY + 35);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Poppins';
        this.ctx.fillText("← About Me | Games →", signX + 200, dropY + 55);
        this.ctx.shadowBlur = 0;
    }

    drawCenterSection() {
        // Character alone - no panels
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width && sectionX < this.canvas.width) {
            const panelW = 700;
            const panelH = this.canvas.height - 280;
            const panelX = this.canvas.width / 2 - panelW / 2;
            const panelY = 120;
            
            // 3D shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(panelX + 8, panelY + 8, panelW, panelH);
            
            // White panel
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(panelX, panelY, panelW, panelH);
            
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(panelX, panelY, panelW, panelH);
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 32px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", panelX + panelW / 2, panelY + 45);
            
            this.ctx.font = 'bold 22px Poppins';
            this.ctx.fillText('About Me', panelX + panelW / 2, panelY + 80);
            
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
                this.ctx.fillText(line, panelX + 30, panelY + 115 + i * 23);
            });
            
            const btnX = panelX + panelW / 2 - 120;
            const btnY = panelY + panelH - 55;
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(btnX, btnY, 240, 45);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 16px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('📧 Send Me a Message', btnX + 120, btnY + 28);
            
            window.contactButton = { x: btnX, y: btnY, width: 240, height: 45 };
        }
    }

    drawGamesSection() {
        const sectionX = this.sections.games.x - this.cameraX;
        
        if (sectionX > -this.sections.games.width && sectionX < this.canvas.width) {
            const panelW = 900;
            const panelH = this.canvas.height - 280;
            const panelX = this.canvas.width / 2 - panelW / 2;
            const panelY = 120;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(panelX + 8, panelY + 8, panelW, panelH);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(panelX, panelY, panelW, panelH);
            
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(panelX, panelY, panelW, panelH);
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 36px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', panelX + panelW / 2, panelY + 50);
            
            const games = [
                { name: 'Flappy Bird', icon: '🐦', color: '#87CEEB' },
                { name: 'Panda', icon: '🐼', color: '#90EE90' },
                { name: 'Pong', icon: '🏓', color: '#FFB6C1' },
                { name: 'Pong 2P', icon: '🏓', color: '#DDA0DD' },
                { name: 'Snake Race', icon: '🐍', color: '#98FB98' }
            ];
            
            window.gameCards = [];
            
            const cardW = 230;
            const cardH = 180;
            const gap = 35;
            const startX = panelX + 60;
            const startY = panelY + 100;
            
            games.forEach((game, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = startX + col * (cardW + gap);
                const y = startY + row * (cardH + gap);
                
                this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
                this.ctx.fillRect(x + 4, y + 4, cardW, cardH);
                
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.fillRect(x, y, cardW, cardH);
                
                this.ctx.fillStyle = game.color;
                this.ctx.fillRect(x, y, cardW, 120);
                
                this.ctx.font = '60px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardW / 2, y + 75);
                
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 18px Poppins';
                this.ctx.fillText(game.name, x + cardW / 2, y + 145);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '14px Poppins';
                this.ctx.fillText('Click to play', x + cardW / 2, y + 165);
                
                this.ctx.strokeStyle = '#ddd';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, cardW, cardH);
                
                window.gameCards[i] = { x, y, width: cardW, height: cardH, game: game.name };
            });
        }
    }
}

class Character {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 2 - 200;
        this.y = canvas.height - 250;
        
        // Character doesn't move on its own
        this.isIdle = true;
        
        this.phrases = [
            "Welcome to my room! 🏠",
            "Explore my portfolio!",
            "Check out the games!",
            "Read about me!"
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
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            if (this.isPointInCharacter(mouseX, mouseY)) {
                this.onCharacterClick();
            }
        });
    }

    isPointInCharacter(x, y) {
        return x >= this.x - 40 && x <= this.x + 40 && 
               y >= this.y - 120 && y <= this.y;
    }

    onCharacterClick() {
        if (window.achievementSystem) {
            achievementSystem.unlock('first_click');
        }
        if (window.audioManager) {
            audioManager.play('click');
        }
        this.showSpeech(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
    }

    showSpeech(text) {
        const bubble = document.getElementById('speechBubble');
        const speechText = document.getElementById('speechText');
        
        if (!bubble || !speechText) return;
        
        speechText.textContent = text;
        bubble.classList.remove('hidden');
        
        bubble.style.left = this.x + 'px';
        bubble.style.top = (this.y - 150) + 'px';
        
        setTimeout(() => {
            bubble.classList.add('hidden');
        }, 2500);
    }

    update() {
        // Character stays still - only camera moves
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            if (window.sceneManager) {
                sceneManager.moveCamera(-6);
            }
        }
        
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            if (window.sceneManager) {
                sceneManager.moveCamera(6);
            }
        }
    }

    draw() {
        this.ctx.save();
        
        const x = this.x;
        const y = this.y;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 5, 30, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // STANDING STILL - Detailed character
        
        // Legs
        this.ctx.fillStyle = '#4A90E2';
        this.ctx.fillRect(x - 15, y - 60, 12, 55);
        this.ctx.fillRect(x + 3, y - 60, 12, 55);
        
        // Shoes
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(x - 18, y - 5, 15, 8);
        this.ctx.fillRect(x + 3, y - 5, 15, 8);
        
        // Torso
        this.ctx.fillStyle = '#2E5090';
        this.ctx.fillRect(x - 22, y - 110, 44, 50);
        
        // Arms
        this.ctx.fillRect(x - 32, y - 105, 10, 40);
        this.ctx.fillRect(x + 22, y - 105, 10, 40);
        
        // Hands
        this.ctx.fillStyle = '#C49A6C';
        this.ctx.fillRect(x - 32, y - 68, 10, 12);
        this.ctx.fillRect(x + 22, y - 68, 10, 12);
        
        // Neck
        this.ctx.fillRect(x - 10, y - 115, 20, 10);
        
        // Head
        this.ctx.fillStyle = '#8B5A3C';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 128, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 133, 24, Math.PI, 0);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - 20, y - 128, 16, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y - 128, 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(x - 7, y - 130, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 7, y - 130, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x - 7, y - 130, 2, 0, Math.PI * 2);
        this.ctx.arc(x + 7, y - 130, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 120, 8, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
}
