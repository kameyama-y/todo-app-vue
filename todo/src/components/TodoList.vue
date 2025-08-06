<script setup>
import { ref } from 'vue'
// ダイアログ表示状態
const showDialog = ref(false)

const todo_text = ref('')

// ダイアログを開く関数
const openDialog = () => {
  showDialog.value = true
}

// ダイアログを閉じる関数
const closeDialog = () => {
  showDialog.value = false
}
</script>

<template>
  <div class="todo-container">
    <div class="title_area">
    <h2 class="title">TODOリスト</h2>
     <button @click="openDialog" class="plus-button">＋</button>
     </div>
    <p>ここにタスク一覧が表示されます。</p>
        <!-- モーダルダイアログ -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <h3>新しいタスクを追加</h3>
        <input id="todo_text" v-model="todo_text" type="text" required />
        <div class="modal-buttons">
        <button class="modal-button" @click="">追加</button>
        <button class="modal-button" @click="closeDialog">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  background-color: white;
}
.todo-container {
  padding: 2rem;
  background-color: white; /* 背景を白に */
  min-height: 100vh; /* 画面全体に背景を広げる */
}
.title {
  color: blue;
}
.title_area {
  display: flex;
  align-items: center; 
  width: 100%;
}
.plus-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 24px;
  padding: 0;
  border: none;
  outline: none;
  margin-left: auto; /* ←これで右端に寄せる！ */
}
.plus-button:hover {
  background-color: #5D99FF; /* ホバー時の背景色 */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
}

.modal-buttons {
  display: flex;
justify-content: space-evenly;
  gap: 5px;           /* ボタン間のスペース */
  margin-top: 40px;    /* ダイアログ内容とボタンの間の余白 */
}
.modal-button {
  padding: 10px 25px;      /* 縦横のボタン内余白 */
  border-radius: 8px;      /* 角の丸みの大きさ */
  border: none;           /* ボーダー（線）を消す */
  background-color: #007bff; /* ボタンの背景色 */
  color: white;            /* 文字色 */
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.modal-button:hover {
  background-color: #0056b3; /* ホバー時に少し濃い色に */
}
</style>
