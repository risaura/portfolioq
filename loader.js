// Retro Space Loading Screen Manager
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.getElementById('loadingText');
        this.loadingPercentage = document.getElementById('loadingPercentage');
        
        this.progress = 0;
        this.totalAssets = 10;
        this.loadedAssets = 0;
        
        this.messages = [
            "INITIALIZING SYSTEMS...",
            "LOADING CHARACTER DATA...",
            "GENERATING WORLD...",
            "LOADING GAME ASSETS...",
            "CALIBRATING AUDIO...",
            "LOADING PANDA SPRITES...",
            "INITIALIZING PONG...",
            "LOADING FLAPPY BIRD...",
            "PREPARING MULTIPLAYER...",
            "SYSTEMS READY..."
        ];
        
        this.startLoading();
    }

    updateProgress(index) {
        this.loadedAssets++;
        this.progress = (this.loadedAssets / this.totalAssets) * 100;
        
        this.loadingBar.style.width = this.progress + '%';
        this.loadingPercentage.textContent = Math.floor(this.progress) + '%';
        this.loadingText.textContent = this.messages[index] || 'LOADING...';
        
        if (this.loadedAssets >= this.totalAssets) {
            this.complete();
        }
    }

    startLoading() {
        let currentDelay = 300;
        
        for (let i = 0; i < this.totalAssets; i++) {
            currentDelay += 300 + Math.random() * 200;
            setTimeout(() => {
                this.updateProgress(i);
            }, currentDelay);
        }
    }

    complete() {
        setTimeout(() => {
            this.loadingText.textContent = 'LAUNCH SEQUENCE INITIATED!';
            
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                this.loadingScreen.style.transition = 'opacity 1s ease-out';
                
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                    
                    // Welcome achievement
                    if (window.achievementSystem) {
                        const hasVisited = localStorage.getItem('hasVisitedBefore');
                        if (!hasVisited) {
                            localStorage.setItem('hasVisitedBefore', 'true');
                            setTimeout(() => {
                                achievementSystem.unlock('first_visit');
                            }, 1000);
                        }
                    }
                }, 1000);
            }, 500);
        }, 500);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoadingScreen();
    });
} else {
    new LoadingScreen();
}
