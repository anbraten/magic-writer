import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const ai = new OpenAI({
    apiKey: config.openai.token,
  });

  const { previousText } = await readBody<{ previousText: string }>(event);

  // return 'Suggestion' + Date.now();

  const suggestion = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Help writing a scientific paper and suggest the next text block using the provided text.',
      },
      {
        role: 'user',
        content: previousText,
      },
    ],
  });

  return suggestion.choices[0].message.content;
});
