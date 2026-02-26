/**
 * BACKTESTER MODULE
 * 
 * Validates model performance on historical data using rolling window validation.
 * 
 * BACKTESTING APPROACH:
 * - Split historical data into training and test windows
 * - Train on earlier data, predict next draw
 * - Measure overlap (how many predicted numbers match actual)
 * - Roll forward and repeat
 * - Collect statistics: average overlap, distribution, best/worst cases
 * 
 * WHY THIS MATTERS:
 * - Empirical validation rather than theoretical claims
 * - Measures actual overlap (our key metric)
 * - Identifies model weaknesses (worst-case scenarios)
 * - Provides confidence intervals and distribution data
 */

class Backtester {
    constructor() {
        this.MIN_TRAINING_SIZE = 5; // Minimum draws to train on
    }

    /**
     * Calculate overlap between predicted and actual numbers
     * OVERLAP = count of matching numbers
     * This is our PRIMARY METRIC - what we're optimizing for
     */
    calculateOverlap(predicted, actual) {
        const predictedSet = new Set(predicted);
        const actualSet = new Set(actual);
        let overlap = 0;

        predictedSet.forEach(num => {
            if (actualSet.has(num)) overlap++;
        });

        return overlap;
    }

    /**
     * Single backtest iteration:
     * - Train on historical records
     * - Predict for next draw
     * - Compare with actual
     * - Return overlap
     */
    testSingleDraw(trainingRecords, testRecord, gameType) {
        if (trainingRecords.length < this.MIN_TRAINING_SIZE) {
            return null; // Not enough data to train
        }

        try {
            // Generate prediction
            const prediction = ensemblePredictor.predict(trainingRecords, gameType);

            // Extract predicted numbers
            const predictedNumbers = prediction.predictions.map(p => p.number);

            // Calculate overlap with actual
            const overlap = this.calculateOverlap(predictedNumbers, testRecord.numbers);

            return {
                date: testRecord.date,
                predicted: predictedNumbers,
                actual: testRecord.numbers,
                overlap: overlap,
                success: overlap >= 2 // Success = at least 2 matches
            };
        } catch (error) {
            console.error(`Backtest error on ${testRecord.date}:`, error);
            return null;
        }
    }

    /**
     * ROLLING WINDOW BACKTEST
     * 
     * Tests model on every available draw:
     * 1. Start with first N records as training
     * 2. Predict record N+1
     * 3. Roll forward and repeat
     * 
     * WHY rolling window:
     * - Uses only data available at prediction time (no lookahead bias)
     * - Mimics real deployment (always training on historical, not future)
     * - Captures model performance across different market conditions
     */
    rollingWindowBacktest(records, gameType) {
        const results = [];

        // Start with MIN_TRAINING_SIZE records, predict the next one
        for (let i = this.MIN_TRAINING_SIZE; i < records.length; i++) {
            const trainingData = records.slice(0, i);
            const testRecord = records[i];

            const testResult = this.testSingleDraw(trainingData, testRecord, gameType);
            if (testResult !== null) {
                results.push(testResult);
            }
        }

        return results;
    }

    /**
     * COMPUTE STATISTICS FROM BACKTEST RESULTS
     * 
     * Metrics:
     * - Average Overlap: Mean number of matching numbers per draw
     * - Distribution: Histogram of overlap counts (0, 1, 2, 3, 4, 5)
     * - Success Rate: % of draws with overlap >= 2
     * - Best/Worst Case: Maximum and minimum overlaps observed
     * - Consistency: Standard deviation (lower = more stable)
     */
    computeStatistics(results) {
        if (results.length === 0) {
            return null;
        }

        const overlaps = results.map(r => r.overlap);
        const successes = results.filter(r => r.success).length;

        // Calculate mean
        const mean = overlaps.reduce((a, b) => a + b, 0) / overlaps.length;

        // Calculate standard deviation
        const variance = overlaps.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / overlaps.length;
        const stdDev = Math.sqrt(variance);

        // Distribution histogram
        const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        overlaps.forEach(o => {
            if (distribution.hasOwnProperty(o)) {
                distribution[o]++;
            }
        });

        return {
            totalTests: results.length,
            averageOverlap: parseFloat(mean.toFixed(3)),
            stdDeviation: parseFloat(stdDev.toFixed(3)),
            minOverlap: Math.min(...overlaps),
            maxOverlap: Math.max(...overlaps),
            successCount: successes,
            successRate: parseFloat(((successes / results.length) * 100).toFixed(2)),
            distribution: distribution,
            allResults: results
        };
    }

