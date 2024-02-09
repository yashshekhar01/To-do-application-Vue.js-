<template>
  <div class="todo-container">
    <header>
      <div class="overlay">
        <h1>To-Do List</h1>
      </div>
    </header>
    <div class="todo-input">
      <label class="input-group__label" for="myInput">Add Task</label>
      <input
        v-model="newTask"
        @keyup.enter="addTask"
        id="myInput"
        class="input-group__input"
        placeholder="Add a new task"
      />
      <button class="button-85" @click="addTask">
        <i class="fas fa-plus"></i> Add
      </button>
    </div>
    <v-app>
      <v-tabs v-model="activeTab" class="todo-tabs">
        <v-tab
          v-for="(tab, index) in tabs"
          :key="index"
          @click="changeTab(tab)"
          :class="{ 'active-tab': activeTab === tab }"
        >
          {{ tab }}
        </v-tab>
      </v-tabs>
      <v-tab-item v-for="(tab, index) in tabs" :key="index" :value="tab">
        <v-card
          color="basil"
          flat
          class="todo-list-card"
          v-show="showNoTasksMessage(tab)"
        >
        </v-card>
        <v-card
          color="basil"
          flat
          class="todo-list-card"
          v-show="!showNoTasksMessage(tab)"
        >
          <v-card-text>
            <table v-if="activeTab === tab" class="todo-table">
              <thead class="tbl-header">
                <tr>
                  <th>Task</th>
                  <th>Created Date</th>
                  <th v-if="activeTab === 'Completed'">Completion Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in displayedTasks" :key="task.id">
                  <td>
                    <template v-if="task.editing">
                      <input
                        v-model="task.editedText"
                        @keyup.enter="saveTask(task)"
                      />
                    </template>
                    <template v-else>
                      {{ task.text }}
                    </template>
                  </td>
                  <td>{{ task.createdAt }}</td>
                  <td v-if="activeTab === 'Completed'">
                    {{ task.CompletedAt }}
                  </td>
                  <td>
                    <span v-if="activeTab == 'Ongoing'">
                      <button
                        class="button-32"
                        @click="editTask(task)"
                        v-if="!task.editing"
                      >
                        Edit
                      </button>
                      <button class="button-32" @click="saveTask(task)" v-else>
                        Save
                      </button>
                    </span>
                    <button
                      v-if="activeTab !== 'Completed'"
                      @click="completeTask(task.id)"
                      class="button-33"
                    >
                      Complete
                    </button>
                    <button @click="deleteTask(task.id)" class="button-62">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-app>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed } from "vue";

export default {
  name: "TodoList",
  setup() {
    const newTask = ref("");
    const tasks = ref([]);
    const CompletedTasks = ref([]);
    const OngoingTasks = ref([]);
    const $axios = inject("$axios");
    const activeTab = ref("Ongoing");

    const addTask = async () => {
      if (newTask.value.trim() !== "") {
        const response = await $axios.post("http://localhost:3000/tasks", {
          text: newTask.value,
          createdAt: new Date().toLocaleString(),
          Completed: false,
          CompletedAt: null,
        });
        tasks.value.push(response.data);
        OngoingTasks.value.push(response.data);
        newTask.value = "";
      }
    };

    const deleteTask = async (taskId) => {
      try {
        await $axios.delete(`http://localhost:3000/tasks/${taskId}`);

        tasks.value = tasks.value.filter((task) => task.id !== taskId);
        CompletedTasks.value = CompletedTasks.value.filter(
          (task) => task.id !== taskId
        );
        OngoingTasks.value = OngoingTasks.value.filter(
          (task) => task.id !== taskId
        );
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    };
    const editTask = (task) => {
      task.editing = true;
      task.editedText = task.text;
    };
    const saveTask = async (task) => {
      task.editing = false;
      // Update task text in the database
      await $axios.patch(`http://localhost:3000/tasks/${task.id}`, {
        text: task.editedText,
      });
      task.text = task.editedText;
    };
    const completeTask = async (taskId) => {
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const response = await $axios.patch(
          `http://localhost:3000/tasks/${taskId}`,
          {
            Completed: true,
            CompletedAt: new Date().toLocaleString(),
          } 
        );
        const updatedTask = {
          ...tasks.value[taskIndex],
          Completed: true,
          CompletedAt: response.data.CompletedAt,
        };

        OngoingTasks.value = OngoingTasks.value.filter(
          (task) => task.id !== taskId
        );

        tasks.value = [
          ...tasks.value.slice(0, taskIndex),
          updatedTask,
          ...tasks.value.slice(taskIndex + 1),
        ];

        CompletedTasks.value.push(updatedTask);
      }
    };
    onMounted(async () => {
      const response = await $axios.get("http://localhost:3000/tasks");
      tasks.value = response.data;
      CompletedTasks.value = response.data.filter((task) => task.Completed);
      OngoingTasks.value = response.data.filter((task) => !task.Completed);
    });

    const displayedTasks = computed(() => {
      return activeTab.value === "Completed"
        ? CompletedTasks.value
        : OngoingTasks.value;
    });

    const tabs = ["Ongoing", "Completed"];

    const changeTab = (tab) => {
      activeTab.value = tab;
    };

    const showNoTasksMessage = (tab) => {
      return (
        (tab === "Ongoing" && OngoingTasks.value.length === 0) ||
        (tab === "Completed" && CompletedTasks.value.length === 0)
      );
    };

    return {
      newTask,
      tasks,
      CompletedTasks,
      OngoingTasks,
      addTask,
      completeTask,
      deleteTask,
      activeTab,
      displayedTasks,
      tabs,
      changeTab,
      editTask,
      saveTask,
      showNoTasksMessage,
    };
  },
};
</script>
<style scoped>

