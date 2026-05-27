<template>
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
    
    <p class="text-gray-400 text-sm mb-2">
      {{ title }}
    </p>

    <h2 class="text-4xl font-bold text-[#0044AA]">
      {{ value }}
    </h2>

    <p class="text-sm text-gray-500 mt-3">
      {{ subtitle }}
    </p>

  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: String,
  subtitle: String,
})
</script>