class Pong2P {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.ballSize = 10;
        
        this.player1 = {
            x: 10,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5,
            score: 0,
            color: '#4CAF50'
        };
        
        this.player2 = {
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5,
            score: 0,
            color: '#F44336'
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
        this.player1.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player1.score = 0;
        this.player2.score = 0;
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
        
        // Player 1 movement (W/S)
        if (this.keys['KeyW']) {
            this.player1.y = Math.max(0, this.player1.y - this.player1.speed);
        }
        if (this.keys['KeyS']) {
            this.player1.y = Math.min(
                this.canvas.height - this.player1.height,
                this.player1.y + this.player1.speed
            );
        }
        
        // Player 2 movement (Arrow keys)
        if (this.keys['ArrowUp']) {
            this.player2.y = Math.max(0, this.player2.y - this.player2.speed);
        }
        if (this.keys['ArrowDown']) {
            this.player2.y = Math.min(
                this.canvas.height - this.player2.height,
                this.player2.y + this.player2.speed
            );
        }
        
        // Ball movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top/bottom
        if (this.ball.y <= 0 || this.ball.y + this.ballSize >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with player1 paddle
        if (this.ball.x <= this.player1.x + this.player1.width &&
            this.ball.x + this.ballSize >= this.player1.x &&
            this.ball.y + this.ballSize >= this.player1.y &&
            this.ball.y <= this.player1.y + this.player1.height) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            const hitPos = (this.ball.y - this.player1.y) / this.player1.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
            
            if (window.audioManager) {
                audioManager.play('click');
            }
        }
        
        // Ball collision with player2 paddle
        if (this.ball.x + this.ballSize >= this.player2.x &&
            this.ball.x <= this.player2.x + this.player2.width &&
            this.ball.y + this.ballSize >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.height) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            const hitPos = (this.ball.y - this.player2.y) / this.player2.height;
            this.ball.dy = (hitPos - 0.5) * 8;
            
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
            
            if (window.audioManager) {
                audioManager.play('click');
            }
        }
        
        // Score points
        if (this.ball.x < 0) {
            this.player2.score++;
            this.updateScoreDisplay();
            this.checkWin();
            this.resetBall();
            if (window.audioManager) {
                audioManager.play('score');
            }
        }
        if (this.ball.x > this.canvas.width) {
            this.player1.score++;
            this.updateScoreDisplay();
            this.checkWin();
            this.resetBall();
            if (window.audioManager) {
                audioManager.play('score');
            }
        }
    }

    checkWin() {
        if (this.player1.score >= this.winScore || this.player2.score >= this.winScore) {
            this.gameOver = true;
            
            // Achievement for multiplayer
            if (window.achievementSystem) {
                achievementSystem.unlock('multiplayer_master');
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
        
        // Draw player 1 paddle
        this.ctx.fillStyle = this.player1.color;
        this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        
        // Draw player 2 paddle
        this.ctx.fillStyle = this.player2.color;
        this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        
        // Draw ball
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);
        
        // Draw scores
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player1.score, this.canvas.width / 4, 50);
        this.ctx.fillText(this.player2.score, 3 * this.canvas.width / 4, 50);
        
        // Draw player labels
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = this.player1.color;
        this.ctx.fillText('Player 1 (W/S)', this.canvas.width / 4, 80);
        this.ctx.fillStyle = this.player2.color;
        this.ctx.fillText('Player 2 (↑/↓)', 3 * this.canvas.width / 4, 80);
        
        // Game over text
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 80, this.canvas.width, 160);
            
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.player1.score >= this.winScore) {
                this.ctx.fillStyle = this.player1.color;
                this.ctx.fillText('Player 1 Wins!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillStyle = this.player2.color;
                this.ctx.fillText('Player 2 Wins!', this.canvas.width / 2, this.canvas.height / 2);
            }
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                `Final Score: ${this.player1.score} - ${this.player2.score}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 50
            );
        }
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.innerHTML = `<span style="color: ${this.player1.color}">P1: ${this.player1.score}</span> - <span style="color: ${this.player2.color}">P2: ${this.player2.score}</span>`;
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