    /**
     * RUN FULL BACKTEST FOR A GAME TYPE
     * Returns detailed statistics and results
     */
    backtest(records, gameType) {
        if (records.length < this.MIN_TRAINING_SIZE + 1) {
            return {
                error: `Insufficient data: need at least ${this.MIN_TRAINING_SIZE + 1} records, got ${records.length}`
            };
        }

        // Run rolling window backtest
        const results = this.rollingWindowBacktest(records, gameType);

        // Compute statistics
        const stats = this.computeStatistics(results);

        return {
            gameType: gameType,
            ...stats,
            recommendation: this.generateRecommendation(stats)
        };
    }

    /**
     * Generate interpretation of backtest results
     */
    generateRecommendation(stats) {
        if (!stats) return "Insufficient data for recommendation";

        const advice = [];

        if (stats.averageOverlap >= 2) {
            advice.push(`✓ Model achieves target: avg ${stats.averageOverlap} overlaps per draw`);
        } else {
            advice.push(`⚠ Model below target: avg ${stats.averageOverlap} overlaps (target: ≥2)`);
        }

        if (stats.successRate >= 50) {
            advice.push(`✓ Good consistency: ${stats.successRate}% of draws meet 2+ overlap threshold`);
        } else {
            advice.push(`⚠ Inconsistent: only ${stats.successRate}% of draws meet threshold`);
        }

        if (stats.stdDeviation < 1.0) {
            advice.push(`✓ Stable predictions: low variance (σ=${stats.stdDeviation})`);
        } else {
            advice.push(`⚠ Volatile: high variance (σ=${stats.stdDeviation})`);
        }

        return advice.join(" | ");
    }

    /**
     * Compare ensemble to baseline (random 5 numbers)
     * Shows improvement over naive approach
     */
    compareToBaseline(records, gameType) {
        const baselineResults = [];

        // Baseline: pick 5 random numbers for each test
        for (let i = this.MIN_TRAINING_SIZE; i < records.length; i++) {
            const testRecord = records[i];
            const randomPrediction = this.generateRandomPrediction();

            const overlap = this.calculateOverlap(randomPrediction, testRecord.numbers);
            baselineResults.push({
                date: testRecord.date,
                overlap: overlap
            });
        }

        const baselineStats = this.computeStatistics(baselineResults);
        const ensembleStats = this.computeStatistics(
            this.rollingWindowBacktest(records, gameType)
        );

        const improvement = {
            ensemble: {
                average: ensembleStats.averageOverlap,
                successRate: ensembleStats.successRate
            },
            baseline: {
                average: baselineStats.averageOverlap,
                successRate: baselineStats.successRate
            },
            improvement: {
                overlapIncrease: parseFloat((
                    ensembleStats.averageOverlap - baselineStats.averageOverlap
                ).toFixed(3)),
                successRateIncrease: parseFloat((
                    ensembleStats.successRate - baselineStats.successRate
                ).toFixed(2))
            }
        };

        return improvement;
    }

    /**
     * Generate random 5-number prediction (for baseline)
     */
    generateRandomPrediction() {
        const numbers = new Set();
        while (numbers.size < 5) {
            numbers.add(Math.floor(Math.random() * 90) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }
}

const backtester = new Backtester();
