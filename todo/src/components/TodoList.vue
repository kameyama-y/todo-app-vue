<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  query,
  orderBy,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ダイアログ表示状態
const showDialog = ref(false);
// 入力中のテキスト
const todo_text = ref("");
// Todoリスト（表示用）
const todoList = ref([]);
// 編集中のタスクを保持する変数を追加
const editingTodo = ref(null);

// ダイアログを開く関数
const openDialog = () => {
  showDialog.value = true;
};

// ダイアログを閉じる関数
const closeDialog = () => {
  showDialog.value = false;
};

// コンポーネントがマウントされたら取得
onMounted(() => {
  // FirestoreからTodoリストを取得
  fetchTodos();
});

// FirestoreからTodoリストを取得する関数
const fetchTodos = async () => {
  try {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    todoList.value = querySnapshot.docs.map((doc) => ({
      id: doc.id, // 🔑 FirestoreのID
      ...doc.data(), // text, done など
    }));
  } catch (e) {
    console.error("Firestoreからの取得失敗:", e);
  }
};

// タスク追加処理
const addTodo = async () => {
  const text = todo_text.value.trim();
  if (text) {
    try {
      // Firestoreに新しいタスクを追加
      const docRef = await addDoc(collection(db, "todos"), {
        text,
        done: false,
        createdAt: serverTimestamp(),
      });
      // ローカルリストに追加
      todoList.value.push({ id: docRef.id, text, done: false });
      todo_text.value = "";
      closeDialog();
    } catch (e) {
      console.error("Firestoreへの追加失敗:", e);
    }
  }
};

// 編集モードに入る
const startEdit = (todo) => {
  editingTodo.value = { ...todo }; // コピー
  todo_text.value = editingTodo.value.text;
  showDialog.value = true;
};

// 編集確定
const saveEdit = async () => {
  if (editingTodo.value) {
    await updateDoc(doc(db, "todos", editingTodo.value.id), {
      text: todo_text.value,
    });
    editingTodo.value = null;
  }
  todo_text.value = "";
  showDialog.value = false;
  fetchTodos();
};

// チェックボックス更新処理
const toggleDone = async (todo) => {
  await updateDoc(doc(db, "todos", todo.id), {
    done: todo.done,
  });
};

// タスク削除処理
const removeTodo = async (id) => {
  try {
    // Firestoreから削除
    await deleteDoc(doc(db, "todos", id));
    // ローカルリストから削除
    const index = todoList.value.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todoList.value.splice(index, 1);
    }
  } catch (e) {
    console.error("Firestoreからの削除失敗:", e);
  }
};

onMounted(fetchTodos);
</script>

<template>
  <div class="todo-container">
    <div class="title_area">
      <h2 class="title">TODOリスト</h2>
      <button @click="openDialog" class="plus-button">＋</button>
    </div>

    <!-- タスク一覧 -->
    <ul>
      <li v-for="(todo, index) in todoList" :key="index" class="todo-item">
        <label class="todo-label">
          <!-- チェックボックス -->
          <input
            type="checkbox"
            @change="toggleDone(todo)"
            v-model="todo.done"
            class="checkbox"
          />
          <!-- タスクのテキスト -->
          <span :class="{ done: todo.done }">{{ todo.text }}</span>
        </label>
        <!-- 編集ボタン -->
        <button class="edit-button" @click="startEdit(todo)">編集</button>
        <!-- 削除ボタン -->
        <button class="delete-button" @click="removeTodo(todo.id)">削除</button>
      </li>
    </ul>

    <!-- 追加・編集ダイアログ -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editingTodo ? "タスクを編集" : "新しいタスクを追加" }}</h3>
        <input v-model="todo_text" type="text" placeholder="タスクを入力" />
        <div class="modal-buttons">
          <button class="modal-button" v-if="editingTodo" @click="saveEdit">
            更新
          </button>
          <button class="modal-button" v-else @click="addTodo">追加</button>
          <button class="modal-button" @click="showDialog = false">
            閉じる
          </button>
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 24px;
  padding: 0;
  border: none;
  outline: none;
  margin-left: auto; /* ←これで右端に寄せる！ */
}
.plus-button:hover {
  background-color: #5d99ff; /* ホバー時の背景色 */
}
.delete-button {
  background-color: #ff5c5c;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.delete-button:hover {
  background-color: #ff1a1a; /* ホバー時の背景色 */
}
.edit-button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.edit-button:hover {
  background-color: #0056b3;
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
  gap: 5px; /* ボタン間のスペース */
  margin-top: 40px; /* ダイアログ内容とボタンの間の余白 */
}
.modal-button {
  padding: 10px 25px; /* 縦横のボタン内余白 */
  border-radius: 8px; /* 角の丸みの大きさ */
  border: none; /* ボーダー（線）を消す */
  background-color: #007bff; /* ボタンの背景色 */
  color: white; /* 文字色 */
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.modal-button:hover {
  background-color: #0056b3; /* ホバー時に少し濃い色に */
}
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #ccc;
}
.checkbox {
  width: 18px;
  height: 18px;
}
.todo-label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1; /* ← テキストがボタンと分かれて横幅を広く取れるように */
}
.done {
  color: #999;
  text-decoration: line-through;
}
</style>
