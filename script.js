// script.js

// Fixed Item Categories for the 8 Rounds
const ITEMS = [
    { name: "Smartphone", icon: "📱", minVal: 40000, maxVal: 60000 },
    { name: "Laptop", icon: "💻", minVal: 55000, maxVal: 80000 },
    { name: "Headphones", icon: "🎧", minVal: 5000, maxVal: 10000 },
    { name: "Smartwatch", icon: "⌚", minVal: 10000, maxVal: 18000 },
    { name: "Gaming Console", icon: "🎮", minVal: 30000, maxVal: 45000 },
    { name: "Electric Guitar", icon: "🎸", minVal: 20000, maxVal: 40000 },
    { name: "Digital Camera", icon: "📷", minVal: 35000, maxVal: 65000 },
    { name: "Gaming Monitor", icon: "🖥️", minVal: 15000, maxVal: 30000 }
];

// Computer Bidding Personalities
const COMPUTER_PROFILES = [
    { name: "Computer 1", personality: "Conservative", minValPct: 0.85, maxValPct: 1.00, minBidPct: 0.80, maxBidPct: 0.88 },
    { name: "Computer 2", personality: "Moderate", minValPct: 0.90, maxValPct: 1.05, minBidPct: 0.87, maxBidPct: 0.94 },
    { name: "Computer 3", personality: "Aggressive", minValPct: 0.95, maxValPct: 1.10, minBidPct: 0.92, maxBidPct: 0.98 }
];

// Game State variables
let currentRound = 0; // 0 to 4 (Rounds 1 to 5)
let gameData = []; // Will hold generated data for all 5 rounds
let playerBids = []; // Will hold player's validated bids for each round

let totalRoundsWon = 0;
let totalPaidAmount = 0;
let totalUtilityAmount = 0;

// UI Elements
const currentRoundText = document.getElementById('current-round-text');
const itemNameEl = document.getElementById('item-name');
const playerValuationEl = document.getElementById('player-valuation');
const bidInput = document.getElementById('bid-input');
const placeBidBtn = document.getElementById('place-bid-btn');
const newGameBtn = document.getElementById('new-game-btn');
const validationMsg = document.getElementById('validation-msg');

const biddingSection = document.getElementById('bidding-section');
const resultSection = document.getElementById('result-section');
const finalSummarySection = document.getElementById('final-summary-section');
const itemCard = document.querySelector('.item-card');
const nextRoundBtn = document.getElementById('next-round-btn');
const playAgainBtn = document.getElementById('play-again-btn');

const landingPage = document.getElementById('landing-page');
const gamePage = document.getElementById('game-page');
const startAuctionBtn = document.getElementById('start-auction-btn');

// Scoreboard Elements
const roundsWonEl = document.getElementById('rounds-won');
const totalPaidEl = document.getElementById('total-paid');
const totalUtilityEl = document.getElementById('total-utility');

/**
 * Utility to format numbers as Currency (₹XX,XXX)
 */
