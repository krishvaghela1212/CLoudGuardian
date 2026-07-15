const OpenAI = require('openai');
const logger = require('../../utils/logger');

// Lazy-initialize Groq Client (OpenAI-compatible API)
let groq;
function getClient() {
  if (!groq) {
    groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }
  return groq;
}

/**
 * Analyzes AWS resource data using Groq API.
 * @param {Object} awsData - The aggregated data from EC2, S3, RDS, Lambda scans.
 * @returns {Promise<Object>} - The structured JSON response.
 */
const analyzeCloudInfrastructure = async (awsData) => {
  try {
    const prompt = `
You are a Senior Cloud Architect and Security Expert.
Analyze the following raw AWS infrastructure JSON data:

${JSON.stringify(awsData, null, 2)}

Provide a comprehensive analysis covering:
1. Cost Optimization & Savings Estimate
2. Idle or Underutilized Resources
3. Over-Provisioned Resources
4. Security Risks & Vulnerabilities
5. Storage Optimization
6. Networking Cost Optimizations
7. Reserved Instances / Savings Plans recommendations

Return the response STRICTLY as a valid JSON object matching the following structure (do NOT wrap in markdown blocks like \`\`\`json, just return raw JSON):

{
  "summary": "High level summary of the current AWS environment state (2-3 sentences).",
  "recommendations": [
    {
      "category": "String (e.g., Cost Optimization, Security Risks)",
      "issue": "String (Brief description of the problem)",
      "impact": "String (High, Medium, Low)",
      "solution": "String (Actionable recommendation)"
    }
  ],
  "priority": {
    "high": ["String (Top urgent action 1)", "String (Top urgent action 2)"],
    "medium": ["String", "String"],
    "low": ["String"]
  },
  "terraformSuggestions": [
    {
      "resource": "String (e.g., aws_instance)",
      "code": "String (HCL code snippet)",
      "explanation": "String (Why use this code)"
    }
  ],
  "awsCliCommands": [
    {
      "command": "String (e.g., aws ec2 stop-instances --instance-ids i-1234)",
      "description": "String (What this command achieves)"
    }
  ],
  "savingsEstimate": "String (e.g., '$150/month' or '15% reduction')"
}
`;

    const response = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a cloud infrastructure analysis expert. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const textResponse = response.choices[0].message.content.trim();
    const structuredAnalysis = JSON.parse(textResponse);

    return structuredAnalysis;

  } catch (error) {
    logger.error(`[Groq Service] Analysis failed: ${error.message}`);
    throw new Error('Failed to analyze infrastructure data with Groq API.');
  }
};

/**
 * Handles the AI Copilot conversational interactions.
 * @param {string} question - The user's question.
 * @param {Array} chatHistory - Previous chat messages for context.
 * @param {Object} latestReport - The user's most recent AWS scan report.
 * @returns {Promise<string>} - The AI's response text.
 */
const askCopilot = async (question, chatHistory, latestReport) => {
  try {
    const systemContext = `
You are CloudGuardian AI Copilot, a Senior Cloud Architect and AWS Expert.
The user is asking a question about their AWS infrastructure.
Here is the raw data from their MOST RECENT AWS scan:
${JSON.stringify(latestReport?.rawAwsData || {}, null, 2)}

And here is the previous AI analysis of their environment:
${JSON.stringify(latestReport?.aiAnalysis || {}, null, 2)}

INSTRUCTIONS:
1. Answer the user's question directly based on their provided AWS scan data.
2. If they ask about costs, explain potential optimizations.
3. If they ask for code, provide Terraform (HCL), AWS CLI commands, or CloudFormation templates as requested.
4. Keep your answers concise, well-formatted using Markdown, and highly professional.
5. If you do not know the answer or the data is missing from the scan, politely state that.
`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemContext }
    ];

    // Add chat history (map 'model' role to 'assistant' for OpenAI-compatible API)
    for (const msg of chatHistory) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    // Add current question
    messages.push({ role: 'user', content: question });

    const response = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7
    });

    return response.choices[0].message.content;

  } catch (error) {
    logger.error(`[Groq Service] Copilot failed: ${error.message}`);
    throw new Error('Failed to communicate with AI Copilot.');
  }
};

module.exports = { analyzeCloudInfrastructure, askCopilot };
