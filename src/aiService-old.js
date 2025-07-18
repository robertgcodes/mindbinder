import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

const generateAIContent = httpsCallable(functions, 'generateAIContent');

export const generateTextContent = async (blockType) => {
  try {
    const prompts = {
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

    const prompt = prompts[blockType] || 'Generate creative content.';
    
    const response = await generateAIContent({ prompt, blockType });
    return response.data.content;

  } catch (error) {
    console.error('Error generating AI content:', error);
    
    if (error.code === 'resource-exhausted') {
      throw new Error('Daily AI request limit reached. Please try again tomorrow.');
    } else if (error.code === 'unauthenticated') {
      throw new Error('Please log in to use AI features.');
    }
    
    throw new Error('Failed to generate content. Please try again.');
  }
};

export const generateQuoteContent = async () => {
  try {
    const prompt = 'Generate a single inspiring quote from a famous person. Format: "Quote text" - Author Name';
    
    const response = await generateAIContent({ prompt, blockType: 'quote' });
    return response.data.content.trim();

  } catch (error) {
    console.error('Error generating quote:', error);
    throw error;
  }
};

export const generateHabitContent = async () => {
  try {
    const prompt = 'Generate 3 positive daily habits to track. Return as a simple comma-separated list.';
    
    const response = await generateAIContent({ prompt, blockType: 'habits' });
    const habitsList = response.data.content.split(',').map(h => h.trim());
    
    return habitsList.slice(0, 3);

  } catch (error) {
    console.error('Error generating habits:', error);
    throw error;
  }
};

export const generateAffirmationsList = async () => {
  try {
    const prompt = 'Generate 5 powerful positive affirmations. Each should start with "I am" or "I". Return as numbered list.';
    
    const response = await generateAIContent({ prompt, blockType: 'affirmations' });
    const affirmations = response.data.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    return affirmations.slice(0, 5);

  } catch (error) {
    console.error('Error generating affirmations:', error);
    throw error;
  }
};

export const generateGratitudeItems = async () => {
  try {
    const prompt = 'Generate 3 thoughtful things to be grateful for today. Return as a simple list.';
    
    const response = await generateAIContent({ prompt, blockType: 'gratitude' });
    const items = response.data.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').trim());
    
    return items.slice(0, 3);

  } catch (error) {
    console.error('Error generating gratitude items:', error);
    throw error;
  }
};

export const generateGoalsContent = async () => {
  try {
    const prompt = 'Generate 3 inspiring and achievable personal goals. Return as a bulleted list.';
    
    const response = await generateAIContent({ prompt, blockType: 'goals' });
    const goals = response.data.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*•]\s*/, '').trim());
    
    return goals.slice(0, 3);

  } catch (error) {
    console.error('Error generating goals:', error);
    throw error;
  }
};