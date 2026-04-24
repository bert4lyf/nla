/**
 * HISTORICAL DATA MODULE
*/

const HISTORICAL_DATA = [
    // Week 1 (shifted to April 1-5, 2026)
    { date: '2026-04-01', day: 'Wednesday', gameType: 'evening', numbers: [2, 8, 15, 23, 31, 45, 67, 78, 84, 89] },
    { date: '2026-04-01', day: 'Wednesday', gameType: 'noon', numbers: [5, 12, 28, 34, 56] },
    { date: '2026-04-02', day: 'Thursday', gameType: 'evening', numbers: [3, 11, 22, 38, 41, 52, 63, 75, 81, 87] },
    { date: '2026-04-02', day: 'Thursday', gameType: 'noon', numbers: [7, 19, 33, 48, 72] },
    { date: '2026-04-03', day: 'Friday', gameType: 'evening', numbers: [1, 9, 24, 36, 44, 58, 68, 76, 85, 90] },
    { date: '2026-04-03', day: 'Friday', gameType: 'noon', numbers: [6, 18, 29, 42, 64] },
    { date: '2026-04-04', day: 'Saturday', gameType: 'evening', numbers: [4, 13, 27, 39, 47, 61, 70, 79, 83, 88] },
    { date: '2026-04-04', day: 'Saturday', gameType: 'noon', numbers: [8, 21, 35, 51, 69] },
    { date: '2026-04-05', day: 'Sunday', gameType: 'evening', numbers: [5, 14, 25, 37, 49, 59, 71, 80, 86, 89] },
    { date: '2026-04-05', day: 'Sunday', gameType: 'noon', numbers: [9, 26, 40, 55, 73] },

    // Week 2 (April 6-10)
    { date: '2026-04-06', day: 'Monday', gameType: 'evening', numbers: [2, 10, 20, 33, 46, 57, 65, 77, 82, 87] },
    { date: '2026-04-06', day: 'Monday', gameType: 'noon', numbers: [11, 31, 44, 58, 74] },
    { date: '2026-04-07', day: 'Tuesday', gameType: 'evening', numbers: [3, 12, 28, 34, 51, 62, 69, 78, 84, 88] },
    { date: '2026-04-07', day: 'Tuesday', gameType: 'noon', numbers: [13, 27, 47, 60, 75] },
    { date: '2026-04-08', day: 'Wednesday', gameType: 'evening', numbers: [1, 8, 19, 35, 43, 56, 68, 75, 81, 89] },
    { date: '2026-04-08', day: 'Wednesday', gameType: 'noon', numbers: [10, 24, 41, 53, 76] },
    { date: '2026-04-09', day: 'Thursday', gameType: 'evening', numbers: [6, 15, 26, 38, 45, 59, 71, 79, 85, 90] },
    { date: '2026-04-09', day: 'Thursday', gameType: 'noon', numbers: [14, 32, 49, 61, 77] },
    { date: '2026-04-10', day: 'Friday', gameType: 'evening', numbers: [4, 11, 23, 36, 48, 63, 70, 80, 86, 87] },
    { date: '2026-04-10', day: 'Friday', gameType: 'noon', numbers: [12, 28, 39, 54, 78] },

    // Week 3 (April 11-13)
    { date: '2026-04-11', day: 'Saturday', gameType: 'evening', numbers: [2, 9, 21, 32, 44, 57, 66, 76, 83, 88] },
    { date: '2026-04-11', day: 'Saturday', gameType: 'noon', numbers: [7, 22, 37, 52, 68] },
    { date: '2026-04-12', day: 'Sunday', gameType: 'evening', numbers: [3, 10, 24, 37, 49, 61, 72, 79, 84, 89] },
    { date: '2026-04-12', day: 'Sunday', gameType: 'noon', numbers: [8, 25, 43, 58, 71] },
    { date: '2026-04-13', day: 'Monday', gameType: 'evening', numbers: [1, 7, 20, 35, 42, 54, 67, 77, 82, 87] },
    { date: '2026-04-13', day: 'Monday', gameType: 'noon', numbers: [6, 19, 36, 50, 69] },

    // Week 4 (April 14-18)
    { date: '2026-04-14', day: 'Tuesday', gameType: 'evening', numbers: [5, 12, 26, 39, 47, 60, 70, 81, 85, 88] },
    { date: '2026-04-14', day: 'Tuesday', gameType: 'noon', numbers: [11, 30, 45, 59, 72] },
    { date: '2026-04-15', day: 'Wednesday', gameType: 'evening', numbers: [2, 13, 27, 38, 46, 62, 69, 78, 83, 89] },
    { date: '2026-04-15', day: 'Wednesday', gameType: 'noon', numbers: [9, 29, 42, 56, 75] },
    { date: '2026-04-16', day: 'Thursday', gameType: 'evening', numbers: [3, 11, 22, 34, 51, 58, 68, 76, 82, 87] },
    { date: '2026-04-16', day: 'Thursday', gameType: 'noon', numbers: [10, 23, 40, 55, 70] },
    { date: '2026-04-17', day: 'Friday', gameType: 'evening', numbers: [4, 14, 25, 40, 48, 63, 71, 79, 86, 90] },
    { date: '2026-04-17', day: 'Friday', gameType: 'noon', numbers: [12, 31, 46, 61, 74] },
    { date: '2026-04-18', day: 'Saturday', gameType: 'evening', numbers: [1, 10, 28, 37, 44, 59, 67, 75, 84, 89] },
    { date: '2026-04-18', day: 'Saturday', gameType: 'noon', numbers: [8, 26, 38, 52, 73] },

    // Week 5 (April 19-23)
    { date: '2026-04-19', day: 'Sunday', gameType: 'evening', numbers: [6, 15, 29, 41, 50, 62, 72, 80, 87, 88] },
    { date: '2026-04-19', day: 'Sunday', gameType: 'noon', numbers: [13, 35, 51, 65, 76] },
    { date: '2026-04-20', day: 'Monday', gameType: 'evening', numbers: [2, 11, 24, 36, 45, 58, 68, 77, 81, 89] },
    { date: '2026-04-20', day: 'Monday', gameType: 'noon', numbers: [9, 27, 44, 60, 74] },
    { date: '2026-04-21', day: 'Tuesday', gameType: 'evening', numbers: [3, 12, 26, 39, 47, 61, 70, 78, 83, 87] },
    { date: '2026-04-21', day: 'Tuesday', gameType: 'noon', numbers: [10, 28, 42, 57, 72] },
    { date: '2026-04-22', day: 'Wednesday', gameType: 'evening', numbers: [5, 13, 23, 37, 49, 59, 69, 76, 85, 88] },
    { date: '2026-04-22', day: 'Wednesday', gameType: 'noon', numbers: [11, 32, 48, 62, 78] },
    { date: '2026-04-23', day: 'Thursday', gameType: 'evening', numbers: [1, 8, 20, 34, 43, 56, 67, 79, 82, 89] },
    { date: '2026-04-23', day: 'Thursday', gameType: 'noon', numbers: [7, 24, 39, 54, 71] },

    // Week 6 (April 24-28)
    { date: '2026-04-24', day: 'Friday', gameType: 'evening', numbers: [4, 14, 25, 35, 46, 60, 71, 77, 84, 88] },
    { date: '2026-04-24', day: 'Friday', gameType: 'noon', numbers: [12, 33, 47, 59, 73] },
    { date: '2026-04-25', day: 'Saturday', gameType: 'evening', numbers: [2, 10, 22, 38, 44, 57, 68, 78, 83, 87] },
    { date: '2026-04-25', day: 'Saturday', gameType: 'noon', numbers: [8, 26, 41, 55, 75] },
    { date: '2026-04-26', day: 'Sunday', gameType: 'evening', numbers: [3, 11, 28, 36, 49, 62, 69, 75, 81, 89] },
    { date: '2026-04-26', day: 'Sunday', gameType: 'noon', numbers: [9, 29, 43, 58, 72] },
    { date: '2026-04-27', day: 'Monday', gameType: 'evening', numbers: [5, 12, 24, 39, 47, 61, 70, 79, 85, 90] },
    { date: '2026-04-27', day: 'Monday', gameType: 'noon', numbers: [10, 31, 45, 60, 74] },
    { date: '2026-04-28', day: 'Tuesday', gameType: 'evening', numbers: [1, 9, 19, 37, 42, 54, 67, 76, 84, 88] },
    { date: '2026-04-28', day: 'Tuesday', gameType: 'noon', numbers: [7, 23, 38, 52, 71] }
];

