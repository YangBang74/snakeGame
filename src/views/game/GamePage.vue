<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const columns: number = 300
const columnsPerRow: number = 25

const start = ref<number>(0)
const award = ref<number | null>(null)
const point = ref<number>(0)
const step = ref<number>(1)
const isGameOver = ref<boolean>(false)
const direction = ref<'up' | 'down' | 'left' | 'right'>('right')

let intervalId: number
let awardIntervalId: number
const level = ref<number>(400) // скорость, мс

const snakeBody = ref<number[]>([])
const initialLength = 3

function generateStart() {
  const pos = Math.floor(Math.random() * columns) + 1
  start.value = pos
  snakeBody.value = [pos]
}

function awardGenerate() {
  awardIntervalId = setInterval(() => {
    if (award.value === null) {
      award.value = Math.floor(Math.random() * columns) + 1
    }
  }, 2000)
}

function stopAwardGenerate() {
  clearInterval(awardIntervalId)
}

function startSnake() {
  clearInterval(intervalId)
  intervalId = setInterval(stepSnake, level.value)
}

function stepSnake() {
  if (isGameOver.value) return

  const next = start.value + step.value

  if (
    next < 1 ||
    next > columns ||
    (step.value === 1 && start.value % columnsPerRow === 0) ||
    (step.value === -1 && (start.value - 1) % columnsPerRow === 0) ||
    snakeBody.value.includes(next)
  ) {
    gameOver()
    return
  }

  snakeBody.value.unshift(next)

  if (next === award.value) {
    point.value++
    award.value = null
    if (level.value > 150) {
      level.value -= 20
    }
  } else {
    const maxLen = initialLength + point.value
    if (snakeBody.value.length > maxLen) {
      snakeBody.value.pop()
    }
  }

  start.value = next
}

function gameOver() {
  isGameOver.value = true
  clearInterval(intervalId)
  stopAwardGenerate()
}

function replay() {
  clearInterval(intervalId)
  stopAwardGenerate()
  point.value = 0
  level.value = 400
  isGameOver.value = false
  award.value = null
  generateStart()
  snakeBody.value = [start.value]
  startSnake()
  awardGenerate()
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp':
      if (step.value !== columnsPerRow) {
        step.value = -columnsPerRow
        direction.value = 'up'
      }
      break
    case 'ArrowDown':
      if (step.value !== -columnsPerRow) {
        step.value = columnsPerRow
        direction.value = 'down'
      }
      break
    case 'ArrowLeft':
      if (step.value !== 1) {
        step.value = -1
        direction.value = 'left'
      }
      break
    case 'ArrowRight':
      if (step.value !== -1) {
        step.value = 1
        direction.value = 'right'
      }
      break
  }
}

onMounted(() => {
  generateStart()
  startSnake()
  awardGenerate()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
  stopAwardGenerate()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section class="my-5">
    <div class="container text-lg font-bold">Очки: {{ point }}</div>
  </section>

  <section>
    <div class="container">
      <div
        class="border-3 grid justify-center mx-[9.25px]"
        :style="`grid-template-columns: repeat(${columnsPerRow}, 1fr)`"
      >
        <div
          v-for="col in columns"
          :key="col"
          class="h-full w-full min-w-10 min-h-10 flex items-center justify-center transition"
          :class="{
            'bg-[#3ddb85] rounded-sm': snakeBody.includes(col) && col !== start,
          }"
        >
          <img
            v-if="col === start"
            :src="`/src/assets/images/snake-head.svg`"
            alt="head"
            class="transition"
            :class="{
              'rotate-90': direction === 'right',
              '-rotate-90': direction === 'left',
              '-rotate-0': direction === 'up',
              'rotate-180': direction === 'down',
            }"
          />
          <img
            v-else-if="col === award"
            src="/src/assets/images/apple.png"
            alt="award"
            class="w-6 h-6"
          />
        </div>
      </div>
    </div>
  </section>

  <Teleport to="body" v-if="isGameOver">
    <div class="fixed w-full h-full top-0 left-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-10 font-bold">
        <h1 class="text-xl text-center">💀 Вы проиграли</h1>
        <div class="flex items-center justify-center gap-3 mt-7">
          <button
            type="button"
            @click="replay"
            class="py-2 px-3 bg-blue-600 text-white rounded cursor-pointer text-sm"
          >
            Начать заново
          </button>
          <a
            href="https://google.com"
            target="_blank"
            class="py-2 px-3 bg-blue-600 text-white rounded cursor-pointer text-sm"
          >
            Выйти
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
