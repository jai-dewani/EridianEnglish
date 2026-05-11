function toRocky(text, speaker, listener) {
  let s = text.trim();
  speaker = speaker || 'Rocky';
  listener = listener || 'Grace';

  // Step 1: Expand all contractions
  const contractions = [
    [/\bI'm\b/gi, "I am"], [/\bI've\b/gi, "I have"], [/\bI'll\b/gi, "I will"],
    [/\bI'd\b/gi, "I would"], [/\bdon't\b/gi, "do not"], [/\bdidn't\b/gi, "did not"],
    [/\bdoesn't\b/gi, "does not"], [/\bwon't\b/gi, "will not"], [/\bcan't\b/gi, "can not"],
    [/\bcouldn't\b/gi, "could not"], [/\bwouldn't\b/gi, "would not"],
    [/\bshouldn't\b/gi, "should not"], [/\bisn't\b/gi, "is not"],
    [/\baren't\b/gi, "are not"], [/\bwasn't\b/gi, "was not"],
    [/\bweren't\b/gi, "were not"], [/\bthey're\b/gi, "they are"],
    [/\byou're\b/gi, "you are"], [/\bwe're\b/gi, "we are"],
    [/\bhe's\b/gi, "he is"], [/\bshe's\b/gi, "she is"],
    [/\bit's\b/gi, "it is"], [/\bthat's\b/gi, "that is"],
    [/\bwhat's\b/gi, "what is"], [/\bthere's\b/gi, "there is"],
    [/\bhere's\b/gi, "here is"], [/\blet's\b/gi, "let us"],
    [/\bwe've\b/gi, "we have"], [/\bthey've\b/gi, "they have"],
    [/\bwe'll\b/gi, "we will"], [/\bthey'll\b/gi, "they will"],
    [/\byou'll\b/gi, "you will"], [/\byou've\b/gi, "you have"],
    [/\byou'd\b/gi, "you would"],
  ];
  contractions.forEach(([re, rep]) => { s = s.replace(re, rep); });

  // Step 2: Split into sentences
  const rawSentences = s.match(/[^.!?]+[.!?]*/g) || [s];

  const result = rawSentences.flatMap(sentence => {
    // Rocky speaks in short clauses — split on conjunctions
    const parts = sentence.split(/\s+(?:and|but|because|although|however|so\s+that)\s+/i);
    return parts.map(p => p.trim()).filter(Boolean);
  }).map(sentence => {
    let w = sentence.trim();
    if (!w) return '';

    const isQuestion = /\?$/.test(w) ||
      /^(what|where|when|why|how|who|do|does|did|are|is|was|were|will|would|can|could|should)\b/i.test(w);
    const hasExclamation = /!/.test(w);

    // Remove trailing punctuation for processing
    w = w.replace(/[.!?]+$/, '').trim();

    // Step 3: Pronouns — Rocky uses names WITHOUT possessive 's
    w = w.replace(/\bmyself\b/gi, speaker);
    w = w.replace(/\byourself\b/gi, listener);
    w = w.replace(/\bmy\b/gi, speaker);
    w = w.replace(/\bmine\b/gi, speaker);
    w = w.replace(/\bme\b/gi, speaker);
    w = w.replace(/\bI\b/g, speaker);
    w = w.replace(/\byour\b/gi, listener);
    w = w.replace(/\byours\b/gi, listener);
    w = w.replace(/\byou\b/gi, listener);

    // Step 4: Drop articles
    w = w.replace(/\bthe\b/gi, '');
    w = w.replace(/\b(a|an)\b/gi, '');

    // Step 5: "it is / that is / this is" → "is"
    w = w.replace(/\b(it|that|this)\s+is\b/gi, 'is');

    // Step 6: "there is/are/was/were" → drop
    w = w.replace(/\bthere\s+(is|are|was|were)\b/gi, '');

    // Step 7: Negation — collapse auxiliary+not → just "not"
    w = w.replace(/\b(do|does|did)\s+not\b/gi, 'not');
    w = w.replace(/\b(will|would|shall|should|could)\s+not\b/gi, 'not');
    w = w.replace(/\bcan\s+not\b/gi, 'not');

    // Step 8: Drop modals (would/shall/could/should), keep "can"
    w = w.replace(/\b(would|shall|could|should)\b/gi, '');
    w = w.replace(/\bwill\b/gi, '');
    w = w.replace(/\b(do|does|did)\b/gi, '');

    // Step 9: Drop copula — am, are, was, were, be, been, being
    w = w.replace(/\b(am|are|was|were|be|been|being)\b/gi, '');
    w = w.replace(/(\w)\s+is\b/gi, '$1');

    // Step 10: Drop auxiliary have/has/had
    w = w.replace(/\b(have|has|had)\s+been\b/gi, '');
    w = w.replace(/\b(has|had)\s+not\b/gi, 'not');
    w = w.replace(/\b(has|had)\b/gi, '');

    // Step 11: Drop "to" before infinitives
    w = w.replace(/\b(need|want|try|going|got|have|start|begin|able|ready|like|hope|plan|decide|learn|help)\s+to\b/gi, '$1');

    // Step 12: Drop filler words Rocky wouldn't use
    w = w.replace(/\b(just|actually|really|basically|probably|perhaps|maybe|quite|rather|simply|definitely|certainly|honestly|literally)\b/gi, '');

    // Step 13: Irregular past tense → base form
    const irregularPast = [
      [/\bwent\b/gi, 'go'], [/\bcame\b/gi, 'come'], [/\bsaw\b/gi, 'see'],
      [/\btook\b/gi, 'take'], [/\bmade\b/gi, 'make'], [/\bgave\b/gi, 'give'],
      [/\btold\b/gi, 'tell'], [/\bfound\b/gi, 'find'], [/\bknew\b/gi, 'know'],
      [/\bthought\b/gi, 'think'], [/\bfelt\b/gi, 'feel'], [/\bkept\b/gi, 'keep'],
      [/\bleft\b/gi, 'leave'], [/\bsaid\b/gi, 'say'], [/\bgot\b/gi, 'get'],
      [/\bbroke\b/gi, 'break'], [/\bwrote\b/gi, 'write'], [/\bran\b/gi, 'run'],
      [/\bate\b/gi, 'eat'], [/\bdrank\b/gi, 'drink'], [/\bslept\b/gi, 'sleep'],
      [/\bbuilt\b/gi, 'build'], [/\bsent\b/gi, 'send'], [/\bspent\b/gi, 'spend'],
      [/\bbought\b/gi, 'buy'], [/\bbegan\b/gi, 'begin'], [/\bforgot\b/gi, 'forget'],
      [/\bwoke\b/gi, 'wake'], [/\bbrought\b/gi, 'bring'], [/\bcaught\b/gi, 'catch'],
      [/\btaught\b/gi, 'teach'], [/\bheard\b/gi, 'hear'], [/\bstood\b/gi, 'stand'],
      [/\blost\b/gi, 'lose'], [/\bheld\b/gi, 'hold'], [/\bsat\b/gi, 'sit'],
      [/\bmet\b/gi, 'meet'], [/\bwore\b/gi, 'wear'], [/\bchose\b/gi, 'choose'],
      [/\bunderstood\b/gi, 'understand'], [/\bspoke\b/gi, 'speak'],
    ];
    irregularPast.forEach(([re, rep]) => { w = w.replace(re, rep); });

    // Step 13b: Present participle (-ing) → base form
    const ingExclude = new Set(['thing', 'something', 'nothing', 'everything', 'anything',
      'morning', 'evening', 'during', 'among', 'king', 'ring', 'string', 'wing',
      'spring', 'bring', 'sing', 'sting', 'swing', 'ceiling', 'offspring',
      'pudding', 'wedding', 'sibling', 'according', 'lightning']);
    const ingSpecial = {
      'going': 'go', 'dying': 'die', 'lying': 'lie', 'tying': 'tie',
      'being': '', 'seeing': 'see', 'fleeing': 'flee', 'agreeing': 'agree',
      'making': 'make', 'taking': 'take', 'coming': 'come', 'giving': 'give',
      'living': 'live', 'moving': 'move', 'saving': 'save', 'loving': 'love',
      'hoping': 'hope', 'using': 'use', 'losing': 'lose', 'closing': 'close',
      'having': 'have', 'writing': 'write', 'driving': 'drive', 'riding': 'ride',
      'hiding': 'hide', 'biting': 'bite', 'sharing': 'share', 'caring': 'care',
      'staring': 'stare', 'preparing': 'prepare', 'comparing': 'compare',
      'dancing': 'dance', 'changing': 'change', 'forcing': 'force', 'placing': 'place',
      'facing': 'face', 'racing': 'race', 'trading': 'trade', 'choosing': 'choose',
      'breathing': 'breathe', 'leaving': 'leave', 'believing': 'believe',
      'creating': 'create', 'waking': 'wake', 'shaking': 'shake', 'baking': 'bake',
      'smiling': 'smile', 'naming': 'name', 'blaming': 'blame', 'wasting': 'waste',
      'escaping': 'escape', 'surviving': 'survive', 'arriving': 'arrive',
      'providing': 'provide', 'deciding': 'decide', 'assuming': 'assume',
      'improving': 'improve', 'removing': 'remove', 'replacing': 'replace',
      'managing': 'manage', 'imagining': 'imagine', 'exploring': 'explore',
      'ignoring': 'ignore', 'involving': 'involve', 'producing': 'produce',
      'reducing': 'reduce', 'solving': 'solve', 'serving': 'serve',
      'observing': 'observe', 'deserving': 'deserve', 'receiving': 'receive',
      'achieving': 'achieve', 'boring': 'bore', 'storing': 'store',
      'rising': 'rise', 'surprising': 'surprise', 'requiring': 'require',
      'including': 'include', 'describing': 'describe', 'defining': 'define',
    };
    const naturalDouble = /(?:ll|ss|ff|zz|dd|ck)$/i;
    w = w.replace(/\b([A-Za-z]+ing)\b/g, (match) => {
      const lower = match.toLowerCase();
      if (ingExclude.has(lower)) return match;
      if (lower.length <= 4) return match;
      let base;
      if (lower in ingSpecial) {
        base = ingSpecial[lower];
      } else {
        const stem = lower.slice(0, -3);
        if (stem.length >= 3 && /([^aeiou])\1$/i.test(stem) && !naturalDouble.test(stem)) {
          base = stem.slice(0, -1);
        } else {
          base = stem;
        }
      }
      if (!base) return '';
      return match[0] === match[0].toUpperCase()
        ? base.charAt(0).toUpperCase() + base.slice(1) : base;
    });

    // Step 13c: Regular past tense (-ed) → base form
    const edExclude = new Set(['bed', 'red', 'fed', 'led', 'shed', 'wed',
      'need', 'seed', 'feed', 'speed', 'indeed', 'hundred', 'sacred',
      'wicked', 'naked', 'crooked', 'alleged', 'aged']);
    const edSpecial = {
      'loved': 'love', 'moved': 'move', 'saved': 'save', 'lived': 'live',
      'hoped': 'hope', 'used': 'use', 'closed': 'close', 'noticed': 'notice',
      'danced': 'dance', 'changed': 'change', 'forced': 'force', 'placed': 'place',
      'faced': 'face', 'raced': 'race', 'traded': 'trade', 'created': 'create',
      'arrived': 'arrive', 'survived': 'survive', 'escaped': 'escape',
      'provided': 'provide', 'decided': 'decide', 'assumed': 'assume',
      'improved': 'improve', 'removed': 'remove', 'replaced': 'replace',
      'managed': 'manage', 'imagined': 'imagine', 'explored': 'explore',
      'ignored': 'ignore', 'involved': 'involve', 'produced': 'produce',
      'reduced': 'reduce', 'solved': 'solve', 'served': 'serve',
      'observed': 'observe', 'deserved': 'deserve', 'received': 'receive',
      'achieved': 'achieve', 'stored': 'store', 'scored': 'score',
      'surprised': 'surprise', 'required': 'require', 'included': 'include',
      'described': 'describe', 'defined': 'define', 'believed': 'believe',
      'prepared': 'prepare', 'compared': 'compare', 'shared': 'share',
      'cared': 'care', 'stared': 'stare', 'named': 'name', 'blamed': 'blame',
      'wasted': 'waste', 'bored': 'bore',
    };
    w = w.replace(/\b([A-Za-z]+ed)\b/g, (match) => {
      const lower = match.toLowerCase();
      if (edExclude.has(lower)) return match;
      if (lower.length <= 3) return match;
      let base;
      if (lower in edSpecial) {
        base = edSpecial[lower];
      } else if (lower.endsWith('ied') && lower.length > 4) {
        base = lower.slice(0, -3) + 'y';
      } else {
        const stem = lower.slice(0, -2);
        if (stem.length >= 3 && /([^aeiou])\1$/i.test(stem) && !naturalDouble.test(stem)) {
          base = stem.slice(0, -1);
        } else {
          base = stem;
        }
      }
      if (!base || base.length < 2) return match;
      return match[0] === match[0].toUpperCase()
        ? base.charAt(0).toUpperCase() + base.slice(1) : base;
    });

    // Step 14: Intensifier repetition with commas
    const intensifiers = [
      'very', 'extremely', 'incredibly', 'absolutely', 'totally', 'so'
    ];
    intensifiers.forEach(adv => {
      const re = new RegExp(`\\b${adv}\\s+(\\w+)`, 'gi');
      w = w.replace(re, (_, adj) => `${adj}, ${adj}, ${adj}`);
    });

    // Step 15: Word swaps — Rocky's vocabulary from transcript
    const wordSwaps = [
      [/\bamazing\b/gi, 'amaze, amaze, amaze'],
      [/\bterrible\b/gi, 'bad, bad, bad'],
      [/\bawful\b/gi, 'bad, bad, bad'],
      [/\bhorrible\b/gi, 'bad, bad, bad'],
      [/\bwonderful\b/gi, 'good, good, good'],
      [/\bexcellent\b/gi, 'good, good, good'],
      [/\bgreat\b/gi, 'good, good, good'],
      [/\bfantastic\b/gi, 'good, good, good'],
      [/\bangry\b/gi, 'angry, angry, angry'],
      [/\bfurious\b/gi, 'angry, angry, angry'],
      [/\bscared\b/gi, 'fear, fear, fear'],
      [/\bafraid\b/gi, 'fear, fear, fear'],
      [/\bfrightened\b/gi, 'fear, fear, fear'],
      [/\bhappy\b/gi, 'happy, happy, happy'],
      [/\bsad\b/gi, 'sad, sad, sad'],
      [/\bexcited\b/gi, 'happy, happy, happy'],
      [/\bdangerous\b/gi, 'danger, danger, danger'],
      [/\byes\b/gi, 'is yes'],
    ];
    wordSwaps.forEach(([re, rep]) => { w = w.replace(re, rep); });

    // Step 16: Clean up whitespace
    w = w.replace(/  +/g, ' ').trim();

    if (!w) return '';

    w = w.charAt(0).toUpperCase() + w.slice(1);

    // Step 17: Add sentence ending
    const emphaticWords = /good|bad|amaze|happy|sad|die|save|home|angry|love|hate|danger|safe|important|wrong|right|fear/i;

    if (hasExclamation) {
      w = w + '!';
    } else if (isQuestion) {
      w = w + ', question?';
    } else if (emphaticWords.test(w)) {
      w = w + ', statement.';
    } else {
      w = w + '.';
    }

    return w;
  });

  return result.filter(Boolean).join('\n');
}

// ── Configuration ──
const API_URL = 'https://eridian-api-evdmezajgbd5f8fj.eastus-01.azurewebsites.net/api/translate';
let lastAIInput = '';
let lastAIFailed = false;

function isAIMode() {
  return document.getElementById('ai-toggle').checked;
}

function onModeChange() {
  const badge = document.getElementById('mode-badge');
  if (isAIMode()) {
    badge.textContent = 'AI';
    badge.className = 'mode-badge ai';
  } else {
    badge.textContent = 'Offline';
    badge.className = 'mode-badge offline';
  }
  // Auto-translate on toggle, but skip duplicate AI calls
  const currentInput = document.getElementById('input').value.trim();
  if (currentInput) {
    if (isAIMode() && currentInput === lastAIInput) {
      // Same input already sent to AI (success or failure) — skip
      return;
    }
    eridianTranslate();
  }
}

async function eridianTranslate() {
  const input = document.getElementById('input').value;
  const speaker = document.getElementById('speaker')?.value.trim() || 'Rocky';
  const listener = document.getElementById('listener')?.value.trim() || 'Grace';
  const outputEl = document.getElementById('output');
  const pane = document.getElementById('output-pane');
  const btn = document.getElementById('translate-btn');

  if (!input.trim()) {
    outputEl.innerHTML = '<span class="output-placeholder">Translation appears here\u2026</span>';
    return;
  }

  if (isAIMode()) {
    // Skip if same input already failed AI — use regex instead
    if (lastAIFailed && input.trim() === lastAIInput) {
      const out = toRocky(input, speaker, listener);
      outputEl.className = 'output-text';
      outputEl.textContent = out;
      pane.classList.remove('flash');
      void pane.offsetWidth;
      pane.classList.add('flash');
      return;
    }

    // AI mode — call Azure Function
    btn.disabled = true;
    btn.textContent = 'Translating';
    btn.classList.add('loading-dots');
    outputEl.className = 'output-text';
    outputEl.innerHTML = '<span class="output-placeholder">Thinking like Rocky\u2026</span>';

    const promptId = document.getElementById('prompt-select')?.value || 'v4';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, speaker, listener, promptId }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      outputEl.className = 'output-text';
      outputEl.textContent = data.translation;
      lastAIInput = input.trim();
      lastAIFailed = false;
    } catch (err) {
      // Fallback to regex on error
      console.warn('AI translation failed, falling back to regex:', err);
      lastAIInput = input.trim();
      lastAIFailed = true;
      const out = toRocky(input, speaker, listener);
      outputEl.className = 'output-text';
      outputEl.textContent = out;
      const badge = document.getElementById('mode-badge');
      badge.textContent = 'Fallback';
      badge.className = 'mode-badge offline';
      setTimeout(() => {
        badge.textContent = isAIMode() ? 'AI' : 'Offline';
        badge.className = isAIMode() ? 'mode-badge ai' : 'mode-badge offline';
      }, 3000);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Translate \u2192';
      btn.classList.remove('loading-dots');
    }
  } else {
    // Offline mode — regex
    const out = toRocky(input, speaker, listener);
    outputEl.className = 'output-text';
    outputEl.textContent = out;
  }

  pane.classList.remove('flash');
  void pane.offsetWidth;
  pane.classList.add('flash');

  // Auto-speak the translation
  speakOutput();
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').innerHTML = '<span class="output-placeholder">Translation appears here\u2026</span>';
  document.getElementById('output').className = '';
  document.getElementById('char-count').textContent = '0 chars';
}

function setExample(btn) {
  document.getElementById('input').value = btn.textContent;
  updateCount();
  eridianTranslate();
}

function updateCount() {
  const len = document.getElementById('input').value.length;
  document.getElementById('char-count').textContent = len + ' char' + (len === 1 ? '' : 's');
}

function copyOutput() {
  const out = document.getElementById('output').textContent;
  if (!out || out === 'Translation appears here\u2026') return;
  navigator.clipboard.writeText(out).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy output';
      btn.classList.remove('copied');
    }, 1800);
  });
}

document.getElementById('input').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') eridianTranslate();
});

// ── Browser TTS ──
let isSpeaking = false;

function speakOutput() {
  const text = document.getElementById('output').textContent;
  if (!text || text === 'Translation appears here\u2026' || text === 'Thinking like Rocky\u2026') return;

  const btn = document.getElementById('speak-btn');

  // Stop if already playing
  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    btn.textContent = '\u266a Speak';
    btn.classList.remove('playing');
    return;
  }

  const voices = speechSynthesis.getVoices();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voices[0];
  u.pitch = 2.5;
  u.rate = 1.2;

  btn.textContent = '\u25a0 Stop';
  btn.classList.add('playing');
  isSpeaking = true;

  u.onend = () => {
    isSpeaking = false;
    btn.textContent = '\u266a Speak';
    btn.classList.remove('playing');
  };

  u.onerror = () => {
    isSpeaking = false;
    btn.textContent = '\u266a Speak';
    btn.classList.remove('playing');
  };

  speechSynthesis.speak(u);
}

updateCount();
eridianTranslate();
