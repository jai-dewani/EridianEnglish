# Plan: Ship Eridian Translator with Azure OpenAI

**TL;DR:** Set up an Azure OpenAI resource, deploy GPT-4.1-nano, create an Azure Function as API proxy, craft the system prompt, and wire up the frontend.

---

## Phase 1 — Azure Setup (Azure Portal)

1. **Create an Azure OpenAI resource**
   - Azure Portal → Create a resource → search "Azure OpenAI"
   - Pick your subscription (the one with credits), any region (East US or Sweden Central have best model availability)
   - Pricing tier: Standard S0
   - Wait for it to provision (~2 min)

2. **Deploy GPT-4.1-nano**
   - Go to your Azure OpenAI resource → Model deployments → Deploy model
   - Select `gpt-4.1-nano`
   - Give it a deployment name (e.g. `eridian-nano`)
   - Set tokens-per-minute rate limit (start with 10K TPM — plenty for a personal project)

3. **Grab your credentials**
   - From the Azure OpenAI resource → Keys and Endpoint
   - Copy: **Endpoint** (e.g. `https://your-resource.openai.azure.com/`) and **Key 1**

---

## Phase 2 — Azure Function (API Proxy)

This keeps your API key off the frontend. ~30 lines of code.

4. **Install prerequisites locally**
   - Node.js 20+ (you likely have this)
   - Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`
   - Azure CLI: install from [aka.ms/installazurecli](https://aka.ms/installazurecli) (if you don't have it)

5. **Scaffold the function**
   - `func init eridian-api --javascript`
   - `cd eridian-api`
   - `func new --name translate --template "HTTP trigger"`

6. **Write the function** — single file, does 3 things:
   - Receives `{ text, speaker, listener }` from your frontend
   - Sends it to Azure OpenAI with your system prompt
   - Returns `{ translation }` to the frontend
   - Add CORS headers for your frontend domain

7. **Set environment variables**
   - In `local.settings.json` for local dev: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT` (`eridian-nano`)

8. **Test locally**
   - `func start` → hit `http://localhost:7071/api/translate` with curl/Postman

---

## Phase 3 — System Prompt

9. **Craft the system prompt** (~800 tokens) containing:
   - The 12 Eridian grammar rules (already listed on your site)
   - 15-20 curated Rocky lines from the transcript as input/output examples, e.g.:
     ```
     Human: "I don't know what happened to my crew"
     Rocky: "Rocky not know what happen to Rocky crew."
     ```
   - Speaker/listener name injection
   - Instruction: "Output ONLY the Eridian English translation. No explanation, no quotes."

10. **Curate the few-shot examples** from the transcript — pick lines that demonstrate each rule:
    - Third-person: *"Rocky watch crew many days"*
    - No articles: *"This room boring"*
    - Question tag: *"Grace is safe, question?"*
    - Repetition: *"Bad bad bad!", "Amaze, amaze, amaze!"*
    - Direct negation: *"Rocky not know"*
    - Present tense: *"Rocky watch crew many days"* (not "watched")
    - And so on

---

## Phase 4 — Frontend Changes

11. **Add an AI translate button** or replace the existing Translate button
    - Add a loading spinner/state while waiting (~200-400ms)
    - On click: `fetch` to your Azure Function endpoint

12. **Keep regex as fallback**
    - If the API call fails (network error, rate limit), fall back to the existing `toRocky()` function
    - Optionally: show a small indicator ("AI" vs "Offline") so the user knows which mode is active

13. **Wire up the response**
    - Display the LLM output in the same `#output` pane
    - Copy button works as before

---

## Phase 5 — Deploy

14. **Deploy Azure Function**
    - `az login`
    - `az functionapp create --name eridian-api --resource-group <your-rg> --consumption-plan-location eastus --runtime node --runtime-version 20 --functions-version 4 --storage-account <your-storage>`
    - `func azure functionapp publish eridian-api`
    - Set app settings: `az functionapp config appsettings set --name eridian-api --settings AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_KEY=... AZURE_OPENAI_DEPLOYMENT=eridian-nano`

15. **Update frontend** to point to the deployed function URL instead of localhost

16. **Host the static site** — GitHub Pages, Azure Static Web Apps, or wherever you prefer

---

## Verification

1. Test all 6 example sentences → compare regex output vs AI output
2. Test idioms the regex can't handle: *"It's raining cats and dogs"*, *"Break a leg"*
3. Test complex compound sentences with multiple clauses
4. Test with empty input, very long input, special characters
5. Verify fallback works by temporarily disabling the function
6. Check Azure Function logs for errors

---

## Estimated Costs

| Component | Cost |
|---|---|
| Azure OpenAI (4.1-nano) | ~$0.10/1M input tokens → ~100K translations per $1 |
| Azure Functions (Consumption) | Free tier: 1M executions/month free |
| **Total for personal use** | **Effectively $0** with your credits |

---

## What You Need Before Starting

- An Azure subscription with credits (you have this)
- Node.js installed locally
- ~2-3 hours for the full setup
