// Advanced Scene Manager with Realistic Rendering
class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cameraX = 0;
        this.targetCameraX = 0;
        this.worldWidth = 4000;
        this.time = 0;
        this.isNightTime = true;
        this.nightTransition = 1.0;
        this.lightSources = [];
        
        // Advanced lighting system
        this.ambientLight = 0.3;
        this.initLightSources();
        
        // Particle systems
        this.dustParticles = [];
        this.initDustParticles();
        
        // Day/night cycle
        this.startDayNightCycle();
        
        this.sections = {
            center: { x: 0, width: 1400, name: 'Home' },
            aboutMe: { x: -1400, width: 1400, name: 'About Me' },
            games: { x: 1400, width: 2000, name: 'Games' }
        };
        
        this.currentSection = 'center';
        this.floatingSignY = -100;
        this.targetSignY = 30;
    }

    initLightSources() {
        this.lightSources = [
            { x: 400, y: 200, radius: 150, intensity: 0.8, color: [255, 200, 100] }, // Lamp
            { x: this.canvas.width - 300, y: 300, radius: 120, intensity: 0.6, color: [100, 150, 200] } // Monitor
        ];
    }

    initDustParticles() {
        for (let i = 0; i < 50; i++) {
            this.dustParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.2 - 0.1,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4,
                shimmer: Math.random() * Math.PI * 2
            });
        }
    }

    updateDustParticles() {
        this.dustParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.shimmer += 0.05;
            
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            p.opacity = 0.2 + Math.sin(p.shimmer) * 0.15;
        });
    }

    drawDustParticles() {
        this.dustParticles.forEach(p => {
            const nightFactor = this.nightTransition;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * nightFactor})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    startDayNightCycle() {
        setInterval(() => {
            this.isNightTime = !this.isNightTime;
            this.transitionDayNight();
        }, 90000);
    }

    transitionDayNight() {
        const startValue = this.nightTransition;
        const targetValue = this.isNightTime ? 1.0 : 0.0;
        const duration = 4000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutQuad(progress);
            
            this.nightTransition = startValue + (targetValue - startValue) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    moveCamera(dx) {
        this.targetCameraX += dx;
        this.targetCameraX = Math.max(-1400, Math.min(2000, this.targetCameraX));
        
        const characterWorldX = this.cameraX;
        
        if (characterWorldX < -400) {
            if (this.currentSection !== 'aboutMe') {
                this.currentSection = 'aboutMe';
                this.onSectionEnter('aboutMe');
            }
        } else if (characterWorldX > 1000) {
            if (this.currentSection !== 'games') {
                this.currentSection = 'games';
                this.onSectionEnter('games');
            }
        } else {
            if (this.currentSection !== 'center') {
                this.currentSection = 'center';
                this.onSectionEnter('center');
            }
        }
    }

    updateCamera() {
        const diff = this.targetCameraX - this.cameraX;
        this.cameraX += diff * 0.12;
    }

    onSectionEnter(section) {
        console.log('Entered section:', section);
        const indicator = document.getElementById('sectionIndicator');
        if (indicator) {
            indicator.textContent = this.sections[section].name;
            indicator.style.transition = 'all 0.3s ease';
            indicator.classList.remove('hidden');
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2500);
        }
    }

    update() {
        this.time += 0.016;
        this.updateCamera();
        this.updateDustParticles();
        
        if (this.floatingSignY < this.targetSignY) {
            this.floatingSignY += (this.targetSignY - this.floatingSignY) * 0.08;
        }
    }

    // Realistic color blending
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

    drawRealisticBackground() {
        // Realistic wall with texture
        const wallDay = '#d8cbb8';
        const wallNight = '#4a3b5a';
        const wallColor = this.lerpColor(wallDay, wallNight, this.nightTransition);
        
        this.ctx.fillStyle = wallColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Wall texture with noise
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height - 200);
            const opacity = Math.random() * 0.03;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Realistic wall paneling with depth
        this.ctx.strokeStyle = this.lerpColor('#c8bca8', '#3a2b4a', this.nightTransition);
        this.ctx.lineWidth = 4;
        
        for (let i = 0; i < this.canvas.width; i += 65) {
            // Main panel line
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height - 200);
            this.ctx.stroke();
            
            // Depth shadow
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 * this.nightTransition})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i + 2, 0);
            this.ctx.lineTo(i + 2, this.canvas.height - 200);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = this.lerpColor('#c8bca8', '#3a2b4a', this.nightTransition);
            this.ctx.lineWidth = 4;
        }
        
        // Baseboard with realistic shadow
        const baseboardY = this.canvas.height - 200;
        this.ctx.fillStyle = this.lerpColor('#b8aca8', '#2a1b3a', this.nightTransition);
        this.ctx.fillRect(0, baseboardY, this.canvas.width, 15);
        
        // Shadow above baseboard
        const shadowGradient = this.ctx.createLinearGradient(0, baseboardY - 10, 0, baseboardY);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, `rgba(0, 0, 0, ${0.2 * this.nightTransition})`);
        this.ctx.fillStyle = shadowGradient;
        this.ctx.fillRect(0, baseboardY - 10, this.canvas.width, 10);
    }

    drawRealisticFloor() {
        const floorY = this.canvas.height - 200;
        
        // Realistic wooden floor with proper lighting
        const floorGradient = this.ctx.createLinearGradient(0, floorY, 0, this.canvas.height);
        floorGradient.addColorStop(0, this.lerpColor('#d4895f', '#8a5a3f', this.nightTransition * 0.5));
        floorGradient.addColorStop(0.4, this.lerpColor('#c47850', '#7a4a30', this.nightTransition * 0.5));
        floorGradient.addColorStop(1, this.lerpColor('#a0613d', '#6a3a2d', this.nightTransition * 0.5));
        
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, floorY, this.canvas.width, 200);
        
        // Realistic wood planks with varied grain
        for (let i = 0; i < 200; i += 32) {
            // Main plank line
            this.ctx.strokeStyle = `rgba(80, 40, 20, ${0.3 + Math.random() * 0.1})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, floorY + i);
            this.ctx.lineTo(this.canvas.width, floorY + i + Math.random() * 2);
            this.ctx.stroke();
            
            // Wood grain detail
            for (let x = 0; x < this.canvas.width; x += 80) {
                const grainLength = 20 + Math.random() * 30;
                this.ctx.strokeStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.1})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x, floorY + i + 8);
                this.ctx.lineTo(x + grainLength, floorY + i + 12 + Math.random() * 4);
                this.ctx.stroke();
            }
            
            // Highlight on top edge
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - this.nightTransition)})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, floorY + i);
            this.ctx.lineTo(this.canvas.width, floorY + i);
            this.ctx.stroke();
        }
        
        // Vertical plank separations with offset
        for (let i = 0; i < this.canvas.width; i += 160) {
            const offset = (Math.floor(i / 160) % 2) * 16;
            this.ctx.strokeStyle = `rgba(60, 30, 15, ${0.25 + Math.random() * 0.1})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i, floorY + offset);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Realistic rug with texture
        this.drawRealisticRug(floorY);
    }

    drawRealisticRug(floorY) {
        const rugX = this.canvas.width / 2 - 160;
        const rugY = floorY + 55;
        const rugW = 320;
        const rugH = 90;
        
        // Rug shadow (soft)
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * this.nightTransition})`;
        this.ctx.filter = 'blur(8px)';
        this.ctx.fillRect(rugX + 8, rugY + 8, rugW, rugH);
        this.ctx.filter = 'none';
        
        // Rug base with gradient
        const rugGradient = this.ctx.createLinearGradient(rugX, rugY, rugX, rugY + rugH);
        rugGradient.addColorStop(0, this.lerpColor('#6a8a9a', '#4a6a7a', this.nightTransition * 0.4));
        rugGradient.addColorStop(0.5, this.lerpColor('#5a7a8a', '#3a5a6a', this.nightTransition * 0.4));
        rugGradient.addColorStop(1, this.lerpColor('#4a6a7a', '#2a4a5a', this.nightTransition * 0.4));
        this.ctx.fillStyle = rugGradient;
        this.ctx.fillRect(rugX, rugY, rugW, rugH);
        
        // Rug texture
        for (let i = 0; i < 100; i++) {
            const x = rugX + Math.random() * rugW;
            const y = rugY + Math.random() * rugH;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.08})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Rug patterns
        this.ctx.strokeStyle = this.lerpColor('#7a9aaa', '#5a7a8a', this.nightTransition * 0.3);
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(rugX + 15, rugY + 15, rugW - 30, rugH - 30);
        this.ctx.strokeRect(rugX + 25, rugY + 25, rugW - 50, rugH - 50);
        
        // Rug fringe with detail
        this.ctx.strokeStyle = this.lerpColor('#6a8a9a', '#4a6a7a', this.nightTransition * 0.4);
        this.ctx.lineWidth = 1;
        for (let i = 0; i < rugW; i += 4) {
            const fringeLength = 4 + Math.random() * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(rugX + i, rugY);
            this.ctx.lineTo(rugX + i, rugY - fringeLength);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(rugX + i, rugY + rugH);
            this.ctx.lineTo(rugX + i, rugY + rugH + fringeLength);
            this.ctx.stroke();
        }
    }

    drawRealisticWindow(floorY) {
        const windowX = this.canvas.width - 420;
        const windowY = 90;
        const windowW = 370;
        const windowH = 480;
        
        // Window shadow on wall (realistic depth)
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * this.nightTransition})`;
        this.ctx.filter = 'blur(10px)';
        this.ctx.fillRect(windowX - 20, windowY - 20, windowW + 40, windowH + 40);
        this.ctx.filter = 'none';
        
        // Realistic window frame (dark wood)
        const frameColor = this.lerpColor('#3a3a3a', '#2a2a2a', this.nightTransition * 0.3);
        this.ctx.fillStyle = frameColor;
        this.ctx.fillRect(windowX - 18, windowY - 18, windowW + 36, windowH + 36);
        
        // Frame depth layers
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
        this.ctx.fillRect(windowX - 16, windowY - 16, windowW + 32, 8);
        this.ctx.fillRect(windowX - 16, windowY - 16, 8, windowH + 32);
        
        // Sky view through window
        if (this.nightTransition > 0.5) {
            this.drawRealisticNightSky(windowX, windowY, windowW, windowH);
        } else {
            this.drawRealisticDaySky(windowX, windowY, windowW, windowH);
        }
        
        // Realistic window panes with glass effect
        this.ctx.strokeStyle = frameColor;
        this.ctx.lineWidth = 12;
        this.ctx.beginPath();
        this.ctx.moveTo(windowX + windowW / 2, windowY);
        this.ctx.lineTo(windowX + windowW / 2, windowY + windowH);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(windowX, windowY + windowH / 2);
        this.ctx.lineTo(windowX + windowW, windowY + windowH / 2);
        this.ctx.stroke();
        
        // Glass reflection
        const reflectionGradient = this.ctx.createLinearGradient(windowX, windowY, windowX + 150, windowY + 250);
        reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = reflectionGradient;
        this.ctx.fillRect(windowX + 20, windowY + 20, 130, 230);
        
        // Window sill
        this.ctx.fillStyle = this.lerpColor('#4a4a4a', '#3a3a3a', this.nightTransition * 0.3);
        this.ctx.fillRect(windowX - 25, windowY + windowH + 18, windowW + 50, 18);
        
        // Sill shadow
        const sillShadow = this.ctx.createLinearGradient(0, windowY + windowH + 36, 0, windowY + windowH + 46);
        sillShadow.addColorStop(0, `rgba(0, 0, 0, ${0.2 * this.nightTransition})`);
        sillShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = sillShadow;
        this.ctx.fillRect(windowX - 25, windowY + windowH + 36, windowW + 50, 10);
    }

    drawRealisticNightSky(x, y, w, h) {
        // Deep night sky gradient
        const skyGradient = this.ctx.createLinearGradient(x, y, x, y + h);
        skyGradient.addColorStop(0, '#0a1628');
        skyGradient.addColorStop(0.3, '#1a2a48');
        skyGradient.addColorStop(0.7, '#2a3a58');
        skyGradient.addColorStop(1, '#1a2a48');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(x, y, w, h);
        
        // Realistic moon with detailed surface
        const moonX = x + w / 2 - 30;
        const moonY = y + 130;
        const moonRadius = 70;
        
        // Moon atmospheric glow (multiple layers)
        for (let i = 4; i > 0; i--) {
            this.ctx.fillStyle = `rgba(224, 224, 240, ${0.05 * i})`;
            this.ctx.beginPath();
            this.ctx.arc(moonX, moonY, moonRadius + i * 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Moon surface gradient
        const moonGradient = this.ctx.createRadialGradient(moonX - 20, moonY - 20, 10, moonX, moonY, moonRadius);
        moonGradient.addColorStop(0, '#ffffff');
        moonGradient.addColorStop(0.6, '#e8e8f8');
        moonGradient.addColorStop(1, '#d0d0e8');
        this.ctx.fillStyle = moonGradient;
        this.ctx.beginPath();
        this.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Moon craters with realistic depth
        const craters = [
            [moonX - 25, moonY - 20, 12],
            [moonX + 20, moonY - 10, 9],
            [moonX - 15, moonY + 25, 14],
            [moonX + 30, moonY + 20, 8],
            [moonX + 5, moonY + 35, 10],
            [moonX - 35, moonY + 10, 7]
        ];
        
        craters.forEach(([cx, cy, r]) => {
            // Crater shadow
            this.ctx.fillStyle = 'rgba(100, 100, 120, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Crater highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Crater depth
            this.ctx.fillStyle = 'rgba(80, 80, 100, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(cx + r * 0.2, cy + r * 0.2, r * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Realistic twinkling stars
        const stars = [
            [x + 60, y + 60, 2.5, 0.9],
            [x + 130, y + 90, 3, 1],
            [x + 220, y + 50, 2, 0.8],
            [x + 290, y + 80, 2.5, 0.85],
            [x + 90, y + 170, 2, 0.75],
            [x + 170, y + 200, 3, 0.95],
            [x + 260, y + 180, 2.5, 0.9],
            [x + 310, y + 220, 2, 0.8],
            [x + 70, y + 280, 2.5, 0.85],
            [x + 200, y + 310, 2, 0.9],
            [x + 280, y + 350, 3, 1],
            [x + 120, y + 380, 2, 0.75],
            [x + 330, y + 110, 2.5, 0.8],
            [x + 50, y + 330, 2, 0.85],
            [x + 240, y + 260, 2.5, 0.9]
        ];
        
        stars.forEach(([sx, sy, size, baseBrightness], index) => {
            const twinkle = Math.abs(Math.sin(this.time * 1.5 + index * 0.8));
            const brightness = baseBrightness * (0.6 + twinkle * 0.4);
            
            // Star core
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Star glow
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Star flares (when bright)
            if (twinkle > 0.7) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${(twinkle - 0.7) * 2})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(sx - size * 3, sy);
                this.ctx.lineTo(sx + size * 3, sy);
                this.ctx.moveTo(sx, sy - size * 3);
                this.ctx.lineTo(sx, sy + size * 3);
                this.ctx.stroke();
            }
        });
        
        // Distant galaxy/nebula effect
        this.ctx.fillStyle = 'rgba(150, 100, 200, 0.05)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w * 0.7, y + h * 0.6, 80, 40, Math.PI / 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRealisticDaySky(x, y, w, h) {
        // Realistic day sky
        const skyGradient = this.ctx.createLinearGradient(x, y, x, y + h);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#B0E2FF');
        skyGradient.addColorStop(1, '#98D8E8');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(x, y, w, h);
        
        // Realistic sun with corona
        const sunX = x + 100;
        const sunY = y + 110;
        const sunRadius = 55;
        
        // Sun corona (multiple layers)
        for (let i = 3; i > 0; i--) {
            this.ctx.fillStyle = `rgba(255, 220, 100, ${0.15 * i})`;
            this.ctx.beginPath();
            this.ctx.arc(sunX, sunY, sunRadius + i * 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Sun surface gradient
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
        sunGradient.addColorStop(0, '#FFFFCC');
        sunGradient.addColorStop(0.5, '#FFDD44');
        sunGradient.addColorStop(1, '#FFB000');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sun rays
        this.ctx.strokeStyle = 'rgba(255, 220, 100, 0.3)';
        this.ctx.lineWidth = 4;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const rayStart = sunRadius + 10;
            const rayEnd = sunRadius + 40;
            
            this.ctx.beginPath();
            this.ctx.moveTo(sunX + Math.cos(angle) * rayStart, sunY + Math.sin(angle) * rayStart);
            this.ctx.lineTo(sunX + Math.cos(angle) * rayEnd, sunY + Math.sin(angle) * rayEnd);
            this.ctx.stroke();
        }
        
        // Realistic clouds with depth
        this.drawRealisticCloud(x + 170, y + 280, 1, 0.9);
        this.drawRealisticCloud(x + 270, y + 350, 0.85, 0.75);
        this.drawRealisticCloud(x + 100, y + 380, 0.7, 0.65);
    }

    drawRealisticCloud(x, y, scale, opacity) {
        const baseOpacity = opacity;
        
        // Cloud puffs with gradients
        const puffs = [
            [0, 0, 35],
            [30, -12, 42],
            [65, -8, 38],
            [95, 0, 35],
            [35, 15, 30],
            [65, 12, 28]
        ];
        
        puffs.forEach(([px, py, r]) => {
            const gradient = this.ctx.createRadialGradient(
                x + px * scale, y + py * scale, 0,
                x + px * scale, y + py * scale, r * scale
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`);
            gradient.addColorStop(0.6, `rgba(255, 255, 255, ${baseOpacity * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${baseOpacity * 0.3})`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x + px * scale, y + py * scale, r * scale, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Cloud shadows
        this.ctx.fillStyle = `rgba(200, 200, 220, ${opacity * 0.15})`;
        puffs.slice(0, 3).forEach(([px, py, r]) => {
            this.ctx.beginPath();
            this.ctx.arc(x + px * scale + 5, y + py * scale + 8, r * scale * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawRealisticBed(floorY) {
        const bedX = 85;
        const bedY = floorY - 130;
        const bedW = 300;
        const bedH = 95;
        
        // Bed shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * this.nightTransition})`;
        this.ctx.filter = 'blur(8px)';
        this.ctx.fillRect(bedX - 5, bedY + bedH + 5, bedW + 10, 15);
        this.ctx.filter = 'none';
        
        // Bed frame with realistic wood texture
        const frameGradient = this.ctx.createLinearGradient(bedX, bedY + bedH - 10, bedX, bedY + bedH + 35);
        frameGradient.addColorStop(0, this.lerpColor('#5a3a2a', '#3a2a1a', this.nightTransition * 0.4));
        frameGradient.addColorStop(1, this.lerpColor('#4a2a1a', '#2a1a0a', this.nightTransition * 0.4));
        this.ctx.fillStyle = frameGradient;
        this.ctx.fillRect(bedX, bedY + bedH - 8, bedW, 38);
        
        // Frame detail
        this.ctx.strokeStyle = `rgba(100, 60, 40, 0.5)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bedX + 5, bedY + bedH - 5, bedW - 10, 32);
        
        // Bed posts with detail
        const postW = 14;
        const postH = 50;
        
        [-12, bedW - 2].forEach(offsetX => {
            const postGradient = this.ctx.createLinearGradient(
                bedX + offsetX, bedY + bedH - 10,
                bedX + offsetX + postW, bedY + bedH - 10
            );
            postGradient.addColorStop(0, this.lerpColor('#6a4a3a', '#4a3a2a', this.nightTransition * 0.3));
            postGradient.addColorStop(0.5, this.lerpColor('#5a3a2a', '#3a2a1a', this.nightTransition * 0.3));
            postGradient.addColorStop(1, this.lerpColor('#4a2a1a', '#2a1a0a', this.nightTransition * 0.3));
            
            this.ctx.fillStyle = postGradient;
            this.ctx.fillRect(bedX + offsetX, bedY + bedH - 10, postW, postH);
            
            // Post cap
            this.ctx.fillStyle = this.lerpColor('#7a5a4a', '#5a3a2a', this.nightTransition * 0.3);
            this.ctx.fillRect(bedX + offsetX - 3, bedY + bedH - 15, postW + 6, 10);
        });
        
        // Mattress with realistic fabric texture
        const mattressGradient = this.ctx.createLinearGradient(bedX, bedY, bedX + bedW, bedY);
        mattressGradient.addColorStop(0, this.lerpColor('#9a7a6a', '#6a5a4a', this.nightTransition * 0.4));
        mattressGradient.addColorStop(0.5, this.lerpColor('#8a6a5a', '#5a4a3a', this.nightTransition * 0.4));
        mattressGradient.addColorStop(1, this.lerpColor('#7a5a4a', '#4a3a2a', this.nightTransition * 0.4));
        this.ctx.fillStyle = mattressGradient;
        this.ctx.fillRect(bedX, bedY, bedW, bedH);
        
        // Mattress stitching pattern
        this.ctx.strokeStyle = `rgba(100, 80, 70, 0.3)`;
        this.ctx.lineWidth = 1;
        for (let i = 0; i < bedW; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(bedX + i, bedY + 10);
            this.ctx.lineTo(bedX + i, bedY + bedH - 10);
            this.ctx.stroke();
        }
        
        // Mattress shadow on bottom edge
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
        this.ctx.fillRect(bedX, bedY + bedH - 25, bedW, 25);
        
        // Realistic sheets with folds
        const sheetGradient = this.ctx.createLinearGradient(bedX, bedY + 25, bedX + bedW, bedY + 25);
        sheetGradient.addColorStop(0, this.lerpColor('#e4c5a4', '#c4a584', this.nightTransition * 0.3));
        sheetGradient.addColorStop(0.5, this.lerpColor('#d4b594', '#b49574', this.nightTransition * 0.3));
        sheetGradient.addColorStop(1, this.lerpColor('#c4a584', '#a48564', this.nightTransition * 0.3));
        this.ctx.fillStyle = sheetGradient;
        this.ctx.fillRect(bedX + 8, bedY + 25, bedW - 16, bedH - 25);
        
        // Sheet folds and wrinkles
        const folds = [
            [bedX + 25, bedY + 32, 115, 20],
            [bedX + 160, bedY + 42, 95, 14],
            [bedX + 45, bedY + 58, 180, 16],
            [bedX + 30, bedY + 75, 140, 12]
        ];
        
        folds.forEach(([fx, fy, fw, fh]) => {
            this.ctx.fillStyle = this.lerpColor('#f4d5b4', '#d4b594', this.nightTransition * 0.2);
            this.ctx.fillRect(fx, fy, fw, fh);
            
            // Fold shadow
            this.ctx.fillStyle = `rgba(100, 80, 60, ${0.15 + Math.random() * 0.1})`;
            this.ctx.fillRect(fx, fy + fh - 4, fw, 4);
        });
        
        // Realistic pillow with depth
        const pillowX = bedX + 28;
        const pillowY = bedY + 15;
        const pillowW = 110;
        const pillowH = 45;
        
        // Pillow shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
        this.ctx.filter = 'blur(4px)';
        this.ctx.fillRect(pillowX + 4, pillowY + 4, pillowW, pillowH);
        this.ctx.filter = 'none';
        
        // Pillow gradient
        const pillowGradient = this.ctx.createLinearGradient(pillowX, pillowY, pillowX, pillowY + pillowH);
        pillowGradient.addColorStop(0, this.lerpColor('#fffaf0', '#e4dfd0', this.nightTransition * 0.3));
        pillowGradient.addColorStop(0.6, this.lerpColor('#f4e8dc', '#d4c8bc', this.nightTransition * 0.3));
        pillowGradient.addColorStop(1, this.lerpColor('#e4d8cc', '#c4b8ac', this.nightTransition * 0.3));
        this.ctx.fillStyle = pillowGradient;
        this.ctx.fillRect(pillowX, pillowY, pillowW, pillowH);
        
        // Pillow center depression
        this.ctx.fillStyle = this.lerpColor('#f4e8dc', '#d4c8bc', this.nightTransition * 0.4);
        this.ctx.fillRect(pillowX + 15, pillowY + 20, pillowW - 30, pillowH - 25);
        
        // Pillow seam
        this.ctx.strokeStyle = `rgba(200, 180, 170, 0.4)`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pillowX + 10, pillowY + pillowH / 2);
        this.ctx.lineTo(pillowX + pillowW - 10, pillowY + pillowH / 2);
        this.ctx.stroke();
        
        // Draped blanket with realistic folds
        const blanketX = bedX + 160;
        const blanketY = bedY + 45;
        const blanketW = 135;
        const blanketH = 75;
        
        const blanketGradient = this.ctx.createLinearGradient(blanketX, blanketY, blanketX, blanketY + blanketH);
        blanketGradient.addColorStop(0, this.lerpColor('#7a5a4a', '#5a3a2a', this.nightTransition * 0.4));
        blanketGradient.addColorStop(0.5, this.lerpColor('#6a4a3a', '#4a2a1a', this.nightTransition * 0.4));
        blanketGradient.addColorStop(1, this.lerpColor('#5a3a2a', '#3a1a0a', this.nightTransition * 0.4));
        this.ctx.fillStyle = blanketGradient;
        this.ctx.fillRect(blanketX, blanketY, blanketW, blanketH);
        
        // Blanket folds with highlights
        const blanketFolds = [
            [blanketX + 10, blanketY + 8, blanketW - 20, 16],
            [blanketX + 15, blanketY + 28, blanketW - 30, 13],
            [blanketX + 8, blanketY + 48, blanketW - 16, 15]
        ];
        
        blanketFolds.forEach(([bx, by, bw, bh]) => {
            // Fold highlight
            this.ctx.fillStyle = this.lerpColor('#8a6a5a', '#6a4a3a', this.nightTransition * 0.3);
            this.ctx.fillRect(bx, by, bw, bh);
            
            // Fold shadow
            this.ctx.fillStyle = `rgba(30, 20, 15, ${0.25 + Math.random() * 0.1})`;
            this.ctx.fillRect(bx, by + bh - 3, bw, 3);
        });
        
        // Blanket draping over edge
        this.ctx.fillStyle = this.lerpColor('#6a4a3a', '#4a2a1a', this.nightTransition * 0.5);
        this.ctx.fillRect(blanketX, bedY + bedH + 10, blanketW, 8);
    }

    drawRealisticDesk(floorY) {
        const deskX = this.canvas.width - 620;
        const deskY = floorY - 110;
        const deskW = 200;
        
        // Desk shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
        this.ctx.filter = 'blur(6px)';
        this.ctx.fillRect(deskX - 8, deskY + 110, deskW + 16, 10);
        this.ctx.filter = 'none';
        
        // Desk surface with wood grain
        const deskGradient = this.ctx.createLinearGradient(deskX, deskY, deskX + deskW, deskY);
        deskGradient.addColorStop(0, this.lerpColor('#7a5a4a', '#5a3a2a', this.nightTransition * 0.4));
        deskGradient.addColorStop(0.5, this.lerpColor('#6a4a3a', '#4a2a1a', this.nightTransition * 0.4));
        deskGradient.addColorStop(1, this.lerpColor('#5a3a2a', '#3a1a0a', this.nightTransition * 0.4));
        this.ctx.fillStyle = deskGradient;
        this.ctx.fillRect(deskX - 8, deskY, deskW + 16, 20);
        
        // Desk top edge highlight
        this.ctx.fillStyle = this.lerpColor('#9a7a6a', '#6a4a3a', this.nightTransition * 0.3);
        this.ctx.fillRect(deskX - 8, deskY, deskW + 16, 4);
        
        // Wood grain on desk
        for (let i = 0; i < deskW; i += 60) {
            this.ctx.strokeStyle = `rgba(100, 60, 40, ${0.15 + Math.random() * 0.1})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(deskX + i, deskY + 5);
            this.ctx.lineTo(deskX + i + 40, deskY + 12);
            this.ctx.stroke();
        }
        
        // Realistic desk legs with detail
        const legPositions = [15, deskW - 25];
        legPositions.forEach(offsetX => {
            const legGradient = this.ctx.createLinearGradient(
                deskX + offsetX, deskY + 20,
                deskX + offsetX + 20, deskY + 20
            );
            legGradient.addColorStop(0, this.lerpColor('#6a4a3a', '#4a2a1a', this.nightTransition * 0.4));
            legGradient.addColorStop(0.5, this.lerpColor('#5a3a2a', '#3a1a0a', this.nightTransition * 0.4));
            legGradient.addColorStop(1, this.lerpColor('#4a2a1a', '#2a0a0a', this.nightTransition * 0.4));
            
            this.ctx.fillStyle = legGradient;
            this.ctx.fillRect(deskX + offsetX, deskY + 20, 20, 110);
            
            // Leg highlight
            this.ctx.fillStyle = this.lerpColor('#7a5a4a', '#5a3a2a', this.nightTransition * 0.3);
            this.ctx.fillRect(deskX + offsetX, deskY + 20, 4, 110);
        });
        
        // Realistic monitor with detailed screen
        this.drawRealisticMonitor(deskX, deskY);
        
        // Realistic keyboard
        this.drawRealisticKeyboard(deskX, deskY);
        
        // Realistic mouse
        this.drawRealisticMouse(deskX, deskY);
        
        // Realistic chair
        this.drawRealisticChair(deskX, floorY);
    }

    drawRealisticMonitor(deskX, deskY) {
        const monitorX = deskX + 55;
        const monitorY = deskY - 90;
        const monitorW = 90;
        const monitorH = 78;
        
        // Monitor shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * this.nightTransition})`;
        this.ctx.filter = 'blur(6px)';
        this.ctx.fillRect(monitorX + 4, monitorY + 4, monitorW, monitorH);
        this.ctx.filter = 'none';
        
        // Monitor bezel
        const bezelGradient = this.ctx.createLinearGradient(monitorX, monitorY, monitorX, monitorY + monitorH);
        bezelGradient.addColorStop(0, '#2a2a3a');
        bezelGradient.addColorStop(0.5, '#1a1a2a');
        bezelGradient.addColorStop(1, '#0a0a1a');
        this.ctx.fillStyle = bezelGradient;
        this.ctx.fillRect(monitorX, monitorY, monitorW, monitorH);
        
        // Screen with realistic content
        const screenX = monitorX + 7;
        const screenY = monitorY + 7;
        const screenW = monitorW - 14;
        const screenH = monitorH - 14;
        
        // Animated screen glow
        const glowIntensity = 0.75 + Math.sin(this.time * 0.8) * 0.15;
        const screenGradient = this.ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
        screenGradient.addColorStop(0, `rgba(90, 130, 170, ${glowIntensity})`);
        screenGradient.addColorStop(0.5, `rgba(70, 110, 150, ${glowIntensity})`);
        screenGradient.addColorStop(1, `rgba(50, 90, 130, ${glowIntensity})`);
        this.ctx.fillStyle = screenGradient;
        this.ctx.fillRect(screenX, screenY, screenW, screenH);
        
        // Realistic code editor on screen
        this.ctx.fillStyle = '#1e2838';
        this.ctx.fillRect(screenX + 4, screenY + 4, screenW - 8, screenH - 8);
        
        // Code syntax highlighting
        const codeLines = [
            { color: '#7a9aaa', x: screenX + 8, y: screenY + 12, w: 35, h: 2 },
            { color: '#9ab5c5', x: screenX + 12, y: screenY + 18, w: 48, h: 2 },
            { color: '#7a9aaa', x: screenX + 8, y: screenY + 24, w: 42, h: 2 },
            { color: '#8aa5b5', x: screenX + 12, y: screenY + 30, w: 52, h: 2 },
            { color: '#7a9aaa', x: screenX + 8, y: screenY + 36, w: 38, h: 2 },
            { color: '#9ab5c5', x: screenX + 12, y: screenY + 42, w: 45, h: 2 },
            { color: '#7a9aaa', x: screenX + 8, y: screenY + 48, w: 40, h: 2 }
        ];
        
        codeLines.forEach(line => {
            this.ctx.fillStyle = line.color;
            this.ctx.fillRect(line.x, line.y, line.w, line.h);
        });
        
        // Cursor blink
        if (Math.floor(this.time * 2) % 2 === 0) {
            this.ctx.fillStyle = '#7a9aaa';
            this.ctx.fillRect(screenX + 48, screenY + 48, 2, 3);
        }
        
        // Screen reflection
        const reflectionGradient = this.ctx.createLinearGradient(screenX, screenY, screenX + 45, screenY + 50);
        reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = reflectionGradient;
        this.ctx.fillRect(screenX + 2, screenY + 2, 43, 48);
        
        // Monitor glow on wall (realistic ambient light)
        if (this.nightTransition > 0.3) {
            const wallGlowIntensity = glowIntensity * this.nightTransition;
            
            for (let i = 3; i > 0; i--) {
                this.ctx.fillStyle = `rgba(70, 110, 150, ${wallGlowIntensity * 0.08 * i})`;
                this.ctx.beginPath();
                this.ctx.arc(monitorX + monitorW / 2, monitorY + monitorH / 2, 90 + i * 25, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Monitor stand with realistic material
        const standGradient = this.ctx.createLinearGradient(
            monitorX + monitorW / 2 - 12, monitorY + monitorH,
            monitorX + monitorW / 2 + 12, monitorY + monitorH
        );
        standGradient.addColorStop(0, '#1a1a2a');
        standGradient.addColorStop(0.5, '#2a2a3a');
        standGradient.addColorStop(1, '#1a1a2a');
        this.ctx.fillStyle = standGradient;
        this.ctx.fillRect(monitorX + monitorW / 2 - 12, monitorY + monitorH, 24, 14);
        
        // Stand base
        const baseGradient = this.ctx.createLinearGradient(
            monitorX + monitorW / 2 - 18, monitorY + monitorH + 14,
            monitorX + monitorW / 2 + 18, monitorY + monitorH + 14
        );
        baseGradient.addColorStop(0, '#1a1a2a');
        baseGradient.addColorStop(0.5, '#2a2a3a');
        baseGradient.addColorStop(1, '#1a1a2a');
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(monitorX + monitorW / 2 - 18, monitorY + monitorH + 14, 36, 6);
    }

    drawRealisticKeyboard(deskX, deskY) {
        const kbX = deskX + 38;
        const kbY = deskY - 14;
        const kbW = 68;
        const kbH = 12;
        
        // Keyboard shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * this.nightTransition})`;
        this.ctx.fillRect(kbX + 2, kbY + 2, kbW, kbH);
        
        // Keyboard base
        const kbGradient = this.ctx.createLinearGradient(kbX, kbY, kbX, kbY + kbH);
        kbGradient.addColorStop(0, '#3a3a4a');
        kbGradient.addColorStop(1, '#2a2a3a');
        this.ctx.fillStyle = kbGradient;
        this.ctx.fillRect(kbX, kbY, kbW, kbH);
        
        // Individual keys with detail
        const keyColor = '#4a4a5a';
        const keySpacing = 7;
        const keySize = 5.5;
        
        for (let row = 0; row < 5; row++) {
            const keysInRow = row === 4 ? 6 : 11;
            const rowStartX = row === 4 ? kbX + 12 : kbX + 3;
            
            for (let col = 0; col < keysInRow; col++) {
                const keyX = rowStartX + col * keySpacing;
                const keyY = kbY + 2 + row * 2;
                
                // Key gradient for depth
                const keyGradient = this.ctx.createLinearGradient(keyX, keyY, keyX, keyY + 1.8);
                keyGradient.addColorStop(0, keyColor);
                keyGradient.addColorStop(1, '#3a3a4a');
                this.ctx.fillStyle = keyGradient;
                this.ctx.fillRect(keyX, keyY, keySize, 1.8);
                
                // Key highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                this.ctx.fillRect(keyX, keyY, keySize, 0.5);
            }
        }
    }

    drawRealisticMouse(deskX, deskY) {
        const mouseX = deskX + 115;
        const mouseY = deskY - 12;
        const mouseW = 14;
        const mouseH = 18;
        
        // Mouse shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
        this.ctx.filter = 'blur(2px)';
        this.ctx.fillRect(mouseX + 2, mouseY + 2, mouseW, mouseH);
        this.ctx.filter = 'none';
        
        // Mouse body with gradient
        const mouseGradient = this.ctx.createRadialGradient(
            mouseX + mouseW / 2, mouseY + mouseH / 3, 0,
            mouseX + mouseW / 2, mouseY + mouseH / 2, mouseW
        );
        mouseGradient.addColorStop(0, '#4a4a5a');
        mouseGradient.addColorStop(0.7, '#3a3a4a');
        mouseGradient.addColorStop(1, '#2a2a3a');
        this.ctx.fillStyle = mouseGradient;
        
        // Rounded mouse shape
        this.ctx.beginPath();
        this.ctx.moveTo(mouseX + 2, mouseY);
        this.ctx.lineTo(mouseX + mouseW - 2, mouseY);
        this.ctx.quadraticCurveTo(mouseX + mouseW, mouseY, mouseX + mouseW, mouseY + 2);
        this.ctx.lineTo(mouseX + mouseW, mouseY + mouseH - 4);
        this.ctx.quadraticCurveTo(mouseX + mouseW, mouseY + mouseH, mouseX + mouseW / 2, mouseY + mouseH);
        this.ctx.quadraticCurveTo(mouseX, mouseY + mouseH, mouseX, mouseY + mouseH - 4);
        this.ctx.lineTo(mouseX, mouseY + 2);
        this.ctx.quadraticCurveTo(mouseX, mouseY, mouseX + 2, mouseY);
        this.ctx.fill();
        
        // Mouse buttons division
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(mouseX + mouseW / 2, mouseY + 1);
        this.ctx.lineTo(mouseX + mouseW / 2, mouseY + 10);
        this.ctx.stroke();
        
        // Mouse highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.moveTo(mouseX + 3, mouseY + 2);
        this.ctx.lineTo(mouseX + mouseW - 3, mouseY + 2);
        this.ctx.quadraticCurveTo(mouseX + mouseW - 1, mouseY + 2, mouseX + mouseW - 1, mouseY + 4);
        this.ctx.lineTo(mouseX + mouseW - 1, mouseY + 8);
        this.ctx.lineTo(mouseX + 1, mouseY + 8);
        this.ctx.lineTo(mouseX + 1, mouseY + 4);
        this.ctx.quadraticCurveTo(mouseX + 1, mouseY + 2, mouseX + 3, mouseY + 2);
        this.ctx.fill();
    }

    drawRealisticChair(deskX, floorY) {
        const chairX = deskX + 62;
        const chairY = floorY - 90;
        const chairW = 58;
        const chairH = 18;
        
        // Chair shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
        this.ctx.filter = 'blur(5px)';
        this.ctx.fillRect(chairX + 5, chairY + 90, chairW, 8);
        this.ctx.filter = 'none';
        
        // Chair seat with gradient
        const seatGradient = this.ctx.createLinearGradient(chairX, chairY, chairX, chairY + chairH);
        seatGradient.addColorStop(0, this.lerpColor('#5a4a6a', '#4a3a5a', this.nightTransition * 0.3));
        seatGradient.addColorStop(1, this.lerpColor('#4a3a5a', '#3a2a4a', this.nightTransition * 0.3));
        this.ctx.fillStyle = seatGradient;
        this.ctx.fillRect(chairX, chairY, chairW, chairH);
        
        // Seat cushion detail
        this.ctx.strokeStyle = `rgba(100, 80, 120, 0.3)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(chairX + 5, chairY + 3, chairW - 10, chairH - 6);
        
        // Chair backrest
        const backX = chairX + 5;
        const backY = chairY - 70;
        const backW = chairW - 10;
        const backH = 15;
        
        const backGradient = this.ctx.createLinearGradient(backX, backY, backX, backY + backH);
        backGradient.addColorStop(0, this.lerpColor('#5a4a6a', '#4a3a5a', this.nightTransition * 0.3));
        backGradient.addColorStop(1, this.lerpColor('#4a3a5a', '#3a2a4a', this.nightTransition * 0.3));
        this.ctx.fillStyle = backGradient;
        this.ctx.fillRect(backX, backY, backW, backH);
        
        // Backrest detail
        this.ctx.strokeStyle = `rgba(100, 80, 120, 0.3)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(backX + 3, backY + 2, backW - 6, backH - 4);
        
        // Central support pole
        const poleGradient = this.ctx.createLinearGradient(
            chairX + chairW / 2 - 6, chairY + chairH,
            chairX + chairW / 2 + 6, chairY + chairH
        );
        poleGradient.addColorStop(0, '#2a2a3a');
        poleGradient.addColorStop(0.5, '#3a3a4a');
        poleGradient.addColorStop(1, '#2a2a3a');
        this.ctx.fillStyle = poleGradient;
        this.ctx.fillRect(chairX + chairW / 2 - 6, chairY + chairH, 12, 90);
        
        // Pole to backrest connector
        this.ctx.fillRect(chairX + chairW / 2 - 6, backY + backH, 12, chairY - backY - backH);
        
        // Armrests
        [3, chairW - 11].forEach(offsetX => {
            const armGradient = this.ctx.createLinearGradient(
                chairX + offsetX, chairY - 12,
                chairX + offsetX + 8, chairY - 12
            );
            armGradient.addColorStop(0, this.lerpColor('#5a4a6a', '#4a3a5a', this.nightTransition * 0.3));
            armGradient.addColorStop(1, this.lerpColor('#4a3a5a', '#3a2a4a', this.nightTransition * 0.3));
            this.ctx.fillStyle = armGradient;
            this.ctx.fillRect(chairX + offsetX, chairY - 12, 8, 18);
        });
    }

    drawRealisticBookshelf() {
        const shelfX = this.canvas.width - 130;
        const shelfY = 140;
        const shelfW = 95;
        const shelfH = 340;
        
        if (shelfX > this.canvas.width - 180) return;
        
        // Bookshelf shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
        this.ctx.filter = 'blur(6px)';
        this.ctx.fillRect(shelfX + 6, shelfY + 6, shelfW, shelfH);
        this.ctx.filter = 'none';
        
        // Bookshelf frame
        const frameGradient = this.ctx.createLinearGradient(shelfX, shelfY, shelfX + shelfW, shelfY);
        frameGradient.addColorStop(0, this.lerpColor('#5a3a2a', '#3a2a1a', this.nightTransition * 0.4));
        frameGradient.addColorStop(0.5, this.lerpColor('#4a2a1a', '#2a1a0a', this.nightTransition * 0.4));
        frameGradient.addColorStop(1, this.lerpColor('#3a1a0a', '#1a0a00', this.nightTransition * 0.4));
        this.ctx.fillStyle = frameGradient;
        this.ctx.fillRect(shelfX, shelfY, shelfW, shelfH);
        
        // Frame sides with depth
        this.ctx.fillStyle = this.lerpColor('#6a4a3a', '#4a2a1a', this.nightTransition * 0.3);
        this.ctx.fillRect(shelfX, shelfY, 6, shelfH);
        this.ctx.fillRect(shelfX + shelfW - 6, shelfY, 6, shelfH);
        
        // Individual shelves with books
        for (let i = 0; i < 6; i++) {
            const y = shelfY + i * 56;
            
            // Shelf plank
            this.ctx.fillStyle = this.lerpColor('#4a2a1a', '#2a1a0a', this.nightTransition * 0.5);
            this.ctx.fillRect(shelfX, y, shelfW, 10);
            
            // Shelf highlight
            this.ctx.fillStyle = this.lerpColor('#5a3a2a', '#3a1a0a', this.nightTransition * 0.3);
            this.ctx.fillRect(shelfX, y, shelfW, 3);
            
            // Books with realistic spines
            const bookColors = [
                { spine: '#8a4a3a', edge: '#aa6a5a', shadow: '#6a3a2a' },
                { spine: '#4a6a5a', edge: '#6a8a7a', shadow: '#3a5a4a' },
                { spine: '#6a5a7a', edge: '#8a7a9a', shadow: '#5a4a6a' },
                { spine: '#7a6a4a', edge: '#9a8a6a', shadow: '#6a5a3a' },
                { spine: '#5a4a6a', edge: '#7a6a8a', shadow: '#4a3a5a' }
            ];
            
            for (let j = 0; j < 4; j++) {
                const color = bookColors[(i + j) % bookColors.length];
                const bookX = shelfX + 10 + j * 21;
                const bookY = y + 10;
                const bookW = 18;
                const bookH = 40 + Math.random() * 8;
                
                // Book shadow
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
                this.ctx.fillRect(bookX + 2, bookY + 2, bookW, bookH);
                
                // Book spine gradient
                const bookGradient = this.ctx.createLinearGradient(bookX, bookY, bookX + bookW, bookY);
                bookGradient.addColorStop(0, this.lerpColor(color.shadow, color.spine, this.nightTransition * 0.3));
                bookGradient.addColorStop(0.5, this.lerpColor(color.spine, color.edge, this.nightTransition * 0.2));
                bookGradient.addColorStop(1, this.lerpColor(color.edge, color.spine, this.nightTransition * 0.3));
                this.ctx.fillStyle = bookGradient;
                this.ctx.fillRect(bookX, bookY, bookW, bookH);
                
                // Book title area (embossed)
                this.ctx.fillStyle = this.lerpColor(color.edge, color.spine, 0.5);
                this.ctx.fillRect(bookX + 2, bookY + bookH * 0.3, bookW - 4, bookH * 0.1);
                
                // Book edge highlight
                this.ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * (1 - this.nightTransition)})`;
                this.ctx.fillRect(bookX, bookY, 2, bookH);
                
                // Book spine lines
                this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.2 + Math.random() * 0.1})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(bookX + bookW * 0.3, bookY);
                this.ctx.lineTo(bookX + bookW * 0.3, bookY + bookH);
                this.ctx.stroke();
                
                // Book wear marks
                if (Math.random() > 0.6) {
                    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.1})`;
                    this.ctx.fillRect(bookX + 4, bookY + 5, bookW - 8, 2);
                }
            }
        }
    }

    drawRealisticPosters() {
        const posterY = 190;
        
        // Poster 1 with realistic frame
        const p1X = 98;
        const p1W = 95;
        const p1H = 120;
        
        // Poster shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * this.nightTransition})`;
        this.ctx.filter = 'blur(8px)';
        this.ctx.fillRect(p1X + 5, posterY + 5, p1W, p1H);
        this.ctx.filter = 'none';
        
        // Poster background/mat
        this.ctx.fillStyle = this.lerpColor('#7a5a6a', '#5a3a4a', this.nightTransition * 0.4);
        this.ctx.fillRect(p1X, posterY, p1W, p1H);
        
        // Frame
        this.ctx.strokeStyle = this.lerpColor('#3a2a3a', '#2a1a2a', this.nightTransition * 0.3);
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(p1X, posterY, p1W, p1H);
        
        // Inner frame detail
        this.ctx.strokeStyle = this.lerpColor('#4a3a4a', '#3a2a3a', this.nightTransition * 0.2);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p1X + 8, posterY + 8, p1W - 16, p1H - 16);
        
        // Poster artwork (abstract geometric)
        const artX = p1X + 15;
        const artY = posterY + 15;
        const artW = p1W - 30;
        const artH = p1H - 30;
        
        // Background gradient
        const artGradient = this.ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
        artGradient.addColorStop(0, this.lerpColor('#aa6a8a', '#8a4a6a', this.nightTransition * 0.3));
        artGradient.addColorStop(1, this.lerpColor('#9a5a7a', '#7a3a5a', this.nightTransition * 0.3));
        this.ctx.fillStyle = artGradient;
        this.ctx.fillRect(artX, artY, artW, artH);
        
        // Geometric shapes
        this.ctx.fillStyle = this.lerpColor('#ca8aaa', '#aa6a8a', this.nightTransition * 0.2);
        this.ctx.beginPath();
        this.ctx.arc(artX + artW / 2, artY + artH / 2, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Accent lines
        this.ctx.strokeStyle = this.lerpColor('#da9aba', '#ba7a9a', this.nightTransition * 0.2);
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(artX + 10, artY + artH - 15);
        this.ctx.lineTo(artX + artW - 10, artY + artH - 15);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(artX + 15, artY + artH - 25);
        this.ctx.lineTo(artX + artW - 15, artY + artH - 25);
        this.ctx.stroke();
    }

    drawRealisticLamp(floorY) {
        const lampX = 410;
        const lampY = floorY - 155;
        const lampBaseW = 38;
        
        // Lamp shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.25 * this.nightTransition})`;
        this.ctx.filter = 'blur(8px)';
        this.ctx.fillRect(lampX - 5, floorY - 8, lampBaseW + 10, 12);
        this.ctx.filter = 'none';
        
        // Lamp base with realistic metal finish
        const baseGradient = this.ctx.createLinearGradient(lampX, lampY + 50, lampX + lampBaseW, lampY + 50);
        baseGradient.addColorStop(0, this.lerpColor('#4a3a2a', '#2a1a0a', this.nightTransition * 0.4));
        baseGradient.addColorStop(0.5, this.lerpColor('#5a4a3a', '#3a2a1a', this.nightTransition * 0.3));
        baseGradient.addColorStop(1, this.lerpColor('#4a3a2a', '#2a1a0a', this.nightTransition * 0.4));
        this.ctx.fillStyle = baseGradient;
        this.ctx.fillRect(lampX, lampY + 50, lampBaseW, 15);
        
        // Base detail (weight ring)
        this.ctx.strokeStyle = this.lerpColor('#6a5a4a', '#4a3a2a', this.nightTransition * 0.3);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(lampX + 3, lampY + 52, lampBaseW - 6, 11);
        
        // Lamp pole with metallic gradient
        const poleGradient = this.ctx.createLinearGradient(
            lampX + lampBaseW / 2 - 3, lampY,
            lampX + lampBaseW / 2 + 3, lampY
        );
        poleGradient.addColorStop(0, this.lerpColor('#5a4a3a', '#3a2a1a', this.nightTransition * 0.4));
        poleGradient.addColorStop(0.5, this.lerpColor('#6a5a4a', '#4a3a2a', this.nightTransition * 0.3));
        poleGradient.addColorStop(1, this.lerpColor('#5a4a3a', '#3a2a1a', this.nightTransition * 0.4));
        this.ctx.fillStyle = poleGradient;
        this.ctx.fillRect(lampX + lampBaseW / 2 - 3, lampY, 6, 50);
        
        // Pole highlight
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * (1 - this.nightTransition)})`;
        this.ctx.fillRect(lampX + lampBaseW / 2 - 3, lampY, 2, 50);
        
        // Lamp shade with realistic fabric texture
        const shadeTopW = 12;
        const shadeBottomW = 34;
        const shadeH = 36;
        const shadeX = lampX + lampBaseW / 2;
        
        // Shade gradient
        const shadeGradient = this.ctx.createLinearGradient(
            shadeX - shadeBottomW / 2, lampY - shadeH,
            shadeX + shadeBottomW / 2, lampY - shadeH
        );
        shadeGradient.addColorStop(0, this.lerpColor('#9a7a5a', '#6a4a2a', this.nightTransition * 0.4));
        shadeGradient.addColorStop(0.5, this.lerpColor('#aa8a6a', '#7a5a3a', this.nightTransition * 0.3));
        shadeGradient.addColorStop(1, this.lerpColor('#9a7a5a', '#6a4a2a', this.nightTransition * 0.4));
        
        this.ctx.fillStyle = shadeGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(shadeX - shadeTopW / 2, lampY - shadeH);
        this.ctx.lineTo(shadeX - shadeBottomW / 2, lampY);
        this.ctx.lineTo(shadeX + shadeBottomW / 2, lampY);
        this.ctx.lineTo(shadeX + shadeTopW / 2, lampY - shadeH);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Shade texture (fabric ribs)
        this.ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const yPos = lampY - shadeH + (shadeH / 6) * i;
            const leftW = shadeTopW / 2 + ((shadeBottomW - shadeTopW) / 2) * (i / 6);
            const rightW = leftW;
            
            this.ctx.beginPath();
            this.ctx.moveTo(shadeX - leftW, yPos);
            this.ctx.lineTo(shadeX + rightW, yPos);
            this.ctx.stroke();
        }
        
        // Shade top rim
        this.ctx.fillStyle = this.lerpColor('#7a5a3a', '#4a2a0a', this.nightTransition * 0.4);
        this.ctx.fillRect(shadeX - shadeTopW / 2 - 2, lampY - shadeH - 3, shadeTopW + 4, 3);
        
        // Shade bottom rim
        this.ctx.fillStyle = this.lerpColor('#7a5a3a', '#4a2a0a', this.nightTransition * 0.4);
        this.ctx.fillRect(shadeX - shadeBottomW / 2, lampY, shadeBottomW, 3);
        
        // Warm lamp glow (multi-layered for realism)
        if (this.nightTransition > 0.2) {
            const glowIntensity = 0.15 + Math.sin(this.time * 0.6) * 0.05;
            const lampGlowIntensity = glowIntensity * this.nightTransition;
            
            // Glow layer 1 (widest)
            this.ctx.fillStyle = `rgba(255, 200, 100, ${lampGlowIntensity * 0.12})`;
            this.ctx.beginPath();
            this.ctx.arc(shadeX, lampY - shadeH / 2, 130, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow layer 2
            this.ctx.fillStyle = `rgba(255, 210, 120, ${lampGlowIntensity * 0.18})`;
            this.ctx.beginPath();
            this.ctx.arc(shadeX, lampY - shadeH / 2, 85, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow layer 3 (closest)
            this.ctx.fillStyle = `rgba(255, 220, 150, ${lampGlowIntensity * 0.25})`;
            this.ctx.beginPath();
            this.ctx.arc(shadeX, lampY - shadeH / 2, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Light bulb (visible through bottom of shade)
        const bulbGlow = this.nightTransition > 0.2 ? 1 : 0.3;
        this.ctx.fillStyle = `rgba(255, 240, 200, ${bulbGlow})`;
        this.ctx.beginPath();
        this.ctx.arc(shadeX, lampY - 8, 7, 0, Math.PI * 2);
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
        const signX = this.canvas.width / 2 - 210;
        const signY = this.floatingSignY;
        const signW = 420;
        const signH = 75;
        
        // Animated rope physics
        const ropeSwing1 = Math.sin(this.time * 1.8) * 3;
        const ropeSwing2 = Math.sin(this.time * 1.8 + Math.PI) * 3;
        
        // Rope with realistic thickness and shading
        this.ctx.strokeStyle = this.lerpColor('#9B8365', '#7B6345', this.nightTransition * 0.3);
        this.ctx.lineWidth = 4;
        
        // Left rope
        this.ctx.beginPath();
        this.ctx.moveTo(signX + 105, 0);
        this.ctx.quadraticCurveTo(signX + 105 + ropeSwing1, signY / 2, signX + 105, signY + 5);
        this.ctx.stroke();
        
        // Right rope
        this.ctx.beginPath();
        this.ctx.moveTo(signX + signW - 105, 0);
        this.ctx.quadraticCurveTo(signX + signW - 105 + ropeSwing2, signY / 2, signX + signW - 105, signY + 5);
        this.ctx.stroke();
        
        // Rope highlights
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - this.nightTransition)})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(signX + 104, 0);
        this.ctx.quadraticCurveTo(signX + 104 + ropeSwing1, signY / 2, signX + 104, signY + 5);
        this.ctx.stroke();
        
        // 3D wooden sign - multiple depth layers
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * this.nightTransition})`;
        this.ctx.filter = 'blur(10px)';
        this.ctx.fillRect(signX + 12, signY + 12, signW, signH);
        this.ctx.filter = 'none';
        
        // Sign depth layer 1 (darkest)
        const depthGradient1 = this.ctx.createLinearGradient(signX + 10, signY + 10, signX + signW, signY + signH);
        depthGradient1.addColorStop(0, this.lerpColor('#5a3a1a', '#3a1a0a', this.nightTransition * 0.5));
        depthGradient1.addColorStop(1, this.lerpColor('#4a2a0a', '#2a1a00', this.nightTransition * 0.5));
        this.ctx.fillStyle = depthGradient1;
        this.ctx.fillRect(signX + 10, signY + 10, signW, signH);
        
        // Sign depth layer 2
        const depthGradient2 = this.ctx.createLinearGradient(signX + 6, signY + 6, signX + signW, signY + signH);
        depthGradient2.addColorStop(0, this.lerpColor('#6a4a2a', '#4a2a0a', this.nightTransition * 0.4));
        depthGradient2.addColorStop(1, this.lerpColor('#5a3a1a', '#3a1a00', this.nightTransition * 0.4));
        this.ctx.fillStyle = depthGradient2;
        this.ctx.fillRect(signX + 6, signY + 6, signW, signH);
        
        // Main sign face with realistic wood gradient
        const signGradient = this.ctx.createLinearGradient(signX, signY, signX + signW, signY + signH);
        signGradient.addColorStop(0, this.lerpColor('#9B6B3B', '#6B3B0B', this.nightTransition * 0.3));
        signGradient.addColorStop(0.3, this.lerpColor('#8B5B2B', '#5B2B00', this.nightTransition * 0.3));
        signGradient.addColorStop(0.7, this.lerpColor('#8B5B2B', '#5B2B00', this.nightTransition * 0.3));
        signGradient.addColorStop(1, this.lerpColor('#7B4B1B', '#4B1B00', this.nightTransition * 0.3));
        this.ctx.fillStyle = signGradient;
        this.ctx.fillRect(signX, signY, signW, signH);
        
        // Realistic wood grain
        for (let i = 0; i < signH; i += 18) {
            const grainY = signY + i;
            this.ctx.strokeStyle = `rgba(90, 50, 20, ${0.15 + Math.random() * 0.1})`;
            this.ctx.lineWidth = 2 + Math.random();
            this.ctx.beginPath();
            this.ctx.moveTo(signX, grainY);
            this.ctx.lineTo(signX + signW, grainY + Math.sin(i) * 3);
            this.ctx.stroke();
            
            // Fine grain detail
            for (let x = 0; x < signW; x += 60) {
                this.ctx.strokeStyle = `rgba(110, 70, 40, ${0.08 + Math.random() * 0.05})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(signX + x, grainY);
                this.ctx.lineTo(signX + x + 30, grainY + 5);
                this.ctx.stroke();
            }
        }
        
        // Wood knots
        const knots = [
            [signX + 80, signY + 25, 8],
            [signX + signW - 110, signY + 45, 10],
            [signX + 230, signY + 35, 7]
        ];
        
        knots.forEach(([kx, ky, kr]) => {
            this.ctx.fillStyle = `rgba(60, 30, 10, ${0.3 + Math.random() * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(kx, ky, kr, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Knot ring detail
            this.ctx.strokeStyle = `rgba(80, 40, 15, 0.4)`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(kx, ky, kr * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Sign frame (dark wood border)
        const frameGradient = this.ctx.createLinearGradient(signX, signY, signX + signW, signY);
        frameGradient.addColorStop(0, this.lerpColor('#5a3a1a', '#2a1a00', this.nightTransition * 0.5));
        frameGradient.addColorStop(0.5, this.lerpColor('#4a2a0a', '#1a0a00', this.nightTransition * 0.5));
        frameGradient.addColorStop(1, this.lerpColor('#5a3a1a', '#2a1a00', this.nightTransition * 0.5));
        this.ctx.strokeStyle = frameGradient;
        this.ctx.lineWidth = 7;
        this.ctx.strokeRect(signX, signY, signW, signH);
        
        // Inner frame detail
        this.ctx.strokeStyle = this.lerpColor('#6a4a2a', '#3a1a00', this.nightTransition * 0.4);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(signX + 5, signY + 5, signW - 10, signH - 10);
        
        // Text with realistic embossed effect
        this.ctx.shadowColor = `rgba(0, 0, 0, ${0.8 * this.nightTransition})`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 4;
        this.ctx.shadowOffsetY = 4;
        
        // Text background shadow (embossed effect)
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
        this.ctx.font = 'bold 27px Georgia, serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Mayowa's Room", signX + signW / 2 + 2, signY + 38);
        
        // Main text (gold)
        this.ctx.fillStyle = this.lerpColor('#FFD700', '#DAA520', this.nightTransition * 0.2);
        this.ctx.fillText("Mayowa's Room", signX + signW / 2, signY + 36);
        
        // Text highlight
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = -1;
        this.ctx.shadowOffsetY = -1;
        this.ctx.shadowColor = `rgba(255, 255, 200, ${0.4 * (1 - this.nightTransition)})`;
        this.ctx.fillStyle = this.lerpColor('#FFEA00', '#F0D700', this.nightTransition * 0.1);
        this.ctx.fillText("Mayowa's Room", signX + signW / 2, signY + 36);
        
        // Subtitle
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowColor = `rgba(0, 0, 0, ${0.7 * this.nightTransition})`;
        
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.25)`;
        this.ctx.font = '17px Georgia, serif';
        this.ctx.fillText("← About Me | Games →", signX + signW / 2 + 2, signY + 60);
        
        this.ctx.fillStyle = this.lerpColor('#FFF', '#E0E0E0', this.nightTransition * 0.2);
        this.ctx.fillText("← About Me | Games →", signX + signW / 2, signY + 58);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    drawCenterSection() {
        // Empty - just the character
    }

    drawAboutMeSection() {
        const sectionX = this.sections.aboutMe.x - this.cameraX;
        
        if (sectionX > -this.sections.aboutMe.width - 500 && sectionX < this.canvas.width + 500) {
            const panelW = 740;
            const panelH = this.canvas.height - 300;
            const panelX = this.canvas.width / 2 - panelW / 2;
            const panelY = 135;
            
            // Smooth slide animation
            const slideProgress = Math.max(0, Math.min(1, (this.cameraX + 1400) / 400));
            const currentPanelX = panelX - (1 - slideProgress) * 150;
            const currentOpacity = slideProgress;
            
            this.ctx.globalAlpha = currentOpacity;
            
            // 3D panel shadow (realistic)
            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * this.nightTransition})`;
            this.ctx.filter = 'blur(15px)';
            this.ctx.fillRect(currentPanelX + 15, panelY + 15, panelW, panelH);
            this.ctx.filter = 'none';
            
            // Panel glow border
            this.ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
            this.ctx.shadowBlur = 25;
            
            // White panel with slight paper texture
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(currentPanelX, panelY, panelW, panelH);
            
            this.ctx.shadowBlur = 0;
            
            // Panel border (thick, colored)
            const borderGradient = this.ctx.createLinearGradient(currentPanelX, panelY, currentPanelX, panelY + panelH);
            borderGradient.addColorStop(0, '#667eea');
            borderGradient.addColorStop(1, '#764ba2');
            this.ctx.strokeStyle = borderGradient;
            this.ctx.lineWidth = 6;
            this.ctx.strokeRect(currentPanelX, panelY, panelW, panelH);
            
            // Title
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 36px Poppins, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Welcome to Mayowa's Home!", currentPanelX + panelW / 2, panelY + 50);
            
            this.ctx.font = 'bold 26px Poppins, sans-serif';
            this.ctx.fillText('About Me', currentPanelX + panelW / 2, panelY + 88);
            
            // Content
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.font = '16px Poppins, sans-serif';
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
                this.ctx.fillText(line, currentPanelX + 38, panelY + 125 + i * 25);
            });
            
            // Contact button with gradient
            const btnX = currentPanelX + panelW / 2 - 130;
            const btnY = panelY + panelH - 65;
            const btnW = 260;
            const btnH = 50;
            
            // Button shadow
            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * this.nightTransition})`;
            this.ctx.filter = 'blur(6px)';
            this.ctx.fillRect(btnX + 5, btnY + 5, btnW, btnH);
            this.ctx.filter = 'none';
            
            // Button gradient
            const btnGradient = this.ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
            btnGradient.addColorStop(0, '#667eea');
            btnGradient.addColorStop(1, '#764ba2');
            this.ctx.fillStyle = btnGradient;
            this.ctx.fillRect(btnX, btnY, btnW, btnH);
            
            // Button highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(btnX, btnY, btnW, btnH / 2);
            
            // Button border
            this.ctx.strokeStyle = '#5569d5';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(btnX, btnY, btnW, btnH);
            
            // Button text
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 18px Poppins, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 4;
            this.ctx.fillText('📧 Send Me a Message', btnX + btnW / 2, btnY + 32);
            this.ctx.shadowBlur = 0;
            
            window.contactButton = { x: btnX, y: btnY, width: btnW, height: btnH };
            
            this.ctx.globalAlpha = 1;
        }
    }

    drawGamesSection() {
        const sectionX = this.sections.games.x - this.cameraX;
        
        if (sectionX > -this.sections.games.width - 500 && sectionX < this.canvas.width + 500) {
            const panelW = 960;
            const panelH = this.canvas.height - 300;
            const panelX = this.canvas.width / 2 - panelW / 2;
            const panelY = 135;
            
            // Smooth slide animation
            const slideProgress = Math.max(0, Math.min(1, (this.cameraX - 1400) / 400));
            const currentPanelX = panelX + (1 - slideProgress) * 150;
            const currentOpacity = slideProgress;
            
            this.ctx.globalAlpha = currentOpacity;
            
            // 3D shadow
            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * this.nightTransition})`;
            this.ctx.filter = 'blur(15px)';
            this.ctx.fillRect(currentPanelX + 15, panelY + 15, panelW, panelH);
            this.ctx.filter = 'none';
            
            // Panel glow
            this.ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
            this.ctx.shadowBlur = 25;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(currentPanelX, panelY, panelW, panelH);
            
            this.ctx.shadowBlur = 0;
            
            // Border
            const borderGradient = this.ctx.createLinearGradient(currentPanelX, panelY, currentPanelX, panelY + panelH);
            borderGradient.addColorStop(0, '#667eea');
            borderGradient.addColorStop(1, '#764ba2');
            this.ctx.strokeStyle = borderGradient;
            this.ctx.lineWidth = 6;
            this.ctx.strokeRect(currentPanelX, panelY, panelW, panelH);
            
            // Title
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 40px Poppins, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('My Games', currentPanelX + panelW / 2, panelY + 58);
            
            const games = [
                { name: 'Flappy Bird', icon: '🐦', color: '#87CEEB' },
                { name: 'Panda', icon: '🐼', color: '#90EE90' },
                { name: 'Pong', icon: '🏓', color: '#FFB6C1' },
                { name: 'Pong 2P', icon: '🏓', color: '#DDA0DD' },
                { name: 'Snake Race', icon: '🐍', color: '#98FB98' }
            ];
            
            window.gameCards = [];
            
            const cardW = 250;
            const cardH = 200;
            const gap = 42;
            const startX = currentPanelX + 75;
            const startY = panelY + 120;
            
            games.forEach((game, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = startX + col * (cardW + gap);
                const y = startY + row * (cardH + gap);
                
                // Animated card float
                const cardFloat = Math.sin(this.time * 1.5 + i * 0.8) * 4;
                const currentY = y + cardFloat;
                
                // Card shadow (realistic depth)
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * this.nightTransition})`;
                this.ctx.filter = 'blur(8px)';
                this.ctx.fillRect(x + 8, currentY + 8, cardW, cardH);
                this.ctx.filter = 'none';
                
                // Card background
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.fillRect(x, currentY, cardW, cardH);
                
                // Thumbnail with gradient
                const thumbGradient = this.ctx.createLinearGradient(x, currentY, x, currentY + 135);
                const baseColor = game.color;
                thumbGradient.addColorStop(0, baseColor);
                thumbGradient.addColorStop(1, this.adjustBrightness(baseColor, -25));
                this.ctx.fillStyle = thumbGradient;
                this.ctx.fillRect(x, currentY, cardW, 135);
                
                // Icon with subtle shadow
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                this.ctx.shadowBlur = 6;
                this.ctx.shadowOffsetY = 3;
                this.ctx.font = '70px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(game.icon, x + cardW / 2, currentY + 88);
                this.ctx.shadowBlur = 0;
                this.ctx.shadowOffsetY = 0;
                
                // Title
                this.ctx.fillStyle = '#2a2a2a';
                this.ctx.font = 'bold 20px Poppins, sans-serif';
                this.ctx.fillText(game.name, x + cardW / 2, currentY + 160);
                
                // Subtitle
                this.ctx.fillStyle = '#666';
                this.ctx.font = '15px Poppins, sans-serif';
                this.ctx.fillText('Click to play', x + cardW / 2, currentY + 182);
                
                // Card border
                this.ctx.strokeStyle = '#e0e0e0';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, currentY, cardW, cardH);
                
                window.gameCards[i] = { x, y: currentY, width: cardW, height: cardH, game: game.name };
            });
            
            // ARCADE MACHINE in Games Section!
            this.drawRealisticArcadeMachine(currentPanelX, panelY, panelH);
            
            this.ctx.globalAlpha = 1;
        }
    }

    drawRealisticArcadeMachine(panelX, panelY, panelH) {
        const arcadeX = panelX + 730;
        const arcadeY = panelY + panelH - 320;
        const arcadeW = 180;
        const arcadeH = 300;
        
        // Arcade shadow
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * this.nightTransition})`;
        this.ctx.filter = 'blur(10px)';
        this.ctx.fillRect(arcadeX + 10, arcadeY + 10, arcadeW, arcadeH);
        this.ctx.filter = 'none';
        
        // Arcade cabinet body
        const cabinetGradient = this.ctx.createLinearGradient(arcadeX, arcadeY, arcadeX + arcadeW, arcadeY);
        cabinetGradient.addColorStop(0, this.lerpColor('#2a2a4a', '#1a1a3a', this.nightTransition * 0.4));
        cabinetGradient.addColorStop(0.5, this.lerpColor('#3a3a5a', '#2a2a4a', this.nightTransition * 0.3));
        cabinetGradient.addColorStop(1, this.lerpColor('#2a2a4a', '#1a1a3a', this.nightTransition * 0.4));
        this.ctx.fillStyle = cabinetGradient;
        
        // Top section (monitor area)
        this.ctx.fillRect(arcadeX, arcadeY, arcadeW, 160);
        
        // Control panel section
        this.ctx.fillRect(arcadeX + 15, arcadeY + 160, arcadeW - 30, 60);
        
        // Bottom cabinet
        this.ctx.fillRect(arcadeX + 20, arcadeY + 220, arcadeW - 40, 80);
        
        // Arcade screen
        const screenX = arcadeX + 20;
        const screenY = arcadeY + 25;
        const screenW = arcadeW - 40;
        const screenH = 110;
        
        // Screen bezel
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(screenX - 5, screenY - 5, screenW + 10, screenH + 10);
        
        // Glowing screen
        const screenGlow = 0.8 + Math.sin(this.time * 2) * 0.15;
        const screenGradient = this.ctx.createRadialGradient(
            screenX + screenW / 2, screenY + screenH / 2, 0,
            screenX + screenW / 2, screenY + screenH / 2, screenW / 2
        );
        screenGradient.addColorStop(0, `rgba(100, 220, 255, ${screenGlow})`);
        screenGradient.addColorStop(0.7, `rgba(60, 150, 255, ${screenGlow * 0.8})`);
        screenGradient.addColorStop(1, `rgba(40, 100, 200, ${screenGlow * 0.6})`);
        this.ctx.fillStyle = screenGradient;
        this.ctx.fillRect(screenX, screenY, screenW, screenH);
        
        // Retro game on screen
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PRESS', screenX + screenW / 2, screenY + screenH / 2 - 10);
        this.ctx.fillText('START', screenX + screenW / 2, screenY + screenH / 2 + 15);
        
        // Screen scanlines
        for (let i = 0; i < screenH; i += 4) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(screenX, screenY + i, screenW, 2);
        }
        
        // Screen reflection
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(screenX + 5, screenY + 5, screenW / 2, screenH / 2);
        
        // Screen glow on cabinet
        if (this.nightTransition > 0.3) {
            this.ctx.fillStyle = `rgba(100, 180, 255, ${0.15 * screenGlow * this.nightTransition})`;
            this.ctx.beginPath();
            this.ctx.arc(screenX + screenW / 2, screenY + screenH / 2, 100, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Control panel
        const panelGradient = this.ctx.createLinearGradient(
            arcadeX + 15, arcadeY + 160,
            arcadeX + 15, arcadeY + 220
        );
        panelGradient.addColorStop(0, this.lerpColor('#4a4a6a', '#3a3a5a', this.nightTransition * 0.3));
        panelGradient.addColorStop(1, this.lerpColor('#3a3a5a', '#2a2a4a', this.nightTransition * 0.3));
        this.ctx.fillStyle = panelGradient;
        this.ctx.fillRect(arcadeX + 15, arcadeY + 160, arcadeW - 30, 60);
        
        // Joystick
        const joyX = arcadeX + 50;
        const joyY = arcadeY + 185;
        
        // Joystick base
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.beginPath();
        this.ctx.arc(joyX, joyY, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Joystick ball
        const joyBallGradient = this.ctx.createRadialGradient(joyX - 3, joyY - 3, 0, joyX, joyY, 12);
        joyBallGradient.addColorStop(0, '#ff4444');
        joyBallGradient.addColorStop(1, '#aa0000');
        this.ctx.fillStyle = joyBallGradient;
        this.ctx.beginPath();
        this.ctx.arc(joyX, joyY, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Joystick highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(joyX - 4, joyY - 4, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Action buttons
        const buttonColors = [
            { x: arcadeX + 110, y: arcadeY + 175, color: '#ffff00' },
            { x: arcadeX + 140, y: arcadeY + 175, color: '#00ff00' },
            { x: arcadeX + 125, y: arcadeY + 200, color: '#ff00ff' }
        ];
        
        buttonColors.forEach(btn => {
            // Button shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(btn.x + 2, btn.y + 2, 14, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Button
            const btnGradient = this.ctx.createRadialGradient(btn.x - 3, btn.y - 3, 0, btn.x, btn.y, 14);
            btnGradient.addColorStop(0, this.adjustBrightness(btn.color, 50));
            btnGradient.addColorStop(1, btn.color);
            this.ctx.fillStyle = btnGradient;
            this.ctx.beginPath();
            this.ctx.arc(btn.x, btn.y, 14, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Button highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(btn.x - 4, btn.y - 4, 6, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Coin slot
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(arcadeX + arcadeW / 2 - 20, arcadeY + 245, 40, 8);
        
        // Coin slot label
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('INSERT COIN', arcadeX + arcadeW / 2, arcadeY + 265);
        
        // Side panels with vents
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 6; i++) {
            this.ctx.fillRect(arcadeX + 25, arcadeY + 235 + i * 8, 20, 4);
            this.ctx.fillRect(arcadeX + arcadeW - 45, arcadeY + 235 + i * 8, 20, 4);
        }
        
        // Marquee lights (blinking)
        const lightOn = Math.floor(this.time * 3) % 2 === 0;
        const lightPositions = [arcadeX + 20, arcadeX + arcadeW / 2, arcadeX + arcadeW - 20];
        
        lightPositions.forEach((lx, i) => {
            const isOn = lightOn === (i % 2 === 0);
            this.ctx.fillStyle = isOn ? '#ffff00' : '#888800';
            this.ctx.beginPath();
            this.ctx.arc(lx, arcadeY + 10, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (isOn) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(lx, arcadeY + 10, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    adjustBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// Realistic Character with Movement
class Character {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Position
        this.worldX = 0; // Character's position in world space
        this.x = canvas.width / 2 - 200; // Screen position
        this.y = canvas.height - 250;
        this.targetY = this.y;
        this.velocityY = 0;
        this.velocityX = 0;
        
        // Movement
        this.isWalking = false;
        this.facingRight = true;
        this.walkSpeed = 5;
        this.isJumping = false;
        
        // Animation
        this.walkCycle = 0;
        this.idleAnimation = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        
        // Interaction
        this.isHovered = false;
        this.interactionRadius = 90;
        
        this.phrases = [
            "Welcome! 🏠",
            "Hey there! 👋",
            "Explore my room!",
            "Check out my games! 🎮",
            "Use arrow keys to move!"
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
                }, 180);
            }
        }, 3500);
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
            
            const dist = Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - (this.y - 70), 2));
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
        return x >= this.x - 50 && x <= this.x + 50 && 
               y >= this.y - 140 && y <= this.y + 10;
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
        if (!this.isJumping && this.velocityY === 0) {
            this.velocityY = -14;
            this.isJumping = true;
        }
    }

    showSpeech(text) {
        const bubble = document.getElementById('speechBubble');
        const speechText = document.getElementById('speechText');
        
        if (!bubble || !speechText) return;
        
        speechText.textContent = text;
        bubble.classList.remove('hidden');
        bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        
        bubble.style.left = this.x + 'px';
        bubble.style.top = (this.y - 170) + 'px';
        
        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';
        }, 20);
        
        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8)';
            setTimeout(() => {
                bubble.classList.add('hidden');
            }, 300);
        }, 2800);
    }

    update() {
        this.idleAnimation += 0.04;
        this.isWalking = false;
        
        // Character movement with camera following
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.isWalking = true;
            this.facingRight = false;
            this.walkCycle += 0.2;
            
            if (window.sceneManager) {
                sceneManager.moveCamera(-this.walkSpeed);
            }
        }
        
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.isWalking = true;
            this.facingRight = true;
            this.walkCycle += 0.2;
            
            if (window.sceneManager) {
                sceneManager.moveCamera(this.walkSpeed);
            }
        }
        
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && !this.isJumping && this.velocityY === 0) {
            this.velocityY = -14;
            this.isJumping = true;
        }
        
        // Gravity and jump physics
        this.velocityY += 0.8;
        this.y += this.velocityY;
        
        const groundY = this.canvas.height - 250;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        // Breathing animation when idle
        if (!this.isWalking && !this.isJumping) {
            this.y = groundY + Math.sin(this.idleAnimation) * 2;
        }
    }

    draw() {
        this.ctx.save();
        
        const x = this.x;
        const y = this.y;
        
        // Interaction glow when hovered
        if (this.isHovered) {
            this.ctx.fillStyle = 'rgba(102, 126, 234, 0.25)';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 70, this.interactionRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Realistic shadow with blur
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.filter = 'blur(4px)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 8, 35, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.filter = 'none';
        
        // Flip character if facing left
        if (!this.facingRight) {
            this.ctx.translate(x * 2, 0);
            this.ctx.scale(-1, 1);
        }
        
        // Walking animation offsets
        const legSwing = this.isWalking ? Math.sin(this.walkCycle) * 8 : 0;
        const armSwing = this.isWalking ? Math.sin(this.walkCycle + Math.PI) * 6 : Math.sin(this.idleAnimation * 2) * 2;
        
        // Realistic character proportions (taller, more detailed)
        
        // Legs with jeans texture
        this.ctx.fillStyle = '#4A90E2';
        this.ctx.fillRect(x - 17, y - 68, 14, 63);
        this.ctx.fillRect(x + 3, y - 68 + legSwing, 14, 63 - Math.abs(legSwing));
        
        // Leg shading
        this.ctx.fillStyle = 'rgba(0, 0, 50, 0.2)';
        this.ctx.fillRect(x - 15, y - 66, 4, 61);
        this.ctx.fillRect(x + 5, y - 66 + legSwing, 4, 61 - Math.abs(legSwing));
        
        // Knees
        this.ctx.strokeStyle = 'rgba(0, 0, 100, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 17, y - 35);
        this.ctx.lineTo(x - 3, y - 35);
        this.ctx.moveTo(x + 3, y - 35 + legSwing);
        this.ctx.lineTo(x + 17, y - 35 + legSwing);
        this.ctx.stroke();
        
        // Shoes (white sneakers with detail)
        this.ctx.fillStyle = '#f8f8f8';
        this.ctx.fillRect(x - 20, y - 5, 17, 10);
        this.ctx.fillRect(x + 3, y - 5 + legSwing, 17, 10);
        
        // Shoe soles (black)
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(x - 20, y + 5, 17, 3);
        this.ctx.fillRect(x + 3, y + 5 + legSwing, 17, 3);
        
        // Shoe details (laces)
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 16, y - 2);
        this.ctx.lineTo(x - 8, y);
        this.ctx.moveTo(x + 7, y - 2 + legSwing);
        this.ctx.lineTo(x + 15, y + legSwing);
        this.ctx.stroke();
        
        // Torso (hoodie with realistic shading)
        const torsoGradient = this.ctx.createLinearGradient(x - 26, y - 120, x + 26, y - 120);
        torsoGradient.addColorStop(0, '#2E5090');
        torsoGradient.addColorStop(0.5, '#3E6090');
        torsoGradient.addColorStop(1, '#2E5090');
        this.ctx.fillStyle = torsoGradient;
        this.ctx.fillRect(x - 26, y - 120, 52, 52);
        
        // Hoodie pocket with depth
        this.ctx.strokeStyle = '#1E4080';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 16, y - 95, 32, 20);
        
        // Pocket opening
        this.ctx.fillStyle = '#1E4080';
        this.ctx.fillRect(x - 2, y - 92, 4, 14);
        
        // Hoodie strings
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8, y - 118);
        this.ctx.lineTo(x - 8, y - 110);
        this.ctx.moveTo(x + 8, y - 118);
        this.ctx.lineTo(x + 8, y - 110);
        this.ctx.stroke();
        
        // Torso shading
        this.ctx.fillStyle = 'rgba(0, 0, 50, 0.15)';
        this.ctx.fillRect(x + 6, y - 118, 20, 50);
        
        // Arms with realistic movement
        const leftArmY = y - 115 + armSwing;
        const rightArmY = y - 115 - armSwing;
        
        // Left arm
        this.ctx.fillStyle = '#2E5090';
        this.ctx.fillRect(x - 38, leftArmY, 12, 48);
        
        // Left arm highlight
        this.ctx.fillStyle = '#3E6090';
        this.ctx.fillRect(x - 38, leftArmY, 3, 48);
        
        // Right arm
        this.ctx.fillStyle = '#2E5090';
        this.ctx.fillRect(x + 26, rightArmY, 12, 48);
        
        // Right arm highlight
        this.ctx.fillStyle = '#3E6090';
        this.ctx.fillRect(x + 26, rightArmY, 3, 48);
        
        // Hands (realistic skin tone)
        const handGradient = this.ctx.createLinearGradient(x - 38, y - 70, x - 26, y - 70);
        handGradient.addColorStop(0, '#C49A6C');
        handGradient.addColorStop(1, '#D4AA7C');
        this.ctx.fillStyle = handGradient;
        this.ctx.fillRect(x - 38, y - 70 + armSwing, 12, 16);
        this.ctx.fillRect(x + 26, y - 70 - armSwing, 12, 16);
        
        // Finger details
        this.ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - 35 + i * 4, y - 62 + armSwing);
            this.ctx.lineTo(x - 35 + i * 4, y - 56 + armSwing);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + 29 + i * 4, y - 62 - armSwing);
            this.ctx.lineTo(x + 29 + i * 4, y - 56 - armSwing);
            this.ctx.stroke();
        }
        
        // Neck
        this.ctx.fillStyle = '#C49A6C';
        this.ctx.fillRect(x - 12, y - 124, 24, 12);
        
        // Neck shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(x - 10, y - 116, 20, 4);
        
        // Head (realistic proportions and shading)
        const headGradient = this.ctx.createRadialGradient(x - 8, y - 142, 0, x, y - 138, 22);
        headGradient.addColorStop(0, '#D4AA7C');
        headGradient.addColorStop(0.7, '#C49A6C');
        headGradient.addColorStop(1, '#B48A5C');
        this.ctx.fillStyle = headGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 138, 22, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair (realistic afro with texture)
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 146, 28, Math.PI, 0);
        this.ctx.fill();
        
        // Hair sides
        this.ctx.beginPath();
        this.ctx.arc(x - 24, y - 138, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 24, y - 138, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair texture (realistic curls)
        this.ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI - Math.PI / 2;
            const startR = 18;
            const endR = 28;
            const startX = x + Math.cos(angle) * startR;
            const startY = y - 146 + Math.sin(angle) * startR;
            const endX = x + Math.cos(angle) * endR;
            const endY = y - 146 + Math.sin(angle) * endR;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        // Eyes (realistic with iris and pupil)
        if (!this.isBlinking) {
            // Eye whites
            this.ctx.fillStyle = '#FFF';
            this.ctx.beginPath();
            this.ctx.ellipse(x - 8, y - 141, 5, 6, 0, 0, Math.PI * 2);
            this.ctx.ellipse(x + 8, y - 141, 5, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Iris
            this.ctx.fillStyle = '#4a3a2a';
            this.ctx.beginPath();
            this.ctx.arc(x - 8, y - 140, 3.5, 0, Math.PI * 2);
            this.ctx.arc(x + 8, y - 140, 3.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(x - 8, y - 140, 2, 0, Math.PI * 2);
            this.ctx.arc(x + 8, y - 140, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye highlights (realistic reflection)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(x - 9, y - 142, 1.5, 0, Math.PI * 2);
            this.ctx.arc(x + 7, y - 142, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Blinking (closed eyes)
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 13, y - 140);
            this.ctx.lineTo(x - 3, y - 140);
            this.ctx.moveTo(x + 3, y - 140);
            this.ctx.lineTo(x + 13, y - 140);
            this.ctx.stroke();
        }
        
        // Eyebrows with realistic arch
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 12, y - 148);
        this.ctx.quadraticCurveTo(x - 8, y - 150, x - 3, y - 148);
        this.ctx.moveTo(x + 3, y - 148);
        this.ctx.quadraticCurveTo(x + 8, y - 150, x + 12, y - 148);
        this.ctx.stroke();
        
        // Nose (realistic with shading)
        const noseGradient = this.ctx.createLinearGradient(x + 2, y - 133, x + 7, y - 133);
        noseGradient.addColorStop(0, '#B48A5C');
        noseGradient.addColorStop(1, '#C49A6C');
        this.ctx.fillStyle = noseGradient;
        this.ctx.fillRect(x + 2, y - 135, 5, 10);
        
        // Nostril
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(x + 3, y - 126, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile (realistic curve)
        this.ctx.strokeStyle = '#8a5a3a';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 128, 10, 0.15, Math.PI - 0.15);
        this.ctx.stroke();
        
        // Lips highlight
        this.ctx.strokeStyle = 'rgba(255, 200, 180, 0.3)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 129, 9, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
}

console.log('✅ Realistic character.js loaded successfully!');
