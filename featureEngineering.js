/**
 * FEATURE ENGINEERING MODULE
 * 
 * Extracts predictive patterns from historical data:
 * 1. Frequency Analysis (with recency weighting)
 * 2. Co-occurrence Patterns (pairs & triplets)
 * 3. Trend Detection (sliding window)
 * 4. Information-theoretic Scoring
 * 
 * WHY THESE FEATURES:
 * - Frequency: Numbers that appear often are statistically more "active"
 * - Co-occurrence: Numbers don't appear independently - some cluster together
 * - Trends: Recent patterns differ from historical - temporal dynamics matter
 * - Entropy: Low-information numbers add noise; entropic candidates are robust
 */

class FeatureEngineer {
    constructor() {
        this.RECENCY_WINDOW = 15; // Most recent N draws get higher weight
        this.PAIR_MIN_SUPPORT = 2; // Pairs must co-occur at least N times
        this.TRIPLET_MIN_SUPPORT = 2; // Triplets must co-occur at least N times
    }

    /**
     * FEATURE 1: FREQUENCY ANALYSIS WITH RECENCY BIAS
     * 
     * WHY: 
     * - Numbers that appear frequently have higher "activity"
     * - Recent appearances matter more than historical (recency bias)
     * - Exponential decay: recent draws weighted heavily, older draws less
     */
    computeFrequencyScores(records) {
        const frequencies = {};
        const recentCount = Math.min(this.RECENCY_WINDOW, records.length);
        const recencyThreshold = records.length - recentCount;

        // Initialize all possible numbers with 0 frequency
        for (let i = 1; i <= 90; i++) {
            frequencies[i] = { count: 0, recentCount: 0, weight: 0 };
        }

        // Count appearances and track recency
        records.forEach((record, index) => {
            const isRecent = index >= recencyThreshold;
            
            record.numbers.forEach(num => {
                if (!frequencies[num]) frequencies[num] = { count: 0, recentCount: 0, weight: 0 };
                
                frequencies[num].count += 1;
                
                // Exponential decay for recency: most recent gets highest weight
                if (isRecent) {
                    const recencyPosition = index - recencyThreshold;
                    const exponentialWeight = Math.exp(recencyPosition / recentCount);
                    frequencies[num].recentCount += 1;
                    frequencies[num].weight += exponentialWeight;
                }
            });
        });

        // Normalize weights to [0, 1]
        const maxWeight = Math.max(...Object.values(frequencies).map(f => f.weight));
        Object.keys(frequencies).forEach(num => {
            frequencies[num].normalizedWeight = maxWeight > 0 ? frequencies[num].weight / maxWeight : 0;
        });

        return frequencies;
    }

