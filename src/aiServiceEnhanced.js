import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from './firebase';
import { auth } from './firebase';

const functions = getFunctions(app);

const generateAIContent = httpsCallable(functions, 'generateAIContent');
const generateAIContentPro = httpsCallable(functions, 'generateAIContentPro');

// Get user's AI settings
const getUserAISettings = async () => {
  if (!auth.currentUser) return null;
  
  try {
    const settingsDoc = await getDoc(doc(db, 'aiSettings', auth.currentUser.uid));
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
  } catch (error) {
    console.error('Error loading AI settings:', error);
  }
  
  return null;
};

// Check if user has Pro access
const checkProAccess = async () => {
  if (!auth.currentUser) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.isAdmin || false;
      const hasPro = userData.tier?.id === 'pro' || userData.tier?.id === 'team';
      return isAdmin || hasPro;
    }
  } catch (error) {
    console.error('Error checking Pro access:', error);
  }
  
  return false;
};

// Enhanced text generation with Pro features
export const generateTextContentEnhanced = async (blockType, customPrompt = null) => {
  try {
    const hasProAccess = await checkProAccess();
    const aiSettings = hasProAccess ? await getUserAISettings() : null;
    
    const defaultPrompts = {
      'quick-notes': 'Generate a brief, helpful note or reminder.',
      'gratitude': 'Create a thoughtful gratitude journal entry.',
      'goals': 'Write an inspiring goal or objective.',
      'daily-habits': 'Suggest a positive daily habit to track.',
      'affirmations': 'Create a powerful, positive affirmation.',
      'timeline': 'Describe a meaningful life event or milestone.',
      'analytics': 'Provide an insightful observation about personal growth.',
      'book': 'Recommend a book with a brief description.',
      'pdf': 'Suggest a document type that would be helpful to organize.',
      'todo': 'Create a productive task or action item.',
      'yearly-planner': 'Suggest a yearly goal or milestone to plan for.'
    };

    let prompt = customPrompt || defaultPrompts[blockType] || 'Generate creative content.';
    
    // Add custom instructions if available
    if (aiSettings?.customInstructions) {
      prompt = `${prompt}\n\nUser preferences: ${aiSettings.customInstructions}`;
    }
    
    // Use Pro endpoint if user has access and settings
    if (hasProAccess && aiSettings) {
      const response = await generateAIContentPro({ 
        prompt, 
        blockType,
        model: aiSettings.defaultModel,
        apiKeys: aiSettings.apiKeys,
        customInstructions: aiSettings.customInstructions
      });
      return response.data.content;
    } else {
      // Fall back to standard endpoint
      const response = await generateAIContent({ prompt, blockType });
      return response.data.content;
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    
    if (error.code === 'resource-exhausted') {
      throw new Error('Daily AI request limit reached. Please try again tomorrow.');
    } else if (error.code === 'unauthenticated') {
      throw new Error('Please log in to use AI features.');
    } else if (error.message?.includes('API key')) {
      throw new Error('Please add your API key in Pro AI Settings.');
    }
    
    throw new Error('Failed to generate content. Please try again.');
  }
};

// Enhanced AI response with Pro features
export const getAiResponseEnhanced = async (prompt) => {
  try {
    const hasProAccess = await checkProAccess();
    const aiSettings = hasProAccess ? await getUserAISettings() : null;
    
    const timestamp = new Date().toISOString();
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const wantsRandom = prompt.toLowerCase().includes('random') || 
                       prompt.toLowerCase().includes('different') ||
                       prompt.toLowerCase().includes('variety');
    
    let enhancedPrompt = prompt;
    
    if (wantsRandom) {
      enhancedPrompt = `${prompt}\n\nIMPORTANT: Please ensure variety in your responses. Avoid commonly given examples or frequently cited items. Draw from the full breadth of available knowledge to provide diverse and interesting responses each time.\n\n(Random seed: ${randomSeed}, Time: ${timestamp})`;
    } else {
      enhancedPrompt = `${prompt}\n\n(Request time: ${timestamp})`;
    }
    
    // Add custom instructions if available
    if (aiSettings?.customInstructions) {
      enhancedPrompt = `${enhancedPrompt}\n\nUser preferences: ${aiSettings.customInstructions}`;
    }
    
    // Use Pro endpoint if user has access and settings
    if (hasProAccess && aiSettings) {
      const response = await generateAIContentPro({ 
        prompt: enhancedPrompt, 
        blockType: 'ai-prompt',
        model: aiSettings.defaultModel,
        apiKeys: aiSettings.apiKeys,
        customInstructions: aiSettings.customInstructions
      });
      return response.data.content;
    } else {
      // Fall back to standard endpoint
      const response = await generateAIContent({ prompt: enhancedPrompt, blockType: 'ai-prompt' });
      return response.data.content;
    }

  } catch (error) {
    console.error('Error getting AI response:', error);
    
    if (error.code === 'resource-exhausted') {
      return 'Daily AI request limit reached. Please try again tomorrow.';
    } else if (error.code === 'unauthenticated') {
      return 'Please log in to use AI features.';
    } else if (error.message?.includes('API key')) {
      return 'Please add your API key in Pro AI Settings to use this model.';
    }
    
    return 'Failed to get AI response. Please try again.';
  }
};

// Generate AI image
export const generateAIImage = async (prompt, style = 'realistic') => {
  try {
    const hasProAccess = await checkProAccess();
    if (!hasProAccess) {
      throw new Error('AI image generation is a Pro feature. Please upgrade to use this feature.');
    }
    
    const aiSettings = await getUserAISettings();
    if (!aiSettings?.imageGeneration?.enabled) {
      throw new Error('AI image generation is not enabled. Please enable it in Pro AI Settings.');
    }
    
    const response = await generateAIContentPro({
      prompt,
      blockType: 'image',
      imageProvider: aiSettings.imageGeneration.provider,
      imageStyle: style || aiSettings.imageGeneration.style,
      apiKeys: aiSettings.apiKeys
    });
    
    return response.data.imageUrl;
    
  } catch (error) {
    console.error('Error generating AI image:', error);
    throw error;
  }
};

// Export original functions for backward compatibility
export { generateTextContent, generateQuoteContent, generateHabitContent, 
         generateAffirmationsList, generateGratitudeItems, generateGoalsContent,
         getAiResponse } from './aiService';