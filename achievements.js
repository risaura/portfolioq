// Achievement System
class AchievementSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_visit',
                name: 'Welcome!',
                description: 'Visit the portfolio for the first time',
                icon: '👋',
                unlocked: false
            },
            {
                id: 'first_click',
                name: 'Curious Explorer',
                description: 'Click on the character',
                icon: '🎯',
                unlocked: false
            },
            {
                id: 'first_game',
                name: 'Game Master',
                description: 'Play your first game',
                icon: '🎮',
                unlocked: false
            },
            {
                id: 'flappy_10',
                name: 'Flappy Novice',
                description: 'Score 10 points in Flappy Bird',
                icon: '🐦',
                unlocked: false
            },
            {
                id: 'flappy_25',
                name: 'Flappy Expert',
                description: 'Score 25 points in Flappy Bird',
                icon: '🦅',
                unlocked: false
            },
            {
                id: 'snake_50',
                name: 'Snake Handler',
                description: 'Score 50 points in Snake',
                icon: '🐍',
                unlocked: false
            },
            {
                id: 'snake_100',
                name: 'Snake Master',
                description: 'Score 100 points in Snake',
                icon: '🏆',
                unlocked: false
            },
            {
                id: 'pong_win',
                name: 'Pong Champion',
                description: 'Win a game of Pong',
                icon: '🏓',
                unlocked: false
            },
            {
                id: 'pong_perfect',
                name: 'Perfect Victory',
                description: 'Win Pong without AI scoring',
                icon: '⭐',
                unlocked: false
            },
            {
                id: 'multiplayer_master',
                name: 'Multiplayer Master',
                description: 'Complete a 2-player game',
                icon: '👥',
                unlocked: false
            },
            {
                id: 'music_lover',
                name: 'Music Lover',
                description: 'Toggle the music',
                icon: '🎵',
                unlocked: false
            },
            {
                id: 'explorer',
                name: 'Portfolio Explorer',
                description: 'Visit all sections',
                icon: '🗺️',
                unlocked: false
            },
            {
                id: 'completionist',
                name: 'Completionist',
                description: 'Unlock all other achievements',
                icon: '💎',
                unlocked: false
            }
        ];

        this.visitedSections = new Set();
        this.loadProgress();
        this.renderAchievementsList();
    }

    loadProgress() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            this.achievements.forEach(ach => {
                const savedAch = savedAchievements.find(s => s.id === ach.id);
                if (savedAch) {
                    ach.unlocked = savedAch.unlocked;
                }
            });
        }

        const sections = localStorage.getItem('visitedSections');
        if (sections) {
            this.visitedSections = new Set(JSON.parse(sections));
        }
    }

    saveProgress() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        localStorage.setItem('visitedSections', JSON.stringify([...this.visitedSections]));
    }

    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveProgress();
            this.showNotification(achievement);
            this.renderAchievementsList();
            
            // Play sound
            if (window.audioManager) {
                audioManager.play('achievement');
            }

            // Check if all achievements unlocked
            this.checkCompletionist();
        }
    }

    checkCompletionist() {
        const allButCompletionist = this.achievements.filter(a => a.id !== 'completionist');
        const allUnlocked = allButCompletionist.every(a => a.unlocked);
        
        if (allUnlocked) {
            this.unlock('completionist');
        }
    }

    showNotification(achievement) {
        const notification = document.getElementById('achievementPopup');
        const nameElement = notification.querySelector('.achievement-popup-name');
        const iconElement = notification.querySelector('.achievement-popup-icon');
        
        nameElement.textContent = achievement.name;
        iconElement.textContent = achievement.icon;
        
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 500);
        }, 4000);
    }

    trackSectionVisit(sectionName) {
        this.visitedSections.add(sectionName);
        this.saveProgress();
        
        // Check if all sections visited
        const requiredSections = ['about', 'games', 'achievements', 'projects', 'contact'];
        const allVisited = requiredSections.every(s => this.visitedSections.has(s));
        
        if (allVisited) {
            this.unlock('explorer');
        }
    }

    renderAchievementsList() {
        const container = document.getElementById('achievementsList');
        if (!container) return;

        container.innerHTML = '';
        
        this.achievements.forEach(ach => {
            const achElement = document.createElement('div');
            achElement.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
            achElement.innerHTML = `
                <span class="achievement-item-icon">${ach.icon}</span>
                <div class="achievement-item-details">
                    <div class="achievement-item-name">${ach.name}</div>
                    <div class="achievement-item-desc">${ach.description}</div>
                </div>
                <span class="achievement-status">${ach.unlocked ? '✓' : '🔒'}</span>
            `;
            container.appendChild(achElement);
        });

        // Update progress
        const unlocked = this.achievements.filter(a => a.unlocked).length;
        const total = this.achievements.length;
        const progressText = document.createElement('div');
        progressText.className = 'achievement-progress';
        progressText.textContent = `${unlocked} / ${total} Unlocked`;
        container.insertBefore(progressText, container.firstChild);
    }

    // Helper methods for tracking game achievements
    checkFlappyScore(score) {
        if (score >= 10) this.unlock('flappy_10');
        if (score >= 25) this.unlock('flappy_25');
    }

    checkSnakeScore(score) {
        if (score >= 50) this.unlock('snake_50');
        if (score >= 100) this.unlock('snake_100');
    }

    checkPongWin(playerScore, aiScore) {
        if (playerScore >= 5) {
            this.unlock('pong_win');
            if (aiScore === 0) {
                this.unlock('pong_perfect');
            }
        }
    }

    reset() {
        if (confirm('Are you sure you want to reset all achievements?')) {
            this.achievements.forEach(a => a.unlocked = false);
            this.visitedSections.clear();
            this.saveProgress();
            this.renderAchievementsList();
        }
    }
}

// Initialize achievement system
const achievementSystem = new AchievementSystem();
