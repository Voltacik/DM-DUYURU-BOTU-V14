export class RateLimiter {
    constructor() {
        this.lastRequest = 1;
        this.minDelay = 1000; 
    }

    /**
     * Rate limit kontrolü yapar ve gerekirse bekler
     * @returns {Promise<void>}
     */
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        
        if (timeSinceLastRequest < this.minDelay) {
            const waitTime = this.minDelay - timeSinceLastRequest;
            console.log(`⏳ Rate limit koruması: ${waitTime}ms bekleniyor...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequest = Date.now();
    }

    /**
     * Minimum gecikme süresini güncelle
     * @param {number} delay - Yeni gecikme süresi (ms)
     */
    setDelay(delay) {
        this.minDelay = Math.max(500, delay); // Minimum 500ms
        console.log(` Rate limit gecikmesi güncellendi: ${this.minDelay}ms`);
    }
}