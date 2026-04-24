
class EnsemblePredictor {
    constructor() {
        // Ensemble weights: how much each signal contributes
        this.WEIGHTS = {
            frequency: 0.25,      // Base frequency is important
            recency: 0.20,        // Recent patterns matter
            coOccurrence: 0.20,   // Clustering patterns
            trend: 0.15,          // Momentum/drift
            entropyReduction: 0.20 // Signal-to-noise filtering
        };

        this.TARGET_COUNT = 5; // Always output exactly 5 numbers
    }

    /**
     * Calculate frequency score (normalized, 0-1)
     * WHY: Numbers appearing more often are more "active"
     */
    scoreFrequency(number, features) {
        const freq = features.frequencies[number];
        return freq ? freq.normalizedWeight : 0;
    }

    /**
     * Calculate recency score based on recent window
     * WHY: Recent appearances indicate current activity
     */
    scoreRecency(number, features) {
        const freq = features.frequencies[number];
        return freq ? freq.recentCount > 0 ? freq.recentCount / features.totalRecords : 0 : 0;
    }

    /**
     * Calculate trend score (momentum)
     * WHY: Trending up = hot number; trending down = cold number
     * Range: [-1, 1] where positive = hot, negative = cold
     */
    scoreTrend(number, features) {
        const trend = features.trends[number] || 0;
        // Normalize trend to [-1, 1] range
        // Positive trend (number getting hotter) increases score
        return Math.max(-1, Math.min(1, trend)) * 0.5 + 0.5; // Shift to [0, 1]
    }

    /**
     * Calculate co-occurrence score
     * WHY: Numbers that cluster with other frequent numbers are more "compatible"
     */
    scoreCoOccurrence(number, features) {
        const relevantPairs = Object.values(features.pairs).filter(p =>
            (p.num1 === number || p.num2 === number)
        );

        if (relevantPairs.length === 0) return 0;

        // Average strength of partnerships with other numbers
        const avgStrength = relevantPairs.reduce((sum, p) => sum + p.strength, 0) / relevantPairs.length;
        return Math.min(1, avgStrength);
    }

    /**
     * Calculate information score (inverse entropy)
     * WHY: Low noise = strong signal
     */
    scoreInformation(number, features) {
        const entropy = features.entropyScores[number] || 0;
        return 1 - entropy; // Flip: low entropy = high information score
    }

    /**
     * COMPOSITE SCORING FUNCTION
     * Combines all 5 signals with ensemble weights
     * 
     * @param {number} number - Candidate number to score
     * @param {Object} features - Feature object from feature_engineering
     * @param {Array} selectedNumbers - Already selected numbers (for clustering penalty)
     * @returns {number} Final composite score [0, 1]
     */
    computeCompositeScore(number, features, selectedNumbers = []) {
        // Individual component scores
        const freqScore = this.scoreFrequency(number, features);
        const recencyScore = this.scoreRecency(number, features);
        const trendScore = this.scoreTrend(number, features);
        const cooccurrenceScore = this.scoreCoOccurrence(number, features);
        const informationScore = this.scoreInformation(number, features);

        // Weighted ensemble
        let compositeScore = 
            this.WEIGHTS.frequency * freqScore +
            this.WEIGHTS.recency * recencyScore +
            this.WEIGHTS.trend * trendScore +
            this.WEIGHTS.coOccurrence * cooccurrenceScore +
            this.WEIGHTS.entropyReduction * informationScore;

        // Apply anti-clustering penalty if numbers already selected
        if (selectedNumbers.length > 0) {
            const clusterPenalty = featureEngineer.computeClusteringPenalty(
                number,
                selectedNumbers,
                features.frequencies
            );
            compositeScore *= (1 - clusterPenalty * 0.3); // Penalty weight: 30%
        }

        return Math.max(0, Math.min(1, compositeScore)); // Clamp to [0, 1]
    }

    /**
     * CANDIDATE FILTERING & REDUCTION
     * WHY: Eliminate low-information candidates before selection
     * 
     * Filters out numbers with:
     * - Very low frequency scores (noise)
     * - Very high entropy (no consistent patterns)
     * - Extremely low recent activity (stale numbers)
     */
    filterCandidates(features, minThreshold = 0.15) {
        const candidates = [];

        for (let num = 1; num <= 90; num++) {
            const freqScore = this.scoreFrequency(num, features);
            const entropyScore = this.scoreInformation(num, features);

            // Keep only candidates with sufficient signal
            if (freqScore > minThreshold || entropyScore > 0.4) {
                candidates.push(num);
            }
        }

        return candidates;
    }

    /**
     * GREEDY SELECTION: Top-5 with anti-clustering
     * 
     * WHY greedy (not optimization):
     * - Polynomial complexity vs exponential (feasible for real-time)
     * - Iteratively picks best candidate, then recalculates for remaining
     * - Anti-clustering naturally spreads numbers across ranges
     * 
     * Algorithm:
     * 1. Score all candidates
     * 2. Pick highest-scoring remaining candidate
     * 3. Apply anti-clustering penalty to similar numbers
     * 4. Repeat until N=5
     */
    selectTop5(features, randomSeed = null) {
        const candidates = this.filterCandidates(features);

        if (candidates.length === 0) {
            // Fallback: if no candidates pass filter, use all
            for (let i = 1; i <= 90; i++) {
                candidates.push(i);
            }
        }

        const selected = [];
        const candidateScores = {};

        // Score all candidates initially
        candidates.forEach(num => {
            candidateScores[num] = this.computeCompositeScore(num, features, []);
        });

        // Greedy selection: pick top 5
        while (selected.length < this.TARGET_COUNT && candidates.length > 0) {
            // Find best remaining candidate
            let bestNum = null;
            let bestScore = -1;

            candidates.forEach(num => {
                const score = this.computeCompositeScore(num, features, selected);
                if (score > bestScore) {
                    bestScore = score;
                    bestNum = num;
                }
            });

            if (bestNum !== null) {
                selected.push({
                    number: bestNum,
                    score: bestScore,
                    rank: selected.length + 1
                });

                // Remove from candidates
                const idx = candidates.indexOf(bestNum);
                if (idx > -1) {
                    candidates.splice(idx, 1);
                }
            } else {
                break;
            }
        }

        // Sort by number value (ascending) for display
        return selected
            .sort((a, b) => a.number - b.number)
            .map((item, idx) => ({
                ...item,
                confidenceScore: item.score // Confidence is the composite score
            }));
    }

    /**
     * MAIN PREDICTION FUNCTION
     * Takes historical records and returns predicted 5 numbers
     */
    predict(records, gameType = 'evening') {
        if (records.length === 0) {
            throw new Error(`No historical records available for ${gameType} game`);
        }

        // Extract features from training data
        const features = featureEngineer.extractAllFeatures(records);

        // Select top 5 numbers
        const predictions = this.selectTop5(features);

        return {
            gameType: gameType,
            predictions: predictions.map(p => ({
                number: p.number,
                confidenceScore: (p.confidenceScore * 100).toFixed(2) // Convert to percentage
            })),
            predictionDetails: {
                totalHistoricalDraws: records.length,
                candidatesConsidered: this.filterCandidates(features).length,
                ensembleWeights: this.WEIGHTS
            }
        };
    }
}

const ensemblePredictor = new EnsemblePredictor();
