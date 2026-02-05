class Panda {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.panda = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.bamboo = this.generateBamboo();
        this.score = 0;
        this.gameOver = false;
        this.speed = 10;
        this.lastUpdateTime = 0;
        this.fatLevel = 0; // 0 = normal, increases with eating
        
        this.setupControls();
    }

    setupControls() {
        this.handleKeyPress = (e) => {
            if (this.gameOver) return;
            
            switch(e.code) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.handleKeyPress);
    }

    reset() {
        this.panda = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.bamboo = this.generateBamboo();
        this.score = 0;
        this.gameOver = false;
        this.lastUpdateTime = 0;
        this.fatLevel = 0;
        this.updateScoreDisplay();
    }

    generateBamboo() {
        let bamboo;
        do {
            bamboo = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.panda.some(segment => segment.x === bamboo.x && segment.y === bamboo.y));
        return bamboo;
    }

    update(timestamp) {
        if (this.gameOver) return;
        
        if (timestamp - this.lastUpdateTime < 1000 / this.speed) {
            return;
        }
        this.lastUpdateTime = timestamp;
        
        this.direction = { ...this.nextDirection };
        
        const head = {
            x: this.panda[0].x + this.direction.x,
            y: this.panda[0].y + this.direction.y
        };
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver = true;
            return;
        }
        
        // Self collision
        if (this.panda.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }
        
        this.panda.unshift(head);
        
        // Bamboo collision
        if (head.x === this.bamboo.x && head.y === this.bamboo.y) {
            this.score += 10;
            this.bamboo = this.generateBamboo();
            this.updateScoreDisplay();
            
            // Increase fat level
            this.fatLevel = Math.min(3, this.fatLevel + 0.3);
            
            if (this.speed < 15) {
                this.speed += 0.5;
            }
            
            if (window.audioManager) {
                audioManager.play('score');
            }
        } else {
            this.panda.pop();
            // Slowly decrease fat level
            this.fatLevel = Math.max(0, this.fatLevel - 0.05);
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#E8F5E9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#C8E6C9';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw panda
        this.panda.forEach((segment, index) => {
            if (index === 0) {
                // Panda head with fat level
                this.drawPandaHead(segment.x, segment.y);
            } else {
                // Body segments
                this.ctx.fillStyle = '#000';
                const size = this.gridSize - 2 - (index * 0.5);
                this.ctx.fillRect(
                    segment.x * this.gridSize + (this.gridSize - size) / 2,
                    segment.y * this.gridSize + (this.gridSize - size) / 2,
                    size,
                    size
                );
            }
        });
        
        // Draw bamboo
        this.drawBamboo(this.bamboo.x, this.bamboo.y);
        
        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 80, this.canvas.width, 160);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            
            // Fun message based on fat level
            this.ctx.font = '16px Arial';
            if (this.fatLevel > 2) {
                this.ctx.fillText('That panda is STUFFED! 🐼', this.canvas.width / 2, this.canvas.height / 2 + 70);
            } else if (this.fatLevel > 1) {
                this.ctx.fillText('Nice and chubby! 🐼', this.canvas.width / 2, this.canvas.height / 2 + 70);
            }
        }
    }

    drawPandaHead(x, y) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        const baseSize = this.gridSize / 2;
        const fatBonus = this.fatLevel * 2;
        
        // Face (white)
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, baseSize + fatBonus, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Black patches around eyes
        this.ctx.fillStyle = '#000';
        // Left eye patch
        this.ctx.beginPath();
        this.ctx.arc(centerX - 4, centerY - 2, 4 + fatBonus * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right eye patch
        this.ctx.beginPath();
        this.ctx.arc(centerX + 4, centerY - 2, 4 + fatBonus * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes (white dots in black patches)
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 4, centerY - 2, 1.5, 0, Math.PI * 2);
        this.ctx.arc(centerX + 4, centerY - 2, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ears (black)
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 6 - fatBonus * 0.5, centerY - 6 - fatBonus * 0.3, 3, 0, Math.PI * 2);
        this.ctx.arc(centerX + 6 + fatBonus * 0.5, centerY - 6 - fatBonus * 0.3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Nose
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 2, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile (if fat)
        if (this.fatLevel > 1) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY + 2, 3, 0.2, Math.PI - 0.2);
            this.ctx.stroke();
        }
    }

    drawBamboo(x, y) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        // Bamboo stalk (green)
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(centerX - 2, centerY - 8, 4, 16);
        
        // Bamboo segments
        this.ctx.strokeStyle = '#2E7D32';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 3, centerY - 4);
        this.ctx.lineTo(centerX + 3, centerY - 4);
        this.ctx.moveTo(centerX - 3, centerY + 4);
        this.ctx.lineTo(centerX + 3, centerY + 4);
        this.ctx.stroke();
        
        // Leaves
        this.ctx.fillStyle = '#66BB6A';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 4, centerY - 6, 3, 5, -0.5, 0, Math.PI * 2);
        this.ctx.ellipse(centerX + 4, centerY - 4, 3, 5, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score} | Bamboo Eaten: ${this.score / 10}`;
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}
