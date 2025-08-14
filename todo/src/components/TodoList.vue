<script setup>
import { ref, onMounted, computed } from "vue";
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
//並び替え基準
const sortKey = ref("text");
const sortOrder = ref("asc");
// 検索用キーワード
const searchQuery = ref("");
// ステータスフィルタ
const statusFilter = ref("");
// 作成日フィルタ
const searchDate = ref("");

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
      fetchTodos(); // 再取得して最新の状態にする
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

// 並び替え処理
const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc"; // 新しいキーでの並び替えは昇順
  }
};

// 並び替えられたTodoリストを返す
const searchAndSortTodos = computed(() => {
  // 検索でフィルタ
  let filtered = todoList.value.filter((todo) =>
    todo.text.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  // 作成日フィルタ
  if (searchDate.value) {
    filtered = filtered.filter((todo) => {
      const createDate = todo.createdAt.toDate();
      const formatted = createDate.toISOString().split("T")[0];
      // "YYYY-MM-DD" 形式
      return formatted === searchDate.value;
    });
  }

  // ステータスフィルタ
  if (statusFilter.value) {
    filtered = filtered.filter((todo) =>
      statusFilter.value === "completed" ? todo.done : !todo.done
    );
  }

  // 並び替え
  return [...filtered].sort((a, b) => {
    let result = 0;
    if (a[sortKey.value] < b[sortKey.value]) result = 1;
    if (a[sortKey.value] > b[sortKey.value]) result = -1;
    return sortOrder.value === "asc" ? result : -result;
  });
});

onMounted(fetchTodos);
</script>

<template>
  <div class="todo-container">
    <div class="title_area">
      <h2 class="title">TODOリスト</h2>
      <div class="right-controls">
        <!-- タスク名検索ボックス -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="タスクを検索..."
          class="search-box"
        />
        <!-- 作成日検索ボックス -->
        <input v-model="searchDate" type="date" class="date-search-box" />
        <!-- 完了/未完了フィルタ -->
        <select v-model="statusFilter" class="status-filter">
          <option value="">すべて</option>
          <option value="completed">完了</option>
          <option value="incomplete">未完了</option>
        </select>

        <button @click="openDialog" class="plus-button">＋</button>
      </div>
    </div>

    <!-- タスク一覧 -->
    <table class="todo-table">
      <thead>
        <tr>
          <th @click="toggleSort('text')">タスク名</th>
          <th @click="toggleSort('createdAt')">作成日</th>
          <th @click="toggleSort('done')">完了</th>
          <th>編集</th>
          <th>削除</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="todo in searchAndSortTodos" :key="todo.id">
          <!-- タスクのテキスト -->
          <td :class="{ done: todo.done }">{{ todo.text }}</td>
          <td :class="{ done: todo.done }">
            <!-- タスクの作成日 -->
            {{ todo.createdAt.toDate().toLocaleDateString() }}
          </td>
          <td>
            <!-- タスクの完了状態 -->
            <input
              type="checkbox"
              v-model="todo.done"
              @change="toggleDone(todo)"
            />
          </td>
          <td>
            <!-- 編集ボタン -->
            <button class="edit-button" @click="startEdit(todo)">編集</button>
          </td>
          <td>
            <!-- 削除ボタン -->
            <button class="delete-button" @click="removeTodo(todo.id)">
              削除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

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
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px; /* 各要素の間隔 */
  margin-left: auto; /* 右端寄せ */
}
.right-controls input,
.right-controls select,
.right-controls button {
  padding: 8px 12px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  height: 35px; /* 高さを統一 */
}
.right-controls .search-box {
  width: 200px;
}

.right-controls .date-search-box {
  width: 150px;
}

.right-controls .status-filter {
  width: 100px;
}
.right-controls .plus-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 24px;
  padding: 0;
  border: none;
  outline: none;
  line-height: 1;
}

.todo-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0; /* 枠の隙間をなくす */
  table-layout: auto;
  border: 2px solid #ccc; /* 枠線を太く */
  border-radius: 8px; /* 角丸 */
  overflow: hidden; /* 角丸内に収める */
}
.todo-table th,
.todo-table td {
  padding: 8px;
  border: 2px solid #ccc;
  text-align: center;
  white-space: nowrap; /* テキストの折り返しを防ぐ */
}
.title {
  color: blue;
}
.title_area {
  display: flex;
  align-items: center;
  width: 100%;
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
  display: inline-block;
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
  display: inline-block;
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
  flex-grow: 1; /* ラベルが可能な限り広がるように */
}
.done {
  color: #999;
  text-decoration: line-through;
}
</style>
