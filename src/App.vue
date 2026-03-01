<template>
  <div class="app-container">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>
    <div class="bg-grid"></div>

    <header class="header">
      <div class="header-badge">PROYEK KRIPTOGRAFI VUE.</div>
      <h1 class="title">
        <span class="title-crypto">Crypto</span>
        <span class="title-calc">Calc</span>
      </h1>
      <p class="subtitle">Encrypt · Decrypt · Secure</p>
    </header>
    
    <div class="main-content">
      <div class="workspace">

        <div class="section cipher-select-section">
          <div class="cipher-tabs">
            <button 
              v-for="(cipher, i) in ciphers" 
              :key="cipher.value"
              @click="selected = cipher.value"
              :class="['cipher-tab', { active: selected === cipher.value }]"
              :style="`--accent: ${cipher.color}; --delay: ${i * 0.06}s`"
            >
              <span class="cipher-icon">{{ cipher.icon }}</span>
              <span class="cipher-name">{{ cipher.name }}</span>
              <span class="tab-glow"></span>
            </button>
          </div>
        </div>

        <div class="section mode-section">
          <div class="mode-toggle">
            <div class="toggle-track" :class="mode"></div>
            <button @click="mode = 'encrypt'" :class="['mode-btn', { active: mode === 'encrypt' }]">
              <span class="mode-icon">🔒</span> Encrypt
            </button>
            <button @click="mode = 'decrypt'" :class="['mode-btn', { active: mode === 'decrypt' }]">
              <span class="mode-icon">🔓</span> Decrypt
            </button>
          </div>
        </div>

        <transition name="morph" mode="out-in">
          <div :key="selected" class="section settings-section">
            <VigenereCipher v-if="selected === 'vigenere'" v-model="keys.vigenere" />
            <AffineCipher v-if="selected === 'affine'" v-model:a="keys.affine.a" v-model:b="keys.affine.b" />
            <PlayfairCipher v-if="selected === 'playfair'" v-model="keys.playfair" />
            <HillCipher v-if="selected === 'hill'" v-model="keys.hill" />
            <EnigmaCipher v-if="selected === 'enigma'" v-model="keys.enigma" />
          </div>
        </transition>

        <div class="section input-section">
          <label class="section-label">
            <span class="label-dot input-dot"></span>
            Input Text
          </label>
          <textarea 
            v-model="inputTxt" 
            placeholder="Type your message here..."
            class="text-area"
          ></textarea>
          
          </div>

        <button @click="run" class="action-button" :disabled="processing" :style="`--accent: ${currentCipher.color}`">
          <span v-if="!processing" class="btn-content">
            <span>{{ mode === 'encrypt' ? '🔒 Encrypt Now' : '🔓 Decrypt Now' }}</span>
            <span class="btn-arrow">→</span>
          </span>
          <span v-else class="processing">
            <span class="spinner"></span>
            Processing...
          </span>
          <span class="btn-shimmer"></span>
        </button>

        <transition name="slide-up">
          <div v-if="outputTxt || errorMsg" class="section output-section">
            <label class="section-label">
              <span class="label-dot output-dot"></span>
              Result
            </label>
            
            <div v-if="errorMsg" class="error-box">
              <span class="error-icon">⚠</span>
              {{ errorMsg }}
            </div>
            
            <textarea 
              v-if="outputTxt && !errorMsg"
              v-model="outputTxt" 
              readonly 
              class="text-area output"
            ></textarea>

            </div>
        </transition>

        <transition name="morph" mode="out-in">
          <div :key="selected" class="info-box" :style="`--accent: ${currentCipher.color}`">
            <div class="info-icon">{{ currentCipher.icon }}</div>
            <div class="info-content">
              <h3>{{ getCipherInfo().title }}</h3>
              <p>{{ getCipherInfo().description }}</p>
            </div>
            <div class="info-line"></div>
          </div>
        </transition>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { vigenere, affine, playfair, hill, enigma } from './utils/cipherLogic';
import VigenereCipher from './components/VigenereCipher.vue';
import AffineCipher from './components/AffineCipher.vue';
import PlayfairCipher from './components/PlayfairCipher.vue';
import HillCipher from './components/HillCipher.vue';
import EnigmaCipher from './components/EnigmaCipher.vue';

const ciphers = [
  { value: 'vigenere', name: 'Vigenere', icon: '🔤', color: '#00d4ff' },
  { value: 'affine',   name: 'Affine',   icon: '🔢', color: '#ff6b6b' },
  { value: 'playfair', name: 'Playfair', icon: '⊞',  color: '#ffd166' },
  { value: 'hill',     name: 'Hill',     icon: '⊡',  color: '#06d6a0' },
  { value: 'enigma',   name: 'Enigma',   icon: '⚙',  color: '#c77dff' }
];