    /**
     * FEATURE 2: CO-OCCURRENCE ANALYSIS (Pairs)
     * 
     * WHY:
     * - Numbers don't independently appear - they cluster
     * - If (7, 23) appear together frequently, they may have hidden correlation
     * - Pair co-occurrence reveals which combinations to prioritize or avoid
     */
    computePairCoOccurrences(records) {
        const pairs = {};

        records.forEach(record => {
            const nums = record.numbers;
            // Generate all pairs from this draw
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const pair = [nums[i], nums[j]].sort().join('-');
                    if (!pairs[pair]) {
                        pairs[pair] = { 
                            num1: nums[i], 
                            num2: nums[j], 
                            count: 0,
                            strength: 0
                        };
                    }
                    pairs[pair].count += 1;
                }
            }
        });

        // Filter low-support pairs and compute strength
        const strongPairs = {};
        Object.entries(pairs).forEach(([key, pair]) => {
            if (pair.count >= this.PAIR_MIN_SUPPORT) {
                // Strength = how much better than random co-occurrence
                pair.strength = pair.count / records.length;
                strongPairs[key] = pair;
            }
        });

        return strongPairs;
    }

    /**
     * FEATURE 3: TREND DETECTION (Sliding Window)
     * 
     * WHY:
     * - Market regimes change: some numbers are "hot" now but were "cold" before
     * - Sliding window captures recent drift that overall frequency misses
     * - Trend = recent frequency - older frequency
     */
    computeTrends(records) {
        const windowSize = Math.min(5, Math.floor(records.length / 3));
        if (windowSize < 1 || records.length < windowSize) {
            return {}; // Not enough data for trend
        }

        const trends = {};
        const recentWindow = records.slice(-windowSize);
        const olderWindow = records.slice(-Math.min(2 * windowSize, records.length), -windowSize);

        // Frequency in recent window
        const recentFreq = this.computeFrequencyScores(recentWindow);
        
        // Frequency in older window (if available)
        const olderFreq = olderWindow.length > 0 
            ? this.computeFrequencyScores(olderWindow)
            : {};

        // Compute trend: recent_freq - older_freq
        for (let i = 1; i <= 90; i++) {
            const recentScore = recentFreq[i]?.normalizedWeight || 0;
            const olderScore = olderFreq[i]?.normalizedWeight || 0;
            const trend = recentScore - olderScore;
            
            if (Math.abs(trend) > 0.01) { // Only keep meaningful trends
                trends[i] = trend;
            }
        }

        return trends;
    }

    /**
     * FEATURE 4: ANTI-CLUSTERING PENALTY
     * 
     * WHY:
     * - If we pick {1, 2, 3, 4, 5}, they're all in the low-number range
     * - This creates "clustering" - poor statistical coverage
     * - Penalty: high-frequency neighbors of a candidate reduce its score
     * - Forces selection across different ranges (1-18, 19-45, 46-90)
     */
    computeClusteringPenalty(candidate, selectedNumbers, frequencies) {
        let penalty = 0;
        const rangeWindow = 5; // Numbers within ±5 are "neighbors"

        selectedNumbers.forEach(selected => {
            const distance = Math.abs(candidate - selected);
            if (distance > 0 && distance <= rangeWindow) {
                // Penalize based on neighbor's frequency
                const neighborFreq = frequencies[selected]?.normalizedWeight || 0;
                penalty += neighborFreq * (1 - distance / rangeWindow);
            }
        });

        return penalty;
    }

    /**
     * FEATURE 5: ENTROPY REDUCTION
     * 
     * WHY:
     * - High-entropy candidates have weak signal (appear randomly)
     * - Low-entropy candidates have strong signal (appear in clusters)
     * - This filters noisy candidates that add random variation
     * 
     * Implementation: Shannon entropy over draw appearances
     * - If a number always appears with similar neighbors => low entropy => good
     * - If it appears randomly with various numbers => high entropy => bad
     */
    computeEntropyScore(number, pairs, frequencies) {
        // Find all pairs involving this number
        const involvedPairs = Object.values(pairs).filter(p => 
            p.num1 === number || p.num2 === number
        );

        if (involvedPairs.length === 0) {
            // Isolated number - high entropy (low signal)
            return 1.0;
        }

        // Compute distribution of co-occurrence strengths
        const strengths = involvedPairs.map(p => p.strength);
        const avgStrength = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        const variance = strengths.reduce((a, s) => a + Math.pow(s - avgStrength, 2), 0) / strengths.length;

        // Entropy = how unpredictable the co-occurrence pattern is
        // Low variance (consistent partners) = low entropy = good
        // High variance (random partners) = high entropy = bad
        const entropy = Math.sqrt(variance); // Normalize to [0, 1] approximate
        
        return Math.min(1, entropy);
    }

    /**
     * COMPOSITE FEATURE EXTRACTION
     * Combines all features into a single structure
     */
    extractAllFeatures(records) {
        const frequencies = this.computeFrequencyScores(records);
        const pairs = this.computePairCoOccurrences(records);
        const trends = this.computeTrends(records);

        // Compute entropy scores for all numbers
        const entropyScores = {};
        for (let i = 1; i <= 90; i++) {
            entropyScores[i] = this.computeEntropyScore(i, pairs, frequencies);
        }

        return {
            frequencies,
            pairs,
            trends,
            entropyScores,
            totalRecords: records.length
        };
    }
}

const featureEngineer = new FeatureEngineer();
