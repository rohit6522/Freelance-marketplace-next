export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// 280 ko [20, 30, 30, 20] percent me todta hai. Aakhri hissa bacha hua paisa leta hai,
// isliye total hamesha exactly original amount hota hai.
export const splitAmount = (amount, percents) => {
  const total = Math.round(amount * 100);
  let used = 0;

  return percents.map((percent, i) => {
    const cents =
      i === percents.length - 1 ? total - used : Math.floor((total * percent) / 100);
    used += cents;
    return cents / 100;
  });
};

export const round1 = (n) => Math.round((Number(n) + Number.EPSILON) * 10) / 10;

export const formatMoney = (n) => `$${Number(n).toFixed(2)}`;