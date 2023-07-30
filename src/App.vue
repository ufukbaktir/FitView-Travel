<template>
  <main>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter&family=Montserrat:wght@100;300&family=Raleway&display=swap"
      rel="stylesheet"
    />

    <RouterView />
  </main>
</template>

<style>
* {
  font-family: Raleway;
}
.button {
  display: inline-block;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  background-color: #0078d7;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.button:hover {
  background-color: #005c9e;
}
.active {
  background-color: #004b87;
}
</style>

<script setup>
import { RouterView, RouterLink } from "vue-router";
</script>
