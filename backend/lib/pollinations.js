const OpenAI = require('openai');

const pollinations = new OpenAI({
  baseURL: 'https://gen.pollinations.ai/v1',
  apiKey: process.env.POLLINATIONS_API_KEY,
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}`,
  },
});

module.exports = { pollinations };
