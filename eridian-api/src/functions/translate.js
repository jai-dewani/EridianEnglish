const { app } = require('@azure/functions');
const { AzureOpenAI } = require('openai');
const { PROMPTS, buildUserPrompt } = require('../prompts');

function addCorsHeaders(headers) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

app.http('translate', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            const headers = new Headers();
            addCorsHeaders(headers);
            return { status: 204, headers };
        }

        try {
            const body = await request.json();
            const { text, speaker, listener, promptId } = body;

            if (!text || !text.trim()) {
                return { status: 400, body: JSON.stringify({ error: 'Text is required' }) };
            }

            const systemPrompt = PROMPTS[promptId] || PROMPTS.v4;

            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_KEY;
            const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'eridian-nano';

            const client = new AzureOpenAI({
                endpoint,
                apiKey,
                apiVersion: '2025-03-01-preview',
            });

            const result = await client.chat.completions.create({
                model: deployment,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: buildUserPrompt(text, speaker || 'Rocky', listener || 'Grace') }
                ],
                max_tokens: 512,
                temperature: 0.3,
            });

            const translation = result.choices[0].message.content.trim();

            const headers = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(headers);

            return { status: 200, headers, body: JSON.stringify({ translation }) };
        } catch (err) {
            context.error('Translation error:', err);
            const headers = new Headers({ 'Content-Type': 'application/json' });
            addCorsHeaders(headers);
            return { status: 500, headers, body: JSON.stringify({ error: 'Translation failed' }) };
        }
    }
});
