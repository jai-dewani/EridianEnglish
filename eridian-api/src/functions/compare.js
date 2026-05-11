const { app } = require('@azure/functions');
const { AzureOpenAI } = require('openai');
const { PROMPTS, PROMPT_LABELS, buildUserPrompt } = require('../prompts');

function addCorsHeaders(headers) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

app.http('compare', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'OPTIONS') {
            const headers = new Headers();
            addCorsHeaders(headers);
            return { status: 204, headers };
        }

        try {
            const body = await request.json();
            const { text, speaker, listener } = body;

            if (!text || !text.trim()) {
                return { status: 400, body: JSON.stringify({ error: 'Text is required' }) };
            }

            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_KEY;
            const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'eridian-nano';

            const client = new AzureOpenAI({
                endpoint,
                apiKey,
                apiVersion: '2025-03-01-preview',
            });

            const spk = speaker || 'Rocky';
            const lst = listener || 'Grace';
            const userPrompt = buildUserPrompt(text, spk, lst);

            const ids = Object.keys(PROMPTS);
            const calls = ids.map(id =>
                client.chat.completions.create({
                    model: deployment,
                    messages: [
                        { role: 'system', content: PROMPTS[id] },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 512,
                    temperature: 0.3,
                }).then(r => r.choices[0].message.content.trim())
                  .catch(err => {
                      context.warn(`Prompt ${id} failed:`, err.message);
                      return `[Error: ${err.message}]`;
                  })
            );

            const outputs = await Promise.all(calls);

            const results = {};
            ids.forEach((id, i) => { results[id] = outputs[i]; });

            const headers = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(headers);

            return {
                status: 200,
                headers,
                body: JSON.stringify({ results, labels: PROMPT_LABELS })
            };
        } catch (err) {
            context.error('Compare error:', err);
            const headers = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(headers);
            return { status: 500, headers, body: JSON.stringify({ error: 'Comparison failed' }) };
        }
    }
});