.overlay h1 {
  font-family: Arial, sans-serif; 
  font-weight: bold; 
  color: blue; 
  padding-bottom: 18px; 
  margin-right: 4%; 
}

.input-group__label {
  font-family: "Protest Riot", sans-serif; 
  font-weight: bold; 
  font-size: 20px; 
  margin-right: 16px; 
  color:black;
}

.input-group__input {
  border: 3px solid #333; 
  border-radius: 5px; 
  padding: 10px; 
  font-size: 16px; 
  width: 310px; 
}

.input-group__input::placeholder {
  color: #999; 
  font-style: italic; 
  background-color: #f5f5f5; 
}

.input-group__input {
  color: #333; 
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

.todo-container {
  text-align: center;
  margin-top: 70px;
}

.todo-heading {
  font-size: 24px;
  margin-bottom: 20px;
}

.todo-input {
  margin-bottom: 20px;
}

.todo-input input {
  padding: 15px;
  margin-right: 17px;
}

.todo-tabs {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.todo-tabs v-tab {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  color: black; 
  transition: background-color 0.3s ease;
}

.todo-tabs v-tab:hover {
  color: #8a2be2; 
  border-bottom: 1px solid #ddd;
}

.todo-tabs v-tab-item {
  background-color: #f5f5f5;
  border: 1px solid black;
  border-radius: 2px;
  width: 70%;
  margin: 0 auto;
  transition: background-color 0.3s ease;
}

.todo-tabs v-tab-item.active {
  border-bottom: 1px solid red;
  color: #4682b4; 
}

.todo-list-card {
  width: 100%;
  margin: 0 auto;
}

.todo-table {
  width: 67%;
  margin: 0 auto;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #ffffff; 
}

.todo-table th,
.todo-table td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 18px;
  text-align: center;
  color: #333;
}

.todo-table th {
  background-color: #f0f0f0; 

.todo-table td button {
  margin: 5px;
}

.todo-tabs v-tab-item[value="Completed"] {
  color: #008000; 
}

.active-tab {
  font-size: 24px;
}

.button-32 {
  background: orange; 
  border: 0;
  border-radius: 8px; 
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: 'Roboto', sans-serif; 
  font-size: 16px;
  font-weight: 600; 
  line-height: 2.5;
  outline: none;
  padding: 0.1rem 0.8rem; 
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out; 
  user-select: none;
  margin-right: 30px;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}

.button-32:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-32:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-33 {
  background: green; 
  border: 0;
  border-radius: 8px; 
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: 'Roboto', sans-serif; 
  font-size: 16px;
  font-weight: 600; 
  line-height: 2.5;
  outline: none;
  padding: 0.1rem 0.4rem; 
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out; 
  user-select: none;
  margin-right: 30px;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}

.button-33:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-33:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62 {
  background: red; 
  border: 0;
  border-radius: 8px; 
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: 'Roboto', sans-serif; 
  font-size: 16px;
  font-weight: 600; 
  line-height: 2.5;
  outline: none;
  padding: 0.1rem 0.4rem; 
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out; 
  user-select: none;
  margin-right: 30px;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}

.button-62:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-85 {
  padding: 0.6em 2em;
  border: none;
  outline: none;
  color: white; 
  background: linear-gradient(135deg, #2f2f2f, #000); 
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 8px; 
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  font-family: 'Roboto', sans-serif; 
  font-size: 16px; 
  font-weight: 600; 
  text-align: center;
  text-decoration: none;
  margin-left: 30px;
  transition: background-color 0.3s, box-shadow 0.3s; 
}

.button-85:hover {
  background: linear-gradient(135deg, #333, #111); 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
}

.button-85:before {
  content: "";
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00c8,
    #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing-button-85 20s linear infinite;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}
</style>
