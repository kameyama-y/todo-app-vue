<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");
const confirmPassword = ref(""); // パスワード確認用

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert("パスワードが一致しません");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/register", {
      email: email.value,
      password: password.value,
    });
    console.log("登録成功:", res.data);
    alert("登録に成功しました。ログインしてください。");
    router.push("/login");
  } catch (err) {
    alert(err.response?.data?.error || "登録失敗");
  }
};
</script>

<template>
  <div class="register-container">
    <h2>新規登録</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">パスワード</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">パスワード確認</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          required
        />
      </div>
      <button class="register-button" type="submit">登録</button>
    </form>
    <p>
      すでにアカウントがある方は
      <router-link to="/login">ログインはこちら</router-link>
    </p>
  </div>
</template>

<style>
body {
  background: linear-gradient(135deg, #74ebd5, #acb6e5);
}

.register-container {
  max-width: 400px;
  margin: 150px auto;
  padding: 2rem;
  border: 3px solid black;
  border-radius: 8px;
  text-align: left;
  background-color: #f7f7f7;
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
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #66aaff;
}

.register-button {
  margin: 0 auto;
  border: 1px solid #000;
  width: 30%;
}

p {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
