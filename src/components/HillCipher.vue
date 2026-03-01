<template>
  <div class="hill-container">
    <div class="size-selector">
      <label>Matrix Size:</label>
      <div class="size-buttons">
        <button 
          v-for="size in [2, 3, 4]" 
          :key="size"
          @click="changeSize(size)"
          :class="['size-btn', { active: localSize === size }]"
        >
          {{ size }}×{{ size }}
        </button>
      </div>
    </div>

    <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${localSize}, 1fr)` }">
      <div 
        v-for="(val, idx) in localMatrix" 
        :key="idx" 
        class="matrix-cell"
      >
        <input 
          type="number" 
          v-model.number="localMatrix[idx]" 
          @input="update"
          class="matrix-input"
        />
      </div>
    </div>

    <div class="matrix-info">
      <p>Determinant must be coprime with 26 for decryption</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const localSize = ref(props.modelValue.size || 2);
const localMatrix = reactive([...props.modelValue.matrix]);

const changeSize = (newSize) => {
  localSize.value = newSize;
  const matrixSize = newSize * newSize;
  
  // Reset matrix dengan nilai default
  localMatrix.length = 0;
  for (let i = 0; i < matrixSize; i++) {
    // Buat identity matrix sebagai default
    if (i % (newSize + 1) === 0) {
      localMatrix.push(1);
    } else {
      localMatrix.push(0);
    }
  }
  
  update();
};

const update = () => {
  emit('update:modelValue', {
    size: localSize.value,
    matrix: [...localMatrix]
  });
};

watch(() => props.modelValue, (newVal) => {
  if (newVal.size !== localSize.value) {
    localSize.value = newVal.size;
  }
  if (JSON.stringify(newVal.matrix) !== JSON.stringify(localMatrix)) {
    Object.assign(localMatrix, newVal.matrix);
  }
}, { deep: true });
</script>

<style scoped>
.hill-container {
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
}

.size-selector {
  margin-bottom: 20px;
}

.size-selector label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #86868b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-buttons {
  display: flex;
  gap: 8px;
}

.size-btn {
  flex: 1;
  padding: 10px;
  background: white;
  border: 2px solid #e5e5e7;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.size-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.size-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  transform: scale(1.05);
}

.matrix-grid {
  display: grid;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto 20px;
}

.matrix-cell {
  aspect-ratio: 1;
}

.matrix-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #e5e5e7;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  padding: 0;
}

.matrix-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.matrix-input:hover {
  border-color: #667eea;
}

.matrix-info {
  text-align: center;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #515154;
}

.matrix-info p {
  margin: 0;
}

@media (max-width: 768px) {
  .matrix-grid {
    max-width: 300px;
  }
  
  .matrix-input {
    font-size: 16px;
  }
}
</style>
