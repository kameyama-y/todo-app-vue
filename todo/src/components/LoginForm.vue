<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const username = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:3000/login", {
      email: username.value,
      password: password.value,
    });
    const user = res.data.user;
    console.log("ログイン成功:", user);
    router.push("/todo");
  } catch (error) {
    console.error("ログインエラー:", error);
    alert(
      "ログインに失敗しました。ユーザー名またはパスワードを確認してください。"
    );
  }
};
</script>

<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">ユーザー名</label>
        <input id="username" v-model="username" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">パスワード</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button class="login-button" type="submit">ログイン</button>
    </form>
    <!-- 新規登録誘導文 -->
    <p class="register-link">
      アカウントをお持ちでない場合は
      <router-link to="/register">こちらから新規登録</router-link>
    </p>
  </div>
</template>

<style>
body {
  background: linear-gradient(
    135deg,
    #74ebd5,
    #acb6e5
  ); /* 青系グラデーション */
}
.login-container {
  max-width: 400px;
  margin: 150px auto;
  padding: 2rem;
  border: 3px solid black;
  border-radius: 8px;
  text-align: left;
  background-color: #86f9c5;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border-radius: 8px;
}

button {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #99ccff;
}
.login-button {
  margin: 0 auto;
  border: 1px solid #000;
}
</style>
