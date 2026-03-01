<template>
  <div class="cipher-settings">
    <div class="input-group">
      <label>Parameter A (coprime with 26)</label>
      <input 
        type="number" 
        :value="a" 
        @input="$emit('update:a', $event.target.value)" 
        min="1"
        max="25"
        class="input-field"
      />
      <p class="hint">Valid: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25</p>
    </div>
    
    <div class="input-group">
      <label>Parameter B (0-25)</label>
      <input 
        type="number" 
        :value="b" 
        @input="$emit('update:b', $event.target.value)" 
        min="0"
        max="25"
        class="input-field"
      />
      <p class="hint">Formula: E(x) = (ax + b) mod 26</p>
    </div>
  </div>
</template>

<script setup>
defineProps(['a', 'b']);
defineEmits(['update:a', 'update:b']);
</script>

<style scoped>
.cipher-settings {
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group:last-child {
  margin-bottom: 0;
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
