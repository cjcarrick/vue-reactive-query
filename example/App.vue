<script setup lang="ts"></script>

<template>
  <h1>Reactive Query Demo</h1>

  <ul>
    <li>Query parameters in the URL will change when the state changes</li>

    <li>
      Query parameters will remove themselves from the URL entirely when set
      back to their default value.
    </li>

    <li>
      Values are preserved on page reloads, or when the user copies and pastes
      the URL in their browser
    </li>
  </ul>

  <RouterView />
</template>

<style>
body {
  font-family: sans-serif;
  max-width: 720pt;
  margin: 4rem auto;
}

h3 {
  margin-top: 4rem;
}

code {
  background: #eee;
  border-radius: 0.2rem;
  padding: 0.2rem;
}
</style>
