class AudioManager {
    constructor() {
        this.messageSound = new Audio('/sounds/faaah.mp3');
        this.messageSound.volume = 1;
        this.isUnlocked = false;
    }

    // ця функція викликаєть при ПЕРШОМУ кліку на сайті
    unlock() {
        if (this.isUnlocked) return;

        this.messageSound.play().then(() => {
            this.messageSound.pause();
            this.messageSound.currentTime = 0;
            this.isUnlocked = true;
        }).catch(err => {
            console.warn('Аудіо ще заблоковано:', err);
        });
    }

    playMessageSound() {
        this.messageSound.pause();
        this.messageSound.currentTime = 0;
        this.messageSound.play().catch(e => console.warn('Автоплей аудіо заблоковано:', e));
    }
}

export const audioManager = new AudioManager();