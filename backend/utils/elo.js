/**
 * ELO Rating System
 * K-factor: 32 (standard for lower elo players)
 */

const K = 32;

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function calculateElo(ratingA, ratingB, winner) {
  const eA = expectedScore(ratingA, ratingB);
  const eB = expectedScore(ratingB, ratingA);

  let scoreA, scoreB;
  if (winner === 'A') {
    scoreA = 1;
    scoreB = 0;
  } else if (winner === 'B') {
    scoreA = 0;
    scoreB = 1;
  } else {
    scoreA = 0.5;
    scoreB = 0.5;
  }

  const newRatingA = Math.round(ratingA + K * (scoreA - eA));
  const newRatingB = Math.round(ratingB + K * (scoreB - eB));

  return {
    newRatingA,
    newRatingB,
    changeA: newRatingA - ratingA,
    changeB: newRatingB - ratingB,
  };
}

module.exports = { calculateElo };
