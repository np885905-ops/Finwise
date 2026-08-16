const { CATEGORIES } = require('./mockData');

// Simple keyword matching for automatic categorization suggestion
const suggestCategoryLocal = (description) => {
  const desc = (description || '').toLowerCase();
  
  const foodKeywords = ['pizza', 'burger', 'food', 'restaurant', 'swiggy', 'zomato', 'cafe', 'grocery', 'groceries', 'reliance fresh', 'dinner', 'lunch', 'breakfast', 'starbucks', 'supermarket', 'eat', 'hotel', 'maggi', 'tea', 'coffee'];
  const travelKeywords = ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'metro', 'train', 'flight', 'travel', 'irctc', 'cab', 'bus', 'rapido', 'locomotive', 'diesel'];
  const shoppingKeywords = ['amazon', 'flipkart', 'myntra', 'shoes', 'shirt', 'clothes', 'shopping', 'headphones', 'laptop', 'gadget', 'wear', 'tshirt', 'jeans', 'watch'];
  const billsKeywords = ['rent', 'electricity', 'water', 'bill', 'wifi', 'broadband', 'phone', 'recharge', 'utilities', 'gas', 'power', 'telecom'];
  const educationKeywords = ['course', 'udemy', 'coursera', 'tuition', 'school', 'college', 'fees', 'book', 'education', 'tutorial', 'class', 'academy', 'certification'];
  const healthKeywords = ['medicine', 'pharmacy', 'hospital', 'doctor', 'health', 'clinic', 'prescription', 'pharma', 'medical', 'dental', 'optician'];
  const entKeywords = ['movie', 'theatre', 'netflix', 'hulu', 'gaming', 'ticket', 'concert', 'pub', 'bar', 'club', 'party', 'spotify', 'disney', 'prime'];

  if (foodKeywords.some(kw => desc.includes(kw))) return 'Food';
  if (travelKeywords.some(kw => desc.includes(kw))) return 'Travel';
  if (shoppingKeywords.some(kw => desc.includes(kw))) return 'Shopping';
  if (billsKeywords.some(kw => desc.includes(kw))) return 'Bills';
  if (educationKeywords.some(kw => desc.includes(kw))) return 'Education';
  if (healthKeywords.some(kw => desc.includes(kw))) return 'Health';
  if (entKeywords.some(kw => desc.includes(kw))) return 'Entertainment';
  
  return 'Other';
};

// Generic REST call helper to Gemini 2.5 Flash API
const callGemini = async (systemInstruction, prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemInstruction}\n\nUser Query/Context: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error: Status ${response.status} - ${errText}`);
      return null;
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.error('Network error calling Gemini API:', err);
    return null;
  }
};

// Gemini API PDF direct REST integration (inline base64 document upload)
const callGeminiWithPDF = async (systemInstruction, base64PDF) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64PDF
                }
              },
              {
                text: systemInstruction
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini PDF API Error: Status ${response.status} - ${errText}`);
      return null;
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.error('Network error calling Gemini PDF API:', err);
    return null;
  }
};