const cipherInfo = {
  vigenere: { title: 'Vigenere Cipher', description: 'Polyalphabetic substitution cipher using a keyword. Each letter shifts based on the corresponding keyword letter.' },
  affine:   { title: 'Affine Cipher',   description: 'Monoalphabetic substitution using linear function: E(x) = (ax + b) mod 26. Parameter a must be coprime with 26.' },
  playfair: { title: 'Playfair Cipher', description: 'Digraph substitution using a 5×5 matrix. Encrypts pairs of letters instead of single characters. J is combined with I.' },
  hill:     { title: 'Hill Cipher',     description: 'Polyalphabetic cipher using linear algebra and matrix multiplication. Matrix size is flexible (2×2, 3×3, etc).' },
  enigma:   { title: 'Enigma Cipher',   description: 'Simulation of the Enigma machine with 3 rotors. Each rotor rotates after processing each character.' }
};

const selected = ref('vigenere');
const mode = ref('encrypt');
const inputTxt = ref('');
const outputTxt = ref('');
const errorMsg = ref('');
const processing = ref(false);

const keys = reactive({
  vigenere: 'SECRET',
  affine: { a: 5, b: 8 },
  playfair: 'MONARCHY',
  hill: { size: 2, matrix: [6, 24, 1, 13] },
  enigma: 'MCK'
});

const currentCipher = computed(() => ciphers.find(c => c.value === selected.value));
const getCipherInfo = () => cipherInfo[selected.value];
const process = (data) => {
  try {
    if (selected.value === 'vigenere') return vigenere(data, keys.vigenere, mode.value);
    if (selected.value === 'affine')   return affine(data, keys.affine.a, keys.affine.b, mode.value);
    if (selected.value === 'playfair') return playfair(data, keys.playfair, mode.value);
    if (selected.value === 'hill')     return hill(data, keys.hill.matrix, keys.hill.size, mode.value);
    if (selected.value === 'enigma')   return enigma(data, keys.enigma, mode.value);
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
};

const run = () => {
  if (!inputTxt.value) {
    errorMsg.value = 'Please enter text to process';
    return;
  }
  processing.value = true;
  errorMsg.value = '';
  outputTxt.value = '';
  
  setTimeout(() => {
    try {
      const result = process(inputTxt.value);
      if (result.startsWith('ERROR:')) errorMsg.value = result;
      else outputTxt.value = result;
    } catch (error) {
      errorMsg.value = `ERROR: ${error.message}`;
    } finally {
      processing.value = false;
    }
  }, 300); 
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg-base: #0d0d18;
  --bg-card: rgba(255,255,255,0.09);
  --bg-card-hover: rgba(255,255,255,0.12);
  --border: rgba(255,255,255,0.16);
  --border-bright: rgba(255,255,255,0.24);
  --text-primary: #f0f0ff;
  --text-secondary: rgba(240,240,255,0.55);
  --text-muted: rgba(240,240,255,0.35);
}

input, textarea, select {
  background: rgba(255,255,255,0.1) !important;
  color: #f0f0ff !important;
  border-color: rgba(255,255,255,0.18) !important;
}
input::placeholder, textarea::placeholder {
  color: rgba(240,240,255,0.3) !important;
}
input:focus, textarea:focus, select:focus {
  outline: none !important;
  border-color: #00d4ff !important;
  box-shadow: 0 0 0 3px rgba(0,212,255,0.1) !important;
  background: rgba(0,212,255,0.05) !important;
}
label {
  color: rgba(240,240,255,0.55) !important;
}
.settings-section * {
  background-color: transparent;
}
.settings-section input,
.settings-section textarea,
.settings-section select {
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  border-radius: 10px !important;
  color: #f0f0ff !important;
  padding: 10px 14px !important;
}
.settings-section > div,
.settings-section .keyword-section,
.settings-section [class*="container"],
.settings-section [class*="wrapper"],
.settings-section [class*="box"],
.settings-section [class*="card"] {
  background: transparent !important;
  box-shadow: none !important;
  border-color: rgba(255,255,255,0.1) !important;
  color: #f0f0ff !important;
}
.settings-section p,
.settings-section span,
.settings-section small,
.settings-section h2,
.settings-section h3,
.settings-section h4 {
  color: rgba(240,240,255,0.55) !important;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  position: relative;
  min-height: 100vh;
  padding: 24px 20px 60px;
}

.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
  animation: blobDrift 18s ease-in-out infinite;
}
.blob-1 { width: 500px; height: 500px; background: #00d4ff; top: -100px; left: -150px; animation-delay: 0s; opacity: 0.22; }
.blob-2 { width: 400px; height: 400px; background: #c77dff; bottom: 100px; right: -100px; animation-delay: -6s; opacity: 0.22; }
.blob-3 { width: 350px; height: 350px; background: #06d6a0; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: -12s; opacity: 0.15; }

@keyframes blobDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -40px) scale(1.05); }
  66%       { transform: translate(-20px, 30px) scale(0.95); }
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 40px 40px;
}