function formatCurrency(amount) {
    if (amount < 0) {
        return `-₹${Math.abs(amount).toLocaleString('en-IN')}`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Utility to generate a random multiple of 500 within a range
 */
function getRandomValuation(min, max) {
    const range = (max - min) / 500;
    const randomStep = Math.floor(Math.random() * (range + 1));
    return min + (randomStep * 500);
}

/**
 * Utility to generate a random percentage between min and max
 */
function getRandomPercentage(min, max) {
    return min + (Math.random() * (max - min));
}

/**
 * Generates all data for a new game
 */
function generateGameData() {
    gameData = [];
    playerBids = [];
    
    ITEMS.forEach(item => {
        const playerValuation = getRandomValuation(item.minVal, item.maxVal);
        
        const computers = COMPUTER_PROFILES.map(profile => {
            // Generate valuation relative to player valuation
            const valPct = getRandomPercentage(profile.minValPct, profile.maxValPct);
            let compValuation = playerValuation * valPct;
            
            // Clamp to item min/max bounds
            compValuation = Math.max(item.minVal, Math.min(item.maxVal, compValuation));
            
            // Round valuation to nearest 500
            compValuation = Math.round(compValuation / 500) * 500;
            
            // Calculate bid based on new strategy percentage and round to nearest 500 for clean numbers
            const strategyPct = getRandomPercentage(profile.minBidPct, profile.maxBidPct);
            let rawBid = compValuation * strategyPct;
            let finalBid = Math.round(rawBid / 500) * 500;
            
            return {
                name: profile.name,
                personality: profile.personality,
                valuation: compValuation,
                strategyPercentage: strategyPct,
                bid: finalBid
            };
        });
        
        gameData.push({
            item: item,
            playerValuation: playerValuation,
            computers: computers
        });
    });
}

/**
 * Starts a new game, resets states, and loads round 1
 */
function startNewGame() {
    generateGameData();
    currentRound = 0;
    playerBids = [];
    
    totalRoundsWon = 0;
    totalPaidAmount = 0;
    totalUtilityAmount = 0;
    
    updateScoreboard();
    
    // UI toggles
    biddingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    finalSummarySection.classList.add('hidden');
    itemCard.classList.remove('hidden');
    
    loadRoundUI();
}

/**
 * Updates the UI with the data for the current round
 */
function loadRoundUI() {
    const roundData = gameData[currentRound];
    
    currentRoundText.textContent = `ROUND ${currentRound + 1} / 8`;
    itemNameEl.textContent = `${roundData.item.icon} ${roundData.item.name}`;
    playerValuationEl.textContent = formatCurrency(roundData.playerValuation);
    
    bidInput.value = '';
    validationMsg.textContent = '';
    placeBidBtn.disabled = false;
    placeBidBtn.textContent = 'SUBMIT BID';
    
    // UI toggles
    biddingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
}

/**
 * Updates the sidebar scoreboard
 */
function updateScoreboard() {
    roundsWonEl.textContent = totalRoundsWon;
    totalPaidEl.textContent = formatCurrency(totalPaidAmount);
    totalUtilityEl.textContent = formatCurrency(totalUtilityAmount);
}

/**
 * Handle bid placement and validation
 */
function handlePlaceBid() {
    const bidValueRaw = bidInput.value.trim();
    
    // Clear standard errors, warnings are handled on input
    if (validationMsg.style.color === 'rgb(255, 107, 107)' || validationMsg.style.color === '#ff6b6b') {
        validationMsg.textContent = '';
    }
    
    if (bidValueRaw === '') {
        validationMsg.style.color = '#ff6b6b';
        validationMsg.textContent = 'Please enter a bid amount.';
        return;
    }
    
    const bidValue = Number(bidValueRaw);
    
    if (isNaN(bidValue)) {
        validationMsg.style.color = '#ff6b6b';
        validationMsg.textContent = 'Please enter a valid bid amount.';
        return;
    }
    
    if (bidValue <= 0) {
        validationMsg.style.color = '#ff6b6b';
        validationMsg.textContent = 'Bid must be greater than 0.';
        return;
    }
    
    if (!Number.isInteger(bidValue)) {
        validationMsg.style.color = '#ff6b6b';
        validationMsg.textContent = 'Please enter a whole number.';
        return;
    }
    
    // Validation successful
    playerBids[currentRound] = bidValue;
    
    // Proceed to calculate the result of the auction for this round
    calculateAuctionResult(bidValue);
}

/**
 * Determine winner and process Vickrey Auction rules
 */
function calculateAuctionResult(playerBid) {
    const roundData = gameData[currentRound];
    
    // 1. Collect all bids
    const allBids = [
        { name: "Player", bid: playerBid, isPlayer: true, order: 0 }
    ];
    
    roundData.computers.forEach((comp, index) => {
        allBids.push({
            name: comp.name,
            bid: comp.bid,
            isPlayer: false,
            order: index + 1
        });
    });
    
    // 2. Sort bids highest to lowest. Tie breaker: earlier order wins.
    allBids.sort((a, b) => {
        if (b.bid !== a.bid) {
            return b.bid - a.bid;
        }
        return a.order - b.order; // deterministic tie-break: Player wins ties against computer
    });
    
    // 3. Determine winner and second highest bid
    const winner = allBids[0];
    const secondHighestBid = allBids[1].bid;
    
    let playerPayment = 0;
    let playerUtility = 0;
    
    // 4. Calculate payment and utility
    if (winner.isPlayer) {
        playerPayment = secondHighestBid;
        playerUtility = roundData.playerValuation - playerPayment;
        
        totalRoundsWon++;
        totalPaidAmount += playerPayment;
        totalUtilityAmount += playerUtility;
    }
    
    updateScoreboard();
    showRoundResult(winner, secondHighestBid, playerPayment, playerUtility, allBids);
}

/**
 * Show the result of the current round
 */
function showRoundResult(winner, secondHighestBid, playerPayment, playerUtility, allBids) {
    const roundData = gameData[currentRound];
    
    biddingSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    
    const titleEl = document.getElementById('result-title');
    const detailsEl = document.getElementById('result-details');
    const ruleNoteEl = document.getElementById('rule-note');
    
    const playerBidObj = allBids.find(b => b.isPlayer);
    
    let html = '';
    if (winner.isPlayer) {
        titleEl.textContent = '🏆 YOU WON!';
        titleEl.style.color = '';
        titleEl.className = 'result-title winner-green';
        
        const utilityFormatted = playerUtility >= 0 ? `+${formatCurrency(playerUtility)}` : formatCurrency(playerUtility);
        const utilityClass = playerUtility >= 0 ? 'highlight-gold' : 'highlight-red';
        
        html += `
            <div class="result-row"><span>Winning Bid:</span> <span class="highlight">${formatCurrency(winner.bid)}</span></div>
            <div class="result-row"><span>Second-Highest Bid / Payment:</span> <span>${formatCurrency(playerPayment)}</span></div>
            <div class="result-row"><span>Your Valuation:</span> <span>${formatCurrency(roundData.playerValuation)}</span></div>
            <div class="result-row"><span>Your Utility:</span> <span class="${utilityClass}">${utilityFormatted}</span></div>
        `;
        ruleNoteEl.textContent = 'Your payment was based on the second-highest bid.';
        ruleNoteEl.classList.remove('hidden');
    } else {
        titleEl.textContent = 'COMPUTER WON';
        titleEl.style.color = '';
        titleEl.className = 'result-title winner-orange';
        
        html += `
            <div class="result-row"><span>Winner:</span> <span class="highlight">${winner.name}</span></div>
            <div class="result-row"><span>Winning Bid:</span> <span class="highlight">${formatCurrency(winner.bid)}</span></div>
            <div class="result-row"><span>Your Bid:</span> <span>${formatCurrency(playerBidObj.bid)}</span></div>
            <div class="result-row"><span>Your Payment:</span> <span>₹0</span></div>
            <div class="result-row"><span>Your Utility:</span> <span>₹0</span></div>
        `;
        ruleNoteEl.classList.add('hidden');
    }
    detailsEl.innerHTML = html;
    
    // Build Bid Breakdown
    const bidListEl = document.getElementById('bid-list');
    bidListEl.innerHTML = '';
    
    allBids.forEach(bidObj => {
        const li = document.createElement('li');
        li.className = 'bid-item';
        if (bidObj.name === winner.name) {
            li.classList.add('winner');
            if (bidObj.isPlayer) {
                li.classList.add('winner-player');
            } else {
                li.classList.add('winner-computer');
            }
        }
        
        const label = bidObj.isPlayer ? "Your Bid" : `${bidObj.name} Bid`;
        li.innerHTML = `<span>${label}</span><span>${formatCurrency(bidObj.bid)}</span>`;
        bidListEl.appendChild(li);
    });
}

/**
 * Go to the next round or end the game
 */
function nextRound() {
    currentRound++;
    if (currentRound >= 8) {
        showFinalResult();
    } else {
        loadRoundUI();
    }
}

const GAME_THEORY_INFO = {
    winnerDetermination: "The highest bid wins the auction.",
    paymentRule: "The winner pays the second-highest bid.",
    utility: "Utility = Private Valuation − Payment.",
    auctionMechanism: "Vickrey (second-price sealed-bid) auction.",
    strategicPrinciple: "Under standard private-value assumptions, truthful bidding is a dominant strategy."
};

function evaluatePlayerPerformance() {
    const winRate = (totalRoundsWon / 8) * 100;
    const avgUtility = totalUtilityAmount / 8;
    
    let title = "";
    let description = "";

    if (totalUtilityAmount < 0) {
        title = "OVERBIDDING / NEEDS IMPROVEMENT";
        description = "Your overall utility was negative, which suggests that some bids were too high relative to the value you received. In a Vickrey auction, winning an auction is not always beneficial if the payment reduces your utility.";
    } else if (totalUtilityAmount === 0) {
        title = "NEUTRAL PERFORMANCE";
        description = "Your overall utility was zero. You avoided an overall loss, but your bidding strategy did not generate positive value across the auctions.";
    } else if (totalUtilityAmount > 0) {
        if (winRate < 25) {
            title = "EFFICIENT SELECTIVE BIDDING";
            description = "You won relatively few auctions but still generated positive overall utility. This indicates that your successful bids created value without requiring frequent wins.";
        } else if (winRate >= 25 && winRate < 50) {
            title = "GOOD STRATEGIC PERFORMANCE";
            description = "You generated positive overall utility with a moderate number of successful auctions. Your bidding strategy produced value while avoiding unnecessary wins.";
        } else if (winRate >= 50 && winRate < 75) {
            title = "STRONG STRATEGIC PERFORMANCE";
            description = "You achieved a strong balance between winning auctions and generating positive utility. Your bidding decisions were generally effective and value-oriented.";
        } else {
            title = "EXCELLENT STRATEGIC PERFORMANCE";
            description = "You won most auctions while maintaining positive overall utility. This indicates a strong balance between successful bidding and value generation.";
        }
    }

    return {
        title,
        description,
        winRate,
        avgUtility
    };
}

/**
 * Show the final game summary
 */
function showFinalResult() {
    resultSection.classList.add('hidden');
    itemCard.classList.add('hidden');
    finalSummarySection.classList.remove('hidden');
    
    const performance = evaluatePlayerPerformance();
    
    document.getElementById('final-rounds-won').textContent = `${totalRoundsWon} / 8`;
    document.getElementById('final-win-rate').textContent = `${performance.winRate.toFixed(1)}%`;
    document.getElementById('final-total-paid').textContent = formatCurrency(totalPaidAmount);
    document.getElementById('final-total-utility').textContent = formatCurrency(totalUtilityAmount);
    const msgEl = document.getElementById('final-message');
    msgEl.innerHTML = `<strong>${performance.title}</strong><br><br>${performance.description}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    startAuctionBtn.addEventListener('click', () => {
        landingPage.classList.add('hidden');
        gamePage.classList.remove('hidden');
        startNewGame();
    });
    
    placeBidBtn.addEventListener('click', handlePlaceBid);
    
    newGameBtn.addEventListener('click', startNewGame);
    
    nextRoundBtn.addEventListener('click', nextRound);
    
    playAgainBtn.addEventListener('click', startNewGame);
    
    bidInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            placeBidBtn.click();
        }
    });
    
    // Real-time validation for overbidding warning
    bidInput.addEventListener('input', () => {
        const val = Number(bidInput.value);
        const playerValuation = gameData[currentRound] ? gameData[currentRound].playerValuation : 0;
        
        if (val > playerValuation) {
            validationMsg.textContent = 'Warning: Your bid is above your private valuation. You may risk negative utility.';
            validationMsg.style.color = '#ff9f43';
        } else {
            // Only clear warning messages, keep red errors if they were not related to input value
            if (validationMsg.style.color === 'rgb(255, 159, 67)' || validationMsg.style.color === '#ff9f43') {
                validationMsg.textContent = '';
            }
        }
    });
});
