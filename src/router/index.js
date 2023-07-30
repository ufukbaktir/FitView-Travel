import { createRouter, createWebHistory } from "vue-router";
import ProfilePage from "../components/ProfilePage.vue";
import SVMap from "../components/StreetViewMap.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: ProfilePage,
    },

    {
      path: "/SVMap",
      name: "SVMap",
      component: SVMap,
    },
  ],
});

export default router;
