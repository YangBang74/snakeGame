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

// ===== Свайпы: добавляем переменные для хранения начальных координат касания =====
let touchStartX = 0
let touchStartY = 0

function generateStart() {
  const pos = Math.floor(Math.random() * columns) + 1
  start.value = pos
  snakeBody.value = [pos]
}

function awardGenerate() {
  awardIntervalId = setInterval(() => {
    if (award.value === null) {
      let attempts = 0
      let newAward = null
      do {
        newAward = Math.floor(Math.random() * columns) + 1
        attempts++
      } while (snakeBody.value.includes(newAward) && attempts < 100)

      if (!snakeBody.value.includes(newAward)) {
        award.value = newAward
      } else {
        console.log('Свободной клетки не найдено для еды')
      }
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
      // Перезапускаем таймер с новой скоростью
      startSnake()
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

// ===== Обработка клавиатуры =====
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

// ===== Обработка свайпов =====
function handleTouchStart(event: TouchEvent) {
  const t = event.touches[0]
  touchStartX = t.clientX
  touchStartY = t.clientY
}

function handleTouchEnd(event: TouchEvent) {
  const t = event.changedTouches[0]
  const deltaX = t.clientX - touchStartX
  const deltaY = t.clientY - touchStartY

  // Минимальный порог для распознавания свайпа
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30) return

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Горизонтальный свайп
    if (deltaX > 0 && step.value !== -1) {
      step.value = 1
      direction.value = 'right'
    } else if (deltaX < 0 && step.value !== 1) {
      step.value = -1
      direction.value = 'left'
    }
  } else {
    // Вертикальный свайп
    if (deltaY > 0 && step.value !== -columnsPerRow) {
      step.value = columnsPerRow
      direction.value = 'down'
    } else if (deltaY < 0 && step.value !== columnsPerRow) {
      step.value = -columnsPerRow
      direction.value = 'up'
    }
  }
}

onMounted(() => {
  generateStart()
  startSnake()
  awardGenerate()

  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
  stopAwardGenerate()

  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<template>
  <section class="my-5">
    <div class="container text-lg font-bold">Очки: {{ point }}</div>
  </section>

  <section>
    <div class="container">
      <div
        class="outline-10 outline-black overflow-hidden grid justify-center mx-[0.5781rem]"
        :style="`grid-template-columns: repeat(${columnsPerRow}, 1fr)`"
      >
        <div
          v-for="col in columns"
          :key="col"
          class="h-full w-full min-w-2 aspect-[1/1] min-h-2 flex items-center justify-center transition"
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
            class="min-w-2 min-h-2 w-full h-full"
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
