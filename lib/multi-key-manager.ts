/**
 * Multi-Key API Manager
 * Manages multiple Gemini API keys for load balancing and quota management
 */

export class MultiKeyManager {
    private keys: string[];
    private currentIndex: number = 0;
    private keyUsage: Map<string, { count: number; lastUsed: number }>;

    private exhaustedKeys: Set<string> = new Set();

    constructor(keys: string[]) {
        this.keys = keys.filter(k => k && k.trim().length > 0);
        this.keyUsage = new Map();

        // Initialize usage tracking
        this.keys.forEach(key => {
            this.keyUsage.set(key, { count: 0, lastUsed: 0 });
        });
    }

    /**
     * Mark a key as exhausted (hit quota limit)
     */
    markExhausted(key: string) {
        console.warn(`[MultiKeyManager] Key starting with ${key.substring(0, 10)}... has been marked as EXHAUSTED`);
        this.exhaustedKeys.add(key);
    }

    /**
     * Check if all keys are exhausted
     */
    isAllExhausted(): boolean {
        return this.exhaustedKeys.size >= this.keys.length;
    }

    /**
     * Get next available API key (skipping exhausted ones if possible)
     */
    getNextKey(): string {
        if (this.keys.length === 0) {
            throw new Error('No API keys available');
        }

        // Try to find a non-exhausted key
        let attempts = 0;
        while (attempts < this.keys.length) {
            const key = this.keys[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;

            if (!this.exhaustedKeys.has(key)) {
                this.updateUsage(key);
                return key;
            }
            attempts++;
        }

        // If all are exhausted, just return the next one anyway (fallback)
        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        this.updateUsage(key);
        return key;
    }

    /**
     * Get least used key that is not exhausted
     */
    getLeastUsedKey(): string {
        const availableKeys = this.keys.filter(k => !this.exhaustedKeys.has(k));

        if (availableKeys.length === 0) {
            // Fallback to all keys if all are marked exhausted
            return this.getNextKey();
        }

        let leastUsedKey = availableKeys[0];
        let minCount = this.keyUsage.get(leastUsedKey)!.count;

        availableKeys.forEach(key => {
            const usage = this.keyUsage.get(key)!;
            if (usage.count < minCount) {
                minCount = usage.count;
                leastUsedKey = key;
            }
        });

        this.updateUsage(leastUsedKey);
        return leastUsedKey;
    }

    private updateUsage(key: string) {
        const usage = this.keyUsage.get(key)!;
        usage.count++;
        usage.lastUsed = Date.now();
        this.keyUsage.set(key, usage);
    }

    /**
     * Get usage statistics
     */
    getStats() {
        const stats: any[] = [];
        this.keys.forEach((key, index) => {
            const usage = this.keyUsage.get(key)!;
            stats.push({
                keyIndex: index,
                keyPreview: key.substring(0, 10) + '...',
                usageCount: usage.count,
                lastUsed: usage.lastUsed ? new Date(usage.lastUsed).toISOString() : 'Never',
                status: this.exhaustedKeys.has(key) ? 'EXHAUSTED' : 'ACTIVE'
            });
        });
        return stats;
    }

    /**
     * Reset usage counters and exhaustion status
     */
    resetCounters() {
        this.exhaustedKeys.clear();
        this.keys.forEach(key => {
            this.keyUsage.set(key, { count: 0, lastUsed: 0 });
        });
    }
}

/**
 * Get API key manager instance
 */
export function getKeyManager(): MultiKeyManager {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_API_KEY_2,
        process.env.GOOGLE_API_KEY_3,
        process.env.GOOGLE_API_KEY_4,
        process.env.GOOGLE_API_KEY_5,
    ].filter(k => k) as string[];

    if (keys.length === 0) {
        throw new Error('No API keys configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY in .env');
    }

    console.log(`[MultiKeyManager] Initialized with ${keys.length} API keys`);
    return new MultiKeyManager(keys);
}
