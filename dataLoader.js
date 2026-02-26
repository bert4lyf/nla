/**
 * DATA LOADER & PREPROCESSING MODULE
 * 
 * Handles:
 * - Missing value imputation
 * - Number range normalization
 * - Data cleaning and validation
 * - Separation of Noon Rush vs Evening games
 * 
 * WHY THIS MATTERS:
 * - Ensures robust predictions even with incomplete historical data
 * - Normalizes different number ranges if needed
 * - Separates pipelines so Noon Rush and Evening have independent frequency tables
 */

class DataLoader {
    constructor() {
        this.MAX_NUMBER = 90;
        this.MIN_NUMBER = 1;
        this.NUMBERS_PER_DRAW = 5; // Target output: 5 numbers per game
    }

    /**
     * Validate a single draw's numbers
     * WHY: Ensures no invalid numbers corrupt our frequency analysis
     */
    validateNumbers(numbers) {
        if (!Array.isArray(numbers)) return false;
        return numbers.every(num => 
            Number.isInteger(num) && 
            num >= this.MIN_NUMBER && 
            num <= this.MAX_NUMBER
        );
    }

    /**
     * Validate and clean a historical record
     * WHY: Filters out corrupted or incomplete records before model training
     */
    cleanRecord(record) {
        if (!record || !record.date || !record.gameType) {
            return null;
        }
        
        // Handle missing or invalid numbers
        if (!record.numbers || !this.validateNumbers(record.numbers)) {
            return null;
        }

        return {
            date: record.date,
            day: record.day || 'Unknown',
            gameType: record.gameType.toLowerCase(), // 'evening' or 'noon'
            numbers: Array.from(new Set(record.numbers)).sort((a, b) => a - b), // Unique, sorted
            valid: true
        };
    }

    /**
     * Load and clean historical data by game type
     * WHY: Separates Noon Rush from Evening so each has independent history
     */
    loadByGameType(gameType, rawHistoricalData) {
        const gameData = gameType.toLowerCase();
        const cleaned = rawHistoricalData
            .filter(record => record.gameType === gameData)
            .map(record => this.cleanRecord(record))
            .filter(record => record !== null);
        
        return {
            gameType: gameData,
            recordCount: cleaned.length,
            records: cleaned,
            dateRange: {
                earliest: cleaned.length > 0 ? cleaned[0].date : null,
                latest: cleaned.length > 0 ? cleaned[cleaned.length - 1].date : null
            }
        };
    }

    /**
     * Extract all unique numbers from a dataset
     * WHY: Forms the candidate pool for prediction
     */
    extractUniqueNumbers(records) {
        const uniqueSet = new Set();
        records.forEach(record => {
            record.numbers.forEach(num => uniqueSet.add(num));
        });
        return Array.from(uniqueSet).sort((a, b) => a - b);
    }

    /**
     * Get training data (all records before a cutoff date)
     * WHY: For backtesting - we train on past, test on future
     */
    getTrainingData(records, cutoffDate) {
        return records.filter(record => new Date(record.date) < cutoffDate);
    }

    /**
     * Get test data (all records on/after a cutoff date)
     * WHY: For backtesting - validate on data the model hasn't seen
     */
    getTestData(records, cutoffDate) {
        return records.filter(record => new Date(record.date) >= cutoffDate);
    }

    /**
     * Get sliding window of recent draws
     * WHY: Recent draws are more relevant for trend detection
     */
    getRecentWindow(records, windowSize = 10) {
        return records.slice(-windowSize);
    }

    /**
     * Prepare data for feature engineering
     * WHY: Structures data so feature engineering can extract patterns
     */
    prepareForFeatureEngineering(records) {
        return {
            allNumbers: this.extractUniqueNumbers(records),
            totalDraws: records.length,
            records: records,
            recentDraws: this.getRecentWindow(records, Math.min(10, records.length))
        };
    }
}

// Export for use in other modules
const dataLoader = new DataLoader();