/**
 * Get historical data for a specific game type
 * @param {string} gameType - 'evening' or 'noon'
 * @returns {Array} Filtered historical records
 */
function getHistoricalByGameType(gameType) {
    return HISTORICAL_DATA.filter(record => record.gameType === gameType);
}

/**
 * Get all unique historical numbers for a game type
 * @param {string} gameType - 'evening' or 'noon'
 * @returns {Array} All numbers that have appeared
 */
function getUniqueNumbers(gameType) {
    const records = getHistoricalByGameType(gameType);
    const uniqueSet = new Set();
    records.forEach(record => {
        record.numbers.forEach(num => uniqueSet.add(num));
    });
    return Array.from(uniqueSet).sort((a, b) => a - b);
}

/**
 * Get recent N draws for a game type
 * @param {string} gameType - 'evening' or 'noon'
 * @param {number} count - Number of recent draws
 * @returns {Array} Recent records sorted by date (newest first)
 */
function getRecentDraws(gameType, count = 10) {
    const records = getHistoricalByGameType(gameType);
    return records.slice(-count).reverse();
}

/**
 * Get draws before a specific date for training
 * @param {string} gameType - 'evening' or 'noon'
 * @param {Date} cutoffDate - Train on data before this date
 * @returns {Array} Historical records for training
 */
function getHistoricalBefore(gameType, cutoffDate) {
    const records = getHistoricalByGameType(gameType);
    return records.filter(r => new Date(r.date) < cutoffDate);
}
