<template>
  <div class="cipher-settings">
    <label>Rotor Setting (3 letters)</label>
    <input 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value.toUpperCase().substring(0, 3))" 
      placeholder="e.g., MCK"
      maxlength="3"
      class="input-field rotor-input"
    />
    <p class="hint">Simulates 3-rotor Enigma machine</p>
    <p class="hint">Rotors advance after each character</p>
  </div>
</template>

<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

<style scoped>
.cipher-settings {
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
}

label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #86868b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e5e7;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
}

.rotor-input {
  text-align: center;
  letter-spacing: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.hint {
  font-size: 0.8125rem;
  color: #86868b;
  margin-top: 8px;
}
</style>
