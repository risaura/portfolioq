class Pong {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.ballSize = 10;
        
        this.player = {
            x: 10,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5,
            dy: 0,
            score: 0
        };
        
        this.ai = {
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 3,
            score: 0
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 4 * (Math.random() > 0.5 ? 1 : -1),
            dy: 4 * (Math.random() > 0.5 ? 1 : -1),
            speed: 4
        };
        
        this.keys = {};
        this.gameOver = false;
        this.winScore = 5;
        
        this.setupControls();
    }

    setupControls() {
        this.handleKeyDown = (e) => {
            this.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
                e.preventDefault();
            }
        };
        
        this.handleKeyUp = (e) => {
            this.keys[e.code] = false;
        };
        
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    reset() {
        this.player.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ai.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player.score = 0;
        this.ai.score = 0;
        this.resetBall();
        this.gameOver = false;
        this.updateScoreDisplay();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
        if (this.gameOver) return;
        
        // Player movement
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.y = Math.min(
                this.canvas.height - this.player.height,
                this.player.y + this.player.speed
            );
        }
        
        // AI movement (follows ball)
        const aiCenter = this.ai.y + this.ai.height / 2;
        if (aiCenter < this.ball.y - 10) {
            this.ai.y = Math.min(
                this.canvas.height - this.ai.height,
                this.ai.y + this.ai.speed
            );
        } else if (aiCenter > this.ball.y + 10) {
            this.ai.y = Math.max(0, this.ai.y - this.ai.speed);
        }
        
        // Ball movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top/bottom
        if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with player paddle
        if (this.ball.x <= this.player.x + this.player.width &&
            this.ball.x + this.ballSize >= this.player.x &&
            this.ball.y + this.ballSize >= this.player.y &&
            this.ball.y <= this.player.y + this.player.height) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            // Add some randomness based on where it hit the paddle
            const hitPos = (this.ball.y - this.player.y) / this.player.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            // Increase speed slightly
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
        }
        
        // Ball collision with AI paddle
        if (this.ball.x + this.ballSize >= this.ai.x &&
            this.ball.x <= this.ai.x + this.ai.width &&
            this.ball.y + this.ballSize >= this.ai.y &&
            this.ball.y <= this.ai.y + this.ai.height) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            const hitPos = (this.ball.y - this.ai.y) / this.ai.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
        }
        
        // Score points
        if (this.ball.x < 0) {
            this.ai.score++;
            this.updateScoreDisplay();
            this.checkWin();
            this.resetBall();
        }
        if (this.ball.x > this.canvas.width) {
            this.player.score++;
            this.updateScoreDisplay();
            this.checkWin();
            this.resetBall();
        }
    }

    checkWin() {
        if (this.player.score >= this.winScore || this.ai.score >= this.winScore) {
            this.gameOver = true;
            
            // Show "PRACTICE BETTER" if AI wins 5-0 or player scores 0
            if (this.ai.score >= this.winScore && this.player.score === 0) {
                setTimeout(() => {
                    const practiceBetter = document.getElementById('practiceBetter');
                    if (practiceBetter) {
                        practiceBetter.classList.remove('hidden');
                        practiceBetter.classList.add('show');
                        
                        setTimeout(() => {
                            practiceBetter.classList.remove('show');
                            setTimeout(() => {
                                practiceBetter.classList.add('hidden');
                            }, 500);
                        }, 3000);
                    }
                }, 500);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw player paddle
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw AI paddle
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);
        
        // Draw ball
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);
        
        // Draw scores
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.score, this.canvas.width / 4, 50);
        this.ctx.fillText(this.ai.score, 3 * this.canvas.width / 4, 50);
        
        // Game over text
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 80, this.canvas.width, 160);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.player.score >= this.winScore) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText('You Win!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillStyle = '#F44336';
                this.ctx.fillText('AI Wins!', this.canvas.width / 2, this.canvas.height / 2);
            }
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                `Final Score: ${this.player.score} - ${this.ai.score}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 50
            );
        }
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.player.score} - ${this.ai.score}`;
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
