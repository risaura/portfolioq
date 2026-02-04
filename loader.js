// Loading Screen Manager
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.getElementById('loadingText');
        this.loadingPercentage = document.getElementById('loadingPercentage');
        this.loadingTip = document.getElementById('loadingTip');
        
        this.progress = 0;
        this.totalAssets = 10; // Number of things to "load"
        this.loadedAssets = 0;
        
        this.tips = [
            "💡 Tip: Click on the character to make them wave!",
            "🎮 Tip: Try unlocking all achievements!",
            "🎵 Tip: Enjoy the smooth jazz background music!",
            "🏆 Tip: Compete with a friend in 2-player mode!",
            "🐍 Tip: Snake gets faster as you eat more apples!",
            "🏓 Tip: First to 5 points wins in Pong!",
            "✨ Tip: Your high scores are saved automatically!",
            "🎯 Tip: Explore all sections to unlock achievements!"
        ];
        
        this.currentTipIndex = 0;
        this.startTipRotation();
        this.startLoading();
    }

    startTipRotation() {
        setInterval(() => {
            this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
            this.loadingTip.textContent = this.tips[this.currentTipIndex];
        }, 3000);
    }

    updateProgress(assetName) {
        this.loadedAssets++;
        this.progress = (this.loadedAssets / this.totalAssets) * 100;
        
        this.loadingBar.style.width = this.progress + '%';
        this.loadingPercentage.textContent = Math.floor(this.progress) + '%';
        this.loadingText.textContent = `Loading ${assetName}...`;
        
        if (this.loadedAssets >= this.totalAssets) {
            this.complete();
        }
    }

    startLoading() {
        // Simulate loading different assets
        const assets = [
            { name: 'Character sprites', delay: 300 },
            { name: 'Game assets', delay: 500 },
            { name: 'Sound system', delay: 400 },
            { name: 'Achievement data', delay: 350 },
            { name: 'Flappy Bird', delay: 450 },
            { name: 'Snake game', delay: 400 },
            { name: 'Pong game', delay: 350 },
            { name: 'Multiplayer mode', delay: 500 },
            { name: 'High scores', delay: 300 },
            { name: 'Finalizing', delay: 400 }
        ];

        let currentDelay = 200;
        assets.forEach((asset, index) => {
            currentDelay += asset.delay;
            setTimeout(() => {
                this.updateProgress(asset.name);
            }, currentDelay);
        });
    }

    complete() {
        setTimeout(() => {
            this.loadingText.textContent = 'Complete! Starting portfolio...';
            
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                this.loadingScreen.style.transition = 'opacity 0.5s ease-out';
                
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                    
                    // Trigger a welcome achievement
                    if (window.achievementSystem) {
                        const hasVisited = localStorage.getItem('hasVisitedBefore');
                        if (!hasVisited) {
                            localStorage.setItem('hasVisitedBefore', 'true');
                            setTimeout(() => {
                                achievementSystem.unlock('first_visit');
                            }, 1000);
                        }
                    }
                }, 500);
            }, 500);
        }, 500);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoadingScreen();
    });
} else {
    new LoadingScreen();
}