.header {
  text-align: center;
  padding: 20px 20px 36px;
  animation: fadeDown 0.7s cubic-bezier(0.16,1,0.3,1) both;
}

.header-badge {
  display: inline-block;
  padding: 4px 14px;
  border: 1px solid var(--border-bright);
  border-radius: 999px;
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 3px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  background: rgba(255,255,255,0.04);
}

.title {
  font-family: 'Space Mono', monospace;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 12px;
}
.title-crypto {
  background: linear-gradient(135deg, #60cfff 0%, #00a8e8 60%, #0077b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.title-calc {
  background: linear-gradient(135deg, #e0f4ff 0%, #90caf9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.settings-section {
  background: rgba(0, 180, 240, 0.1) !important;
  border-color: rgba(0, 180, 240, 0.25) !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(0,200,255,0.12) !important;
}

.main-content { max-width: 780px; margin: 0 auto; }
.workspace { display: flex; flex-direction: column; gap: 12px; }

.section {
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(24px);
  transition: border-color 0.3s ease, background 0.3s ease;
  animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
}
.section:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.24);
}

.cipher-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.cipher-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
  color: var(--text-secondary);
  overflow: hidden;
  animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) var(--delay) both;
}
.cipher-tab:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  transform: translateY(-3px);
  background: rgba(255,255,255,0.04);
}
.cipher-tab.active {
  border-color: var(--accent);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 20%, transparent),
              0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent);
}
.tab-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 120%, var(--accent), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}
.cipher-tab.active .tab-glow,
.cipher-tab:hover .tab-glow { opacity: 0.15; }

.cipher-icon { font-size: 1.4rem; }
.cipher-name { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.5px; }

.mode-toggle {
  position: relative;
  display: flex;
  gap: 6px;
  background: rgba(255,255,255,0.04);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--border);
}
.mode-btn {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.925rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 1;
}
.mode-btn:hover { color: var(--text-primary); }
.mode-btn.active {
  color: var(--text-primary);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.mode-icon { font-size: 1rem; }

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
  font-family: 'Space Mono', monospace;
}
.label-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.input-dot  { background: #00d4ff; box-shadow: 0 0 8px #00d4ff; }
.output-dot { background: #06d6a0; box-shadow: 0 0 8px #06d6a0; }

.text-area {
  width: 100%;
  min-height: 110px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Space Mono', monospace;
  resize: vertical;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.03);
  color: var(--text-primary);
  line-height: 1.6;
}
.text-area::placeholder { color: var(--text-muted); }
.text-area:focus {
  outline: none;
  border-color: #00d4ff;
  background: rgba(0,212,255,0.04);
  box-shadow: 0 0 0 3px rgba(0,212,255,0.08);
}
.text-area.output {
  background: rgba(6,214,160,0.04);
  border-color: rgba(6,214,160,0.3);
  color: #06d6a0;
}

.action-button {
  position: relative;
  width: 100%;
  padding: 17px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
  overflow: hidden;
  letter-spacing: 0.5px;
}
.action-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 25%, transparent);
}
.action-button:active:not(:disabled) { transform: translateY(0); }
.action-button:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-arrow { transition: transform 0.3s; }
.action-button:hover .btn-arrow { transform: translateX(4px); }

.btn-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0s;
}
.action-button:hover .btn-shimmer {
  transform: translateX(100%);
  transition: transform 0.5s ease;
}

.processing { display: flex; align-items: center; justify-content: center; gap: 10px; }
.spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.output-section {
  border-color: rgba(6,214,160,0.2);
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(255,59,48,0.08);
  border: 1px solid rgba(255,59,48,0.25);
  border-radius: 10px;
  color: #ff6b6b;
  font-weight: 500;
  font-size: 0.9rem;
}
.error-icon { font-size: 1.1rem; }

.info-box {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: color-mix(in srgb, var(--accent) 6%, rgba(255,255,255,0.02));
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 20px;
  padding: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
}
.info-icon { font-size: 1.8rem; flex-shrink: 0; }
.info-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.info-content p {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-secondary);
}
.info-line {
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  background: linear-gradient(to bottom, transparent, var(--accent), transparent);
  border-radius: 999px;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.morph-enter-active, .morph-leave-active {
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
}
.morph-enter-from { opacity: 0; transform: translateY(12px) scale(0.98); filter: blur(4px); }
.morph-leave-to   { opacity: 0; transform: translateY(-8px) scale(0.98); filter: blur(4px); }

.slide-up-enter-active { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-leave-to     { opacity: 0; transform: translateY(10px); }

@media (max-width: 640px) {
  .cipher-tabs { grid-template-columns: repeat(3, 1fr); }
  .title { font-size: 2.5rem; }
  .section { padding: 16px; }
}
</style>