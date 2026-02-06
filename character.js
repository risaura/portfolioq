class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.targetCameraX = 0;
        this.worldWidth = 3000;
        this.time = 0;
        this.isNightTime = true;
        this.nightTransition = 1.0;
        
        // Smooth day/night transition
        this.dayNightCycle();
        
        this.sections = {
            center: { x: 0, width: 1200, name: 'Home' },
            aboutMe: { x: -1200, width: 1200, name: 'About Me' },
            games: { x: 1200, width: 1800, name: 'Games' }
        };
        
        this.currentSection = 'center';
        this.floatingSignY = -100;
        this.targetSignY = 20;
        
        // Particle system for ambiance
        this.particles = [];
        this.initParticles();
    }

    dayNightCycle() {
        setInterval(() => {
            this.isNightTime = !this.isNightTime;
            this.animateDayNightTransition();
        }, 60000);
    }

    animateDayNightTransition() {
        const duration = 3000;
        const startTime = Date.now();
        const startValue = this.nightTransition;
        const endValue = this.isNightTime ? 1.0 : 0.0;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.nightTransition = startValue + (endValue - startValue) * this.easeInOutCubic(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    initParticles() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            p.opacity = 0.3 + Math.sin(this.time * 2 + p.x * 0.01) * 0.2;
        });
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * this.nightTransition * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    moveCamera(dx) {
        this.targetCameraX += dx;
        this.targetCameraX = Math.max(-1200, Math.min(1800, this.targetCameraX));
        
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

    updateCamera() {
        // Smooth camera following with easing
        const diff = this.targetCameraX - this.cameraX;
        this.cameraX += diff * 0.15;
    }

    onSectionEnter(section) {
        console.log('Entered section:', section);
        const indicator = document.getElementById('sectionIndicator');
        if (indicator) {
            indicator.textContent = this.sections[section].name;
            indicator.classList.remove('hidden');
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    update() {
        this.time += 0.016;
        this.updateCamera();
        this.updateParticles();
        
        // Animate floating sign drop
        if (this.floatingSignY < this.targetSignY) {
            this.floatingSignY += (this.targetSignY - this.floatingSignY) * 0.1;
        }
    }

    drawBackground() {
        // Wall color with smooth day/night transition
        const dayWallColor = '#e8dcc8';
        const nightWallColor = '#4a3b5a';
        
        const wallColor = this.lerpColor(dayWallColor, nightWallColor, this.nightTransition);
        this.ctx.fillStyle = wallColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Wall paneling
        this.ctx.strokeStyle = this.lerpColor('#d8cca8', '#3a2b4a', this.nightTransition);
        this.ctx.lineWidth = 3;
        for (let i = 0; i < this.canvas.width; i += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height - 200);
            this.ctx.stroke();
        }
        
        // Horizontal trim
        this.ctx.strokeStyle = this.lerpColor('#c8bca8', '#2a1b3a', this.nightTransition);
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 200);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 200);
        this.ctx.stroke();
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    drawGround() {
        const floorY = this.canvas.height - 200;
        
        // Wooden floor
        const floorGradient = this.ctx.createLinearGradient(0, floorY, 0, this.canvas.height);
        floorGradient.addColorStop(0, '#d4895f');
        floorGradient.addColorStop(0.5, '#c47850');
        floorGradient.addColorStop(1, '#a0613d');
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, floorY, this.canvas.width, 200);
        
        // Wood planks
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 200; i += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, floorY + i);
            this.ctx.lineTo(this.canvas.width, floorY + i);
            this.ctx.stroke();
        }
        
        // Vertical separations
        for (let i = 0; i < this.canvas.width; i += 150) {
            this.ctx.strokeStyle = 'rgba(100, 50, 20, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i, floorY);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Rug with subtle animation
        const rugX = this.canvas.width / 2 - 150;
        const rugY = floorY + 50;
        const rugWave = Math.sin(this.time * 0.5) * 2;
        
        this.ctx.fillStyle = '#5a7a8a';
        this.ctx.fillRect(rugX, rugY + rugWave, 300, 80);
        
        // Rug pattern
        this.ctx.strokeStyle = '#4a6a7a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(rugX + 10, rugY + 10 + rugWave, 280, 60);
        this.ctx.strokeRect(rugX + 20, rugY + 20 + rugWave, 260, 40);
    }

    drawRoomElements() {
        const floorY = this.canvas.height - 200;
        
        // WINDOW with smooth transitions
        this.drawWindow(floorY);
        
        // BED
        this.drawBed(floorY);
        
        // DESK with glowing monitor
        this.drawDesk(floorY);
        
        // BOOKSHELF
        this.drawBookshelf();
        
        // POSTERS
        this.drawPosters();
        
        // LAMP with animated glow
        this.drawLamp(floorY);
        
        // Floating particles for ambiance
        this.drawParticles();
    }

    drawWindow(floorY) {
        const windowX = this.canvas.width - 400;
        const windowY = 100;
        const windowW = 350;
        const windowH = 450;
        
        // Frame
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(windowX - 15, windowY - 15, windowW + 30, windowH + 30);
        
        // Sky
        if (this.nightTransition > 0.5) {
            // Night sky
            const skyGradient = this.ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowH);
            skyGradient.addColorStop(0, '#0a1628');
            skyGradient.addColorStop(0.6, '#1a2a48');
            skyGradient.addColorStop(1, '#2a3a58');
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(windowX, windowY, windowW, windowH);
            
            // Moon
            const moonGlow = 0.8 + Math.sin(this.time * 0.5) * 0.2;
            this.ctx.fillStyle = `rgba(224, 224, 240, ${moonGlow})`;
            this.ctx.beginPath();
            this.ctx.arc(windowX + windowW / 2, windowY + 120, 90, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#e0e0f0';
            this.ctx.beginPath();
            this.ctx.arc(windowX + windowW / 2, windowY + 120, 60, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Stars with twinkling
            this.ctx.fillStyle = '#ffffff';
            const stars = [
                [50, 50, 1], [120, 80, 0.8], [200, 40, 1.2], [280, 70, 0.9],
                [80, 150, 1], [150, 180, 0.7], [240, 160, 1.1], [300, 200, 0.8],
                [60, 250, 0.9], [180, 280, 1], [270, 320, 0.8], [100, 350, 1.2]
            ];
            
            stars.forEach(([sx, sy, twinkle]) => {
                const brightness = 0.5 + Math.sin(this.time * twinkle * 2 + sx) * 0.5;
                this.ctx.globalAlpha = brightness;
                this.ctx.fillRect(windowX + sx, windowY + sy, 3, 3);
            });
            this.ctx.globalAlpha = 1;
        } else {
            // Day sky
            const skyGradient = this.ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowH);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#B0E2FF');
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(windowX, windowY, windowW, windowH);
            
            // Sun
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(windowX + 80, windowY + 100, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Window frame cross
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(windowX + windowW / 2 - 8, windowY, 16, windowH);
        this.ctx.fillRect(windowX, windowY + windowH / 2 - 8, windowW, 16);
    }

    drawBed(floorY) {
        const bedX = 80;
        const bedY = floorY - 120;
        
        // Frame
        this.ctx.fillStyle = '#5a3a2a';
        this.ctx.fillRect(bedX, bedY + 80, 280, 25);
        this.ctx.fillRect(bedX - 10, bedY + 80, 10, 40);
        this.ctx.fillRect(bedX + 280, bedY + 80, 10, 40);
        
        // Mattress
        this.ctx.fillStyle = '#8a6a5a';
        this.ctx.fillRect(bedX, bedY, 280, 80);
        
        // Sheets
        this.ctx.fillStyle = '#d4a574';
        this.ctx.fillRect(bedX, bedY + 20, 280, 60);
        
        // Sheet highlights
        this.ctx.fillStyle = '#e4b584';
        this.ctx.fillRect(bedX + 20, bedY + 25, 100, 15);
        this.ctx.fillRect(bedX + 150, bedY + 35, 80, 10);
        
        // Pillow
        this.ctx.fillStyle = '#f0e0d0';
        this.ctx.fillRect(bedX + 20, bedY + 10, 100, 40);
        this.ctx.fillStyle = '#e0d0c0';
        this.ctx.fillRect(bedX + 20, bedY + 30, 100, 20);
        
        // Blanket
        this.ctx.fillStyle = '#7a5a4a';
        this.ctx.fillRect(bedX + 150, bedY + 40, 130, 60);
    }

    drawDesk(floorY) {
        const deskX = this.canvas.width - 600;
        const deskY = floorY - 100;
        
        // Desk surface
        this.ctx.fillStyle = '#6a4a3a';
        this.ctx.fillRect(deskX, deskY, 180, 15);
        
        // Legs
        this.ctx.fillStyle = '#5a3a2a';
        this.ctx.fillRect(deskX + 10, deskY + 15, 15, 100);
        this.ctx.fillRect(deskX + 155, deskY + 15, 15, 100);
        
        // Monitor
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(deskX + 50, deskY - 80, 80, 70);
        
        // Animated monitor screen
        const screenPulse = 0.8 + Math.sin(this.time * 1) * 0.2;
        const monitorGlow = this.ctx.createLinearGradient(deskX + 55, deskY - 75, deskX + 125, deskY - 15);
        monitorGlow.addColorStop(0, `rgba(74, 106, 138, ${screenPulse})`);
        monitorGlow.addColorStop(1, `rgba(42, 74, 106, ${screenPulse})`);
        this.ctx.fillStyle = monitorGlow;
        this.ctx.fillRect(deskX + 55, deskY - 75, 70, 60);
        
        // Monitor glow on wall
        this.ctx.fillStyle = `rgba(74, 106, 138, ${0.2 * screenPulse})`;
        this.ctx.beginPath();
        this.ctx.arc(deskX + 90, deskY - 45, 80, 0, Math.PI * 2);
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
    }

    drawBookshelf() {
        const shelfX = this.canvas.width - 100;
        const shelfY = 150;
        
        if (shelfX > this.canvas.width - 120) return;
        
        this.ctx.fillStyle = '#5a3a2a';
        this.ctx.fillRect(shelfX, shelfY, 80, 300);
        
        // Shelves with books
        for (let i = 0; i < 5; i++) {
            this.ctx.fillStyle = '#4a2a1a';
            this.ctx.fillRect(shelfX, shelfY + i * 60, 80, 8);
            
            const colors = ['#8a4a3a', '#4a6a5a', '#6a5a7a', '#7a6a4a'];
            for (let j = 0; j < 3; j++) {
                this.ctx.fillStyle = colors[Math.floor((i + j) % colors.length)];
                this.ctx.fillRect(shelfX + 5 + j * 25, shelfY + i * 60 + 10, 20, 45);
            }
        }
    }

    drawPosters() {
        const posterY = 200;
        
        this.ctx.fillStyle = '#6a4a5a';
        this.ctx.fillRect(100, posterY, 80, 100);
        this.ctx.strokeStyle = '#2a1a2a';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(100, posterY, 80, 100);
        
        this.ctx.fillStyle = '#aa6a8a';
        this.ctx.beginPath();
        this.ctx.arc(140, posterY + 50, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLamp(floorY) {
        const lampX = 400;
        const lampY = floorY - 140;
        
        // Base
        this.ctx.fillStyle = '#3a2a1a';
        this.ctx.fillRect(lampX, lampY + 40, 30, 10);
        
        // Pole
        this.ctx.fillStyle = '#4a3a2a';
        this.ctx.fillRect(lampX + 13, lampY, 4, 40);
        
        // Shade
        this.ctx.fillStyle = '#8a6a4a';
        this.ctx.beginPath();
        this.ctx.moveTo(lampX + 5, lampY);
        this.ctx.lineTo(lampX, lampY - 30);
        this.ctx.lineTo(lampX + 30, lampY - 30);
        this.ctx.lineTo(lampX + 25, lampY);
        this.ctx.fill();
        
        // Animated warm glow
        const glowIntensity = 0.2 + Math.sin(this.time * 0.8) * 0.1;
        this.ctx.fillStyle = `rgba(255, 200, 100, ${glowIntensity})`;
        this.ctx.beginPath();
        this.ctx.arc(lampX + 15, lampY - 15, 100, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSections() {
        this.ctx.save();
        
        this.drawFloatingSign();
        this.drawCenterSection();
        this.drawAboutMeSection();
        this.drawGamesSection();
        
        this.ctx.restore();
    }

    drawFloatingSign() {
        const signX = this.canvas.width / 2 - 200;
        const signY = this.floatingSignY;
        
        // Animated ropes
        this.ctx.strokeStyle = '#8B7355';
        this.ctx.lineWidth = 3;
        const ropeSwing1 = Math.sin(this.time * 2) * 2;
        const ropeSwing2 = Math.sin(this.time * 2 + Math.PI) * 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(signX + 100, 0);
        this.ctx.quadraticCurveTo(signX + 100 + ropeSwing1, signY / 2, signX + 100, signY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(signX + 300, 0);
        this.ctx.quadraticCurveTo(signX + 300 + ropeSwing2, signY / 2, signX + 300, signY);
        this.ctx.stroke();
        
        // 3D shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(signX + 8, signY + 8, 400, 70);
        
        // Wooden board
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(signX, signY, 400, 70);
        
        // Wood grain
        this.ctx.strokeStyle = '#6B3513';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(signX, signY + i * 15);
            this.ctx.lineTo(signX + 400, signY + i * 15);
            this.ctx.stroke();
        }
        
        // Border
        this.ctx.strokeStyle = '#4a2a0a';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(signX, signY, 400, 70);
        
        // Text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText("Mayowa's Room", signX + 200, signY + 35);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Poppins';
        this.ctx.fillText("← About Me | Games →", signX + 200, signY + 55);
        this.ctx.shadowBlur = 0;
    }

    drawCenterSection() {
        // Empty - just character
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width && sectionX < this.canvas.width) {
            const panelW = 700;
            const panelH = this.canvas.height - 280;
            const panelX = this.canvas.width / 2 - panelW / 2;
            const panelY = 120;
            
            // Smooth slide-in animation
            const slideProgress = Math.min(1, (this.cameraX + 1200) / 300);
            const currentPanelX = panelX - (1 - slideProgress) * 100;
            
            // 3D shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(currentPanelX + 8, panelY + 8, panelW, panelH);
            
            // White panel
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(currentPanelX, panelY, panelW, panelH);
            
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(currentPanelX, panelY, panelW, panelH);
            
            // Title
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 32px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", currentPanelX + panelW / 2, panelY + 45);
            
            this.ctx.font = 'bold 22px Poppins';
            this.ctx.fillText('About Me', currentPanelX + panelW / 2, panelY + 80);
            
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
                this.ctx.fillText(line, currentPanelX + 30, panelY + 115 + i * 23);
            });
            
            // Contact button with hover effect
            const btnX = currentPanelX + panelW / 2 - 120;
            const btnY = panelY + panelH - 55;
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(btnX, btnY, 240, 45);
            
            this.ctx.strokeStyle = '#5569d0';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(btnX, btnY, 240, 45);
            
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
            
            // Smooth slide-in
            const slideProgress = Math.min(1, (this.cameraX - 1200) / 300);
            const currentPanelX = panelX + (1 - slideProgress) * 100;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(currentPanelX + 8, panelY + 8, panelW, panelH);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(currentPanelX, panelY, panelW, panelH);
            
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(currentPanelX, panelY, panelW, panelH);
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 36px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', currentPanelX + panelW / 2, panelY + 50);
            
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
            const startX = currentPanelX + 60;
            const startY = panelY + 100;
            
            games.forEach((game, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = startX + col * (cardW + gap);
                const y = startY + row * (cardH + gap);
                
                // Hover effect (subtle float)
                const cardFloat = Math.sin(this.time * 2 + i) * 3;
                
                this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
                this.ctx.fillRect(x + 4, y + 4 + cardFloat, cardW, cardH);
                
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.fillRect(x, y + cardFloat, cardW, cardH);
                
                this.ctx.fillStyle = game.color;
                this.ctx.fillRect(x, y + cardFloat, cardW, 120);
                
                this.ctx.font = '60px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardW / 2, y + 75 + cardFloat);
                
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 18px Poppins';
                this.ctx.fillText(game.name, x + cardW / 2, y + 145 + cardFloat);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '14px Poppins';
                this.ctx.fillText('Click to play', x + cardW / 2, y + 165 + cardFloat);
                
                this.ctx.strokeStyle = '#ddd';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y + cardFloat, cardW, cardH);
                
                window.gameCards[i] = { x, y: y + cardFloat, width: cardW, height: cardH, game: game.name };
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
        this.targetY = this.y;
        this.velocityY = 0;
        this.isJumping = false;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.idleAnimation = 0;
        this.interactionRadius = 80;
        this.isHovered = false;
        
        this.phrases = [
            "Welcome to my room! 🏠",
            "Explore my portfolio!",
            "Check out the games! 🎮",
            "Read about me! 📖",
            "Use arrow keys to move around!"
        ];
        
        this.setupControls();
        this.setupBlinking();
    }

    setupBlinking() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.isBlinking = true;
                setTimeout(() => {
                    this.isBlinking = false;
                }, 150);
            }
        }, 3000);
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

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            const dist = Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - (this.y - 60), 2));
            this.isHovered = dist < this.interactionRadius;
            
            if (this.isHovered) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
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
        
        // Jump animation
        if (!this.isJumping) {
            this.velocityY = -12;
            this.isJumping = true;
        }
    }

    showSpeech(text) {
        const bubble = document.getElementById('speechBubble');
        const speechText = document.getElementById('speechText');
        
        if (!bubble || !speechText) return;
        
        speechText.textContent = text;
        bubble.classList.remove('hidden');
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        
        bubble.style.left = this.x + 'px';
        bubble.style.top = (this.y - 150) + 'px';
        
        // Smooth fade in
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.3s, transform 0.3s';
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';
        }, 10);
        
        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8)';
            setTimeout(() => {
                bubble.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    update() {
        this.idleAnimation += 0.05;
        
        // Camera movement
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
        
        // Jump physics
        if (this.isJumping) {
            this.velocityY += 0.8;
            this.y += this.velocityY;
            
            const groundY = this.canvas.height - 250;
            if (this.y >= groundY) {
                this.y = groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        } else {
            // Subtle idle breathing animation
            this.y = (this.canvas.height - 250) + Math.sin(this.idleAnimation) * 3;
        }
    }

    draw() {
        this.ctx.save();
        
        const x = this.x;
        const y = this.y;
        
        // Interaction highlight when hovered
        if (this.isHovered) {
            this.ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 60, this.interactionRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 5, 30, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Character body
        
        // Legs
        this.ctx.fillStyle = '#4A90E2';
        this.ctx.fillRect(x - 15, y - 60, 12, 55);
        this.ctx.fillRect(x + 3, y - 60, 12, 55);
        
        // Shoes
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(x - 18, y - 5, 15, 8);
        this.ctx.fillRect(x + 3, y - 5, 15, 8);
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - 18, y + 3, 15, 2);
        this.ctx.fillRect(x + 3, y + 3, 15, 2);
        
        // Torso
        this.ctx.fillStyle = '#2E5090';
        this.ctx.fillRect(x - 22, y - 110, 44, 50);
        
        // Hoodie pocket
        this.ctx.strokeStyle = '#1a3a6a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 12, y - 85, 24, 15);
        
        // Arms
        const armSwing = Math.sin(this.idleAnimation * 2) * 2;
        this.ctx.fillRect(x - 32, y - 105 + armSwing, 10, 40);
        this.ctx.fillRect(x + 22, y - 105 - armSwing, 10, 40);
        
        // Hands
        this.ctx.fillStyle = '#C49A6C';
        this.ctx.fillRect(x - 32, y - 68 + armSwing, 10, 12);
        this.ctx.fillRect(x + 22, y - 68 - armSwing, 10, 12);
        
        // Neck
        this.ctx.fillRect(x - 10, y - 115, 20, 10);
        
        // Head
        this.ctx.fillStyle = '#8B5A3C';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 128, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair (afro)
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 133, 24, Math.PI, 0);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - 20, y - 128, 16, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y - 128, 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        if (!this.isBlinking) {
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
        } else {
            // Blink
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 11, y - 130);
            this.ctx.lineTo(x - 3, y - 130);
            this.ctx.moveTo(x + 3, y - 130);
            this.ctx.lineTo(x + 11, y - 130);
            this.ctx.stroke();
        }
        
        // Smile
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 120, 8, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        
        // Nose
        this.ctx.fillStyle = '#6B4423';
        this.ctx.fillRect(x + 2, y - 126, 3, 6);
        
        this.ctx.restore();
    }
}
