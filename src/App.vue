<template>
  <div id="app">
    <TodoList />
  </div>
</template>
<script>
import TodoList from "@/components/Todo.vue"; // Adjust the path as needed
export default {
  name: "App",
  components: {
    TodoList,
  },
};
</script>
<style>
/* App styles go here */
</style>