// Heuristics: Budget Recommendations
const generateBudgetRecommendations = async (context) => {
  const { spendingMap, currentBudgets } = context;
  const recommendations = [];

  CATEGORIES.forEach(cat => {
    const spent = spendingMap[cat] || 0;
    const currentLimit = currentBudgets[cat] || 0;
    
    let recommendedLimit = Math.max(Math.round((spent * 1.1) / 500) * 500, 1000);
    
    if (spent === 0) {
      recommendedLimit = currentLimit > 0 ? currentLimit : 3000;
    }

    let reason = '';
    if (spent > currentLimit && currentLimit > 0) {
      reason = `You overspent your ₹${currentLimit.toLocaleString('en-IN')} limit by ₹${(spent - currentLimit).toLocaleString('en-IN')} in this category. We recommend increasing it slightly.`;
    } else if (spent > 0 && spent < currentLimit * 0.6) {
      reason = `You spent only ₹${spent.toLocaleString('en-IN')} (less than 60% of your ₹${currentLimit.toLocaleString('en-IN')} limit). Consider lowering this budget to save more.`;
    } else if (spent > 0) {
      reason = `Your spending (₹${spent.toLocaleString('en-IN')}) is healthy. Keeping the budget around ₹${recommendedLimit.toLocaleString('en-IN')} provides a 10% safety buffer.`;
    } else {
      reason = `No recent expense recorded in this category. Recommending a baseline budget of ₹${recommendedLimit.toLocaleString('en-IN')}.`;
    }

    recommendations.push({
      category: cat,
      currentLimit,
      recommendedLimit,
      reason
    });
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const systemInstruction = "You are a personal financial advisor. You will receive spending averages, current limits, and baseline budget recommendations. Polish the 'reason' sentences to make them read like high-quality financial coaching advice, but keep them concise. Format your response strictly as a JSON array matching the structure: [{ category, currentLimit, recommendedLimit, reason }]. Do not include markdown codeblocks (no ```json).";
    
    const prompt = JSON.stringify(recommendations);
    const aiResponse = await callGemini(systemInstruction, prompt);
    if (aiResponse) {
      try {
        const cleanedText = aiResponse.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        return JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse Gemini recommendations JSON. Returning baseline heuristics:', e);
      }
    }
  }

  return recommendations;
};

// Heuristics: Next-Month Predictions
const generatePredictions = async (context) => {
  const { totalSpent, categorySpending, expensesCount } = context;
  const prediction = {
    estimatedTotal: 0,
    categoryEstimates: {},
    comparison: '',
    explanation: '',
    insufficientData: false
  };

  if (expensesCount < 3) {
    prediction.insufficientData = true;
    prediction.explanation = "More transaction history (minimum 3 logs) is required to calculate dynamic spending predictions.";
    return prediction;
  }

  let totalEst = 0;
  CATEGORIES.forEach(cat => {
    const spent = categorySpending[cat] || 0;
    let factor = 1.0;
    if (cat === 'Food') factor = 0.95;
    if (cat === 'Shopping') factor = 0.90;
    if (cat === 'Entertainment') factor = 0.85;
    
    const catEst = Math.round(spent * factor);
    prediction.categoryEstimates[cat] = catEst;
    totalEst += catEst;
  });

  prediction.estimatedTotal = totalEst;
  
  const diffPercent = Math.round(((totalEst - totalSpent) / (totalSpent || 1)) * 100);
  if (diffPercent < 0) {
    prediction.comparison = `Projected to be ${Math.abs(diffPercent)}% LOWER than this month.`;
    prediction.explanation = `Based on historical logs, you are expected to spend less on discretionary categories like Shopping and Entertainment. Total next-month outflows should settle around ₹${totalEst.toLocaleString('en-IN')}.`;
  } else {
    prediction.comparison = `Projected to be ${diffPercent}% HIGHER than this month.`;
    prediction.explanation = `Projected spending is slightly higher (₹${totalEst.toLocaleString('en-IN')}) due to baseline repeating utility bills and food rates.`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const systemInstruction = "You are a personal financial chatbot. You will receive spending statistics and calculated next-month estimations. Write a short explanation (2-3 sentences max) analyzing these next-month predictions. Emphasize discretionary cuts. Keep it professional. Add the disclaimer: 'Predictions are estimates only.'";
    const prompt = `This Month Total Spend: ₹${totalSpent}. Next Month Projected Total Spend: ₹${totalEst}. Category Breakdown: ${JSON.stringify(prediction.categoryEstimates)}.`;
    
    const aiText = await callGemini(systemInstruction, prompt);
    if (aiText) {
      prediction.explanation = aiText.trim();
    }
  }

  return prediction;
};

// Conversational Local Chat Assistant Responder
const getChatResponseLocal = (query, context) => {
  const { totalIncome, totalExpenses, totalSavings, savingsRate, categorySpending, budgets, goals } = context;
  const q = query.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello! I am your FinWise Copilot. I analyze your income, expense registers, budgets, and goals to provide wealth-building strategies. What would you like to explore?";
  }
  
  if (q.includes('spend') || q.includes('expense') || q.includes('outflow')) {
    if (q.includes('most') || q.includes('highest') || q.includes('maximum')) {
      let maxCat = '';
      let maxAmt = -1;
      for (let cat in categorySpending) {
        if (categorySpending[cat] > maxAmt) {
          maxAmt = categorySpending[cat];
          maxCat = cat;
        }
      }
      return maxAmt > 0 
        ? `Your highest expenditure category is '${maxCat}' with total spending of ₹${maxAmt.toLocaleString('en-IN')}.`
        : "You haven't recorded any expenses yet.";
    }

    for (let cat of CATEGORIES) {
      if (q.includes(cat.toLowerCase())) {
        const amt = categorySpending[cat] || 0;
        return `You have spent ₹${amt.toLocaleString('en-IN')} on '${cat}' this month.`;
      }
    }

    return `Your total expenses logged for the current period amount to ₹${totalExpenses.toLocaleString('en-IN')}.`;
  }

  if (q.includes('income') || q.includes('salary') || q.includes('earn')) {
    return `Your total income logged in the database is ₹${totalIncome.toLocaleString('en-IN')}.`;
  }

  if (q.includes('saving') || q.includes('savings') || q.includes('save')) {
    if (q.includes('laptop') || q.includes('goal')) {
      const laptop = goals.find(g => g.name.toLowerCase().includes('laptop') || g.name.toLowerCase().includes('macbook'));
      if (laptop) {
        const remaining = laptop.targetAmount - laptop.currentAmount;
        const percent = Math.round((laptop.currentAmount / laptop.targetAmount) * 100);
        return `For your goal '${laptop.name}', you have saved ₹${laptop.currentAmount.toLocaleString('en-IN')} (${percent}% complete). You require ₹${remaining.toLocaleString('en-IN')} more by ${laptop.targetDate}.`;
      }
    }
    return `You have saved ₹${totalSavings.toLocaleString('en-IN')} this month (representing a ${savingsRate}% savings rate).`;
  }

  if (q.includes('budget') || q.includes('limit') || q.includes('exceed')) {
    const overList = budgets.filter(b => {
      const spent = categorySpending[b.category] || 0;
      return spent > b.limit;
    });

    if (overList.length > 0) {
      const names = overList.map(b => `${b.category} (Spent ₹${(categorySpending[b.category] || 0).toLocaleString('en-IN')} vs limit ₹${b.limit.toLocaleString('en-IN')})`).join(', ');
      return `Warning: You have exceeded budgets in the following categories: ${names}. Consider dialing back discretionary spending.`;
    }

    const warningList = budgets.filter(b => {
      const spent = categorySpending[b.category] || 0;
      return spent >= b.limit * 0.8 && spent <= b.limit;
    });

    if (warningList.length > 0) {
      const names = warningList.map(b => b.category).join(', ');
      return `Attention: You are close (80%+) to exceeding budgets in: ${names}.`;
    }

    return "All budgets are healthy! No overruns or threshold warnings detected.";
  }

  return "I've received your query. Ask me specifically about your 'income', 'expenses', 'highest category spent', or your 'savings rate' to get an exact mathematical breakdown from your database logs.";
};

module.exports = {
  suggestCategoryLocal,
  callGemini,
  callGeminiWithPDF,
  generateBudgetRecommendations,
  generatePredictions,
  getChatResponseLocal
};
