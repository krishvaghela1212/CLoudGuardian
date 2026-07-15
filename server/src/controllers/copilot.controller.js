const ChatSession = require('../models/ChatSession');
const Report = require('../models/Report');
const { askCopilot } = require('../services/gemini/gemini.service');
const logger = require('../utils/logger');

// @desc    Ask a question to the AI Copilot
// @route   POST /api/copilot/ask
// @access  Private
exports.askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    const userId = req.user._id;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // 1. Get user's most recent AWS scan report
    const latestReport = await Report.findOne({ user: userId }).sort({ createdAt: -1 });

    // 2. Get or create user's chat session
    let chatSession = await ChatSession.findOne({ user: userId });
    if (!chatSession) {
      chatSession = new ChatSession({ user: userId, messages: [] });
    }

    // 3. Ask Gemini Copilot (passing only the previous messages to Gemini, not the current one yet)
    const aiResponse = await askCopilot(question, chatSession.messages, latestReport);

    // 4. Update chat history with new messages
    chatSession.messages.push({ role: 'user', content: question });
    chatSession.messages.push({ role: 'model', content: aiResponse });
    await chatSession.save();

    res.status(200).json({
      success: true,
      data: {
        reply: aiResponse,
        messages: chatSession.messages,
      },
    });
  } catch (error) {
    logger.error(`[Copilot Controller] askQuestion error: ${error.message}`);
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/copilot/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const chatSession = await ChatSession.findOne({ user: req.user._id });
    
    res.status(200).json({
      success: true,
      data: chatSession ? chatSession.messages : [],
    });
  } catch (error) {
    logger.error(`[Copilot Controller] getHistory error: ${error.message}`);
    next(error);
  }
};
