import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const { previousText, aiToken, aiModel } = await readBody<{
    previousText: string;
    aiToken: string;
    aiModel: string;
  }>(event);

  if (!previousText || !aiToken || !aiModel) {
    return createError({
      status: 400,
      statusMessage: 'previousText, aiToken, and aiModel are required',
    });
  }

  const ai = new OpenAI({
    apiKey: aiToken,
  });

  // return 'Suggestion' + Date.now();

  const suggestion = await ai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: 'system',
        content:
          'Help writing a scientific paper and suggest the next text block using the provided text.' +
          ' Continue in the language of the text.',
      },
      {
        role: 'user',
        content: previousText,
      },
    ],
  });

  return suggestion.choices[0].message.content;
});
