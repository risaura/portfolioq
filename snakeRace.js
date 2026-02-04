class SnakeRace {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.gridSize = 20;
        this.tileCountX = (this.canvas.width / 2) / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;
        
        // Player 1 (left side)
        this.snake1 = [{ x: 5, y: 10 }];
        this.direction1 = { x: 1, y: 0 };
        this.nextDirection1 = { x: 1, y: 0 };
        this.apple1 = this.generateApple(1);
        this.score1 = 0;
        this.dead1 = false;
        
        // Player 2 (right side)
        this.snake2 = [{ x: 5, y: 10 }];
        this.direction2 = { x: 1, y: 0 };
        this.nextDirection2 = { x: 1, y: 0 };
        this.apple2 = this.generateApple(2);
        this.score2 = 0;
        this.dead2 = false;
        
        this.gameOver = false;
        this.speed = 8;
        this.lastUpdateTime = 0;
        
        this.setupControls();
    }

    setupControls() {
        this.handleKeyPress = (e) => {
            if (this.gameOver) return;
            
            // Player 1 controls (WASD)
            switch(e.code) {
                case 'KeyW':
                    if (this.direction1.y === 0 && !this.dead1) {
                        this.nextDirection1 = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'KeyS':
                    if (this.direction1.y === 0 && !this.dead1) {
                        this.nextDirection1 = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'KeyA':
                    if (this.direction1.x === 0 && !this.dead1) {
                        this.nextDirection1 = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'KeyD':
                    if (this.direction1.x === 0 && !this.dead1) {
                        this.nextDirection1 = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                    
                // Player 2 controls (Arrow keys)
                case 'ArrowUp':
                    if (this.direction2.y === 0 && !this.dead2) {
                        this.nextDirection2 = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.direction2.y === 0 && !this.dead2) {
                        this.nextDirection2 = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    if (this.direction2.x === 0 && !this.dead2) {
                        this.nextDirection2 = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    if (this.direction2.x === 0 && !this.dead2) {
                        this.nextDirection2 = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.handleKeyPress);
    }

    reset() {
        this.snake1 = [{ x: 5, y: 10 }];
        this.direction1 = { x: 1, y: 0 };
        this.nextDirection1 = { x: 1, y: 0 };
        this.apple1 = this.generateApple(1);
        this.score1 = 0;
        this.dead1 = false;
        
        this.snake2 = [{ x: 5, y: 10 }];
        this.direction2 = { x: 1, y: 0 };
        this.nextDirection2 = { x: 1, y: 0 };
        this.apple2 = this.generateApple(2);
        this.score2 = 0;
        this.dead2 = false;
        
        this.gameOver = false;
        this.lastUpdateTime = 0;
        this.updateScoreDisplay();
    }

    generateApple(player) {
        let apple;
        const snake = player === 1 ? this.snake1 : this.snake2;
        do {
            apple = {
                x: Math.floor(Math.random() * this.tileCountX),
                y: Math.floor(Math.random() * this.tileCountY)
            };
        } while (snake.some(segment => segment.x === apple.x && segment.y === apple.y));
        return apple;
    }

    update(timestamp) {
        if (this.gameOver) return;
        
        // Control update rate
        if (timestamp - this.lastUpdateTime < 1000 / this.speed) {
            return;
        }
        this.lastUpdateTime = timestamp;
        
        // Update player 1
        if (!this.dead1) {
            this.updatePlayer(1);
        }
        
        // Update player 2
        if (!this.dead2) {
            this.updatePlayer(2);
        }
        
        // Check if game over
        if (this.dead1 && this.dead2) {
            this.gameOver = true;
            if (window.achievementSystem) {
                achievementSystem.unlock('multiplayer_master');
            }
        }
    }

    updatePlayer(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const direction = player === 1 ? this.direction1 : this.direction2;
        const nextDirection = player === 1 ? this.nextDirection1 : this.nextDirection2;
        const apple = player === 1 ? this.apple1 : this.apple2;
        
        // Update direction
        if (player === 1) {
            this.direction1 = { ...nextDirection };
        } else {
            this.direction2 = { ...nextDirection };
        }
        
        // Move snake
        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCountX || 
            head.y < 0 || head.y >= this.tileCountY) {
            if (player === 1) {
                this.dead1 = true;
            } else {
                this.dead2 = true;
            }
            if (window.audioManager) {
                audioManager.play('gameOver');
            }
            return;
        }
        
        // Check self collision
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            if (player === 1) {
                this.dead1 = true;
            } else {
                this.dead2 = true;
            }
            if (window.audioManager) {
                audioManager.play('gameOver');
            }
            return;
        }
        
        snake.unshift(head);
        
        // Check apple collision
        if (head.x === apple.x && head.y === apple.y) {
            if (player === 1) {
                this.score1 += 10;
                this.apple1 = this.generateApple(1);
            } else {
                this.score2 += 10;
                this.apple2 = this.generateApple(2);
            }
            this.updateScoreDisplay();
            if (window.audioManager) {
                audioManager.play('score');
            }
        } else {
            snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dividing line
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        
        // Draw player 1 (left side)
        this.drawPlayer(1, 0);
        
        // Draw player 2 (right side)
        this.drawPlayer(2, this.canvas.width / 2);
        
        // Draw labels
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillText('P1 (WASD)', this.canvas.width / 4, 20);
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillText('P2 (Arrows)', 3 * this.canvas.width / 4, 20);
        
        // Game over text
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 80, this.canvas.width, 160);
            
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.score1 > this.score2) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText('Player 1 Wins!', this.canvas.width / 2, this.canvas.height / 2);
            } else if (this.score2 > this.score1) {
                this.ctx.fillStyle = '#F44336';
                this.ctx.fillText('Player 2 Wins!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillText('Tie Game!', this.canvas.width / 2, this.canvas.height / 2);
            }
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                `Final Scores: ${this.score1} - ${this.score2}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 50
            );
        }
    }

    drawPlayer(player, offsetX) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const apple = player === 1 ? this.apple1 : this.apple2;
        const dead = player === 1 ? this.dead1 : this.dead2;
        const color = player === 1 ? '#4CAF50' : '#F44336';
        
        // Draw grid
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCountX; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + i * this.gridSize, 0);
            this.ctx.lineTo(offsetX + i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.tileCountY; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, i * this.gridSize);
            this.ctx.lineTo(offsetX + this.canvas.width / 2, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        snake.forEach((segment, index) => {
            if (dead) {
                this.ctx.fillStyle = '#666';
            } else if (index === 0) {
                this.ctx.fillStyle = color;
            } else {
                this.ctx.fillStyle = color + 'CC';
            }
            this.ctx.fillRect(
                offsetX + segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw apple
        if (!dead) {
            this.ctx.fillStyle = '#FF4444';
            this.ctx.beginPath();
            this.ctx.arc(
                offsetX + apple.x * this.gridSize + this.gridSize / 2,
                apple.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.innerHTML = `<span style="color: #4CAF50">P1: ${this.score1}</span> - <span style="color: #F44336">P2: ${this.score2}</span>`;
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}
