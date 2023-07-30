<template>
  <div class="profile-page">
    <div class="title-rectangle">
      <img class="logo" src="./ft-logos/fit-view-logo2.png" />
      <div class="login-desc">
        <p class="title">Welcome to FitView Travel.</p>
        <p class="desc">
          Please Login to your Google account to see your recent activity data
          from Google Fit.
        </p>

        <div class="login-container">
          <button v-if="!isLoggedIn" class="google-login-btn" @click="login">
            <span class="google-icon"></span>Login with Google
          </button>
        </div>
      </div>
    </div>
    <div class="info-rects" v-if="isLoggedIn" id="scrollTarget">
      <div class="profile-info rectangle">
        <img class="profile-pic" :src="profilePicture" alt="Profile Picture" />
        <h2>{{ userName }}</h2>
        <div class="personal-h-w">
          <p>Height: {{ height }} cm</p>
          <p>Weight: {{ weight }} kg</p>
        </div>

        <img class="fitlogo" src="./icons/images/google-fit.png" />

        <button v-if="isLoggedIn" class="google-login-btn" @click="logout">
          <span class="google-icon"></span>
          Logout
        </button>
      </div>

      <div class="fit-rects">
        <div class="step-taken rectangle">
          <p>Last Step Taken</p>
          <h3>{{ stepCount }} steps</h3>
          <img
            class="profileicon"
            src="./icons/images/steps.png"
            alt="Step Icon"
          />
        </div>

        <div class="calories-burned rectangle">
          <p>Calories Burned</p>
          <h3>{{ caloriesBurned }} cal</h3>
          <img
            class="profileicon"
            src="./icons/images/calories.png"
            alt="Calories Icon"
          />
        </div>

        <div class="distance-traveled rectangle">
          <p>Distance Traveled</p>
          <h3>{{ distanceTraveled }} m</h3>
          <img
            class="profileicon"
            src="./icons/images/distance.png"
            alt="Distance Icon"
          />
        </div>

        <div class="heart-rate rectangle">
          <p>Heart Rate</p>
          <h3>{{ heartRate }} bpm</h3>
          <img
            class="profileicon"
            src="./icons/images/heart-rate.png"
            alt="Heart Icon"
          />
        </div>
      </div>

      <div id="footer-btns">
        <div class="mt-2 nav-btns">
          <router-link to="/SVMap" class="btn btn-primary btn-lg svmap-btn"
            >Start Traveling Around
            <i class="bi bi-arrow-right-circle-fill"></i>
            <img class="mapslogo" src="./icons/images/google-maps.png"
          /></router-link>
        </div>
      </div>
      <div class="mt-4" id="scroll-target"></div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { decodeCredential, googleLogout } from "vue3-google-login";
import axios from "axios";
import { googleSdkLoaded } from "vue3-google-login";

export default defineComponent({
  name: "ProfilePage",
  data() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    return {
      userName: "Your Name",
      height: "No data",
      weight: "No data",
      stepCount: "No data",
      caloriesBurned: "No data",
      distanceTraveled: "No data",
      heartRate: "No data",
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      activityData: null,
      profilePicture: "",
      isLoggedIn: false,
    };
  },
  mounted() {},
  methods: {
    login() {
      googleSdkLoaded((google) => {
        console.log(google.accounts.oauth2);
        google.accounts.oauth2
          .initTokenClient({
            client_id:
              "218209555371-fg4dvr2jdttejd0g66f67v9ruphrr657.apps.googleusercontent.com",
            scope:
              "email profile https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.location.read ",
            callback: (response) => {
              console.log("Handle the response", response);
              //activityData = this.getActivityData(response.access_token);
              this.getHeightData(response.access_token);
              this.getWeightData(response.access_token);
              this.getStepCount(response.access_token);
              this.getCaloriesBurned(response.access_token);
              this.getDistanceTraveled(response.access_token);
              this.getHeartRate(response.access_token);
              this.getUserName(response.access_token);
              this.getProfilePicture(response.access_token);
              this.isLoggedIn = true;
              this.$nextTick(() => {
                this.scrollToDiv();
              });
            },
          })
          .requestAccessToken();
      });
    },

    logout() {
      googleLogout();
      this.isLoggedIn = false;
    },

    scrollToDiv() {
      const targetElement = document.getElementById("scroll-target");
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    },
    async getActivityData(token) {
      try {
        console.log(token);
        const response = await axios.get(
          "https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.step_count.delta:com.google.android.gms:estimated_steps/datasets/" +
            this.startDate +
            "-" +
            this.endDate +
            "?access_token=" +
            token,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response.data);
        this.activityData = response.data;
      } catch (error) {
        console.error(error);
      }
    },

    async getHeightData(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataSourceId:
                  "derived:com.google.height:com.google.android.gms:merge_height",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastHeightData = getLastHeightData(response);
        console.log(lastHeightData);

        if (lastHeightData) {
          this.height = lastHeightData;
        } else {
          console.error("No height data found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastHeightData(response) {
        const buckets = response.data.bucket;
        let lastHeightData;

        for (let i = buckets.length - 1; i >= 0 && !lastHeightData; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (let j = datasets.length - 1; j >= 0 && !lastHeightData; j--) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const heightData = points[k];

              if (heightData.value[0].fpVal !== 0) {
                lastHeightData = heightData.value[0].fpVal.toFixed(2);
                break;
              }
            }
          }
        }

        return lastHeightData;
      }
    },

    async getWeightData(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataSourceId:
                  "derived:com.google.weight:com.google.android.gms:merge_weight",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastWeightData = getLastWeightData(response);
        console.log(lastWeightData);

        if (lastWeightData) {
          this.weight = lastWeightData;
          writeToTxtFile(this.weight, "/src/data/weight.txt");
        } else {
          console.error("No weight data found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastWeightData(response) {
        const buckets = response.data.bucket;
        let lastWeightData;

        for (let i = buckets.length - 1; i >= 0 && !lastWeightData; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (let j = datasets.length - 1; j >= 0 && !lastWeightData; j--) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const weightData = points[k];

              if (weightData.value[0].fpVal !== 0) {
                lastWeightData = weightData.value[0].fpVal;
                break;
              }
            }
          }
        }

        return lastWeightData;
      }

      function writeToTxtFile(data, path) {
        const content = data.toString();

        fs.writeFile(path, content, (err) => {
          if (err) throw err;
          console.log(`Weight data written to ${path}`);
        });
      }
    },

    async getStepCount(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
                dataSourceId:
                  "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastStepCount = getLastStepCount(response);
        console.log(lastStepCount);

        if (lastStepCount) {
          this.stepCount = lastStepCount;
        } else {
          console.error("No step count found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastStepCount(response) {
        const buckets = response.data.bucket;
        let lastStepCount;

        for (let i = buckets.length - 1; i >= 0 && !lastStepCount; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (let j = datasets.length - 1; j >= 0 && !lastStepCount; j--) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const stepCountData = points[k];

              if (stepCountData.value[0].intVal !== 0) {
                lastStepCount = stepCountData.value[0].intVal;
                break;
              }
            }
          }
        }

        return lastStepCount;
      }
    },

    async getCaloriesBurned(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataTypeName: "com.google.calories.expended",
                dataSourceId:
                  "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastCaloriesBurned = getLastCaloriesBurned(response);
        console.log(lastCaloriesBurned);

        if (lastCaloriesBurned) {
          this.caloriesBurned = lastCaloriesBurned;
        } else {
          console.error("No calories burned data found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastCaloriesBurned(response) {
        const buckets = response.data.bucket;
        let lastCaloriesBurned;

        for (let i = buckets.length - 1; i >= 0 && !lastCaloriesBurned; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (
            let j = datasets.length - 1;
            j >= 0 && !lastCaloriesBurned;
            j--
          ) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const caloriesBurnedData = points[k];

              if (caloriesBurnedData.value[0].fpVal !== 0) {
                lastCaloriesBurned =
                  caloriesBurnedData.value[0].fpVal.toFixed(2);
                break;
              }
            }
          }
        }

        return lastCaloriesBurned;
      }
    },

    async getDistanceTraveled(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataTypeName: "com.google.distance.delta",
                dataSourceId:
                  "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastDistanceTraveled = getLastDistanceTraveled(response);
        console.log(lastDistanceTraveled);

        if (lastDistanceTraveled) {
          this.distanceTraveled = lastDistanceTraveled;
        } else {
          console.error("No distance traveled data found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastDistanceTraveled(response) {
        const buckets = response.data.bucket;
        let lastDistanceTraveled;

        for (let i = buckets.length - 1; i >= 0 && !lastDistanceTraveled; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (
            let j = datasets.length - 1;
            j >= 0 && !lastDistanceTraveled;
            j--
          ) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const distanceData = points[k];

              if (distanceData.value[0].fpVal !== 0) {
                lastDistanceTraveled = distanceData.value[0].fpVal.toFixed(2);
                break;
              }
            }
          }
        }

        return lastDistanceTraveled;
      }
    },

    async getHeartRate(token) {
      try {
        const response = await axios({
          method: "post",
          url:
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate" +
            "?access_token=" +
            token,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            aggregateBy: [
              {
                dataTypeName: "com.google.heart_rate.bpm",
                dataSourceId:
                  "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: this.startDate,
            endTimeMillis: this.endDate,
          },
        });

        console.log(response.data);
        const lastHeartRate = getLastHeartRate(response);
        console.log(lastHeartRate);

        if (lastHeartRate) {
          this.heartRate = lastHeartRate;
        } else {
          console.error("No heart rate data found");
        }
      } catch (error) {
        console.error(error);
      }

      function getLastHeartRate(response) {
        const buckets = response.data.bucket;
        let lastHeartRate;

        for (let i = buckets.length - 1; i >= 0 && !lastHeartRate; i--) {
          const bucket = buckets[i];
          const datasets = bucket.dataset;

          for (let j = datasets.length - 1; j >= 0 && !lastHeartRate; j--) {
            const dataset = datasets[j];
            const points = dataset.point;

            for (let k = points.length - 1; k >= 0; k--) {
              const heartRateData = points[k];

              if (heartRateData.value[0].fpVal !== 0) {
                lastHeartRate = heartRateData.value[0].fpVal.toFixed(2);
                break;
              }
            }
          }
        }

        return lastHeartRate;
      }
    },

    async getProfilePicture(token) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        this.profilePicture = response.data.picture;
      } catch (error) {
        console.error(error);
      }
    },

    async getUserName(token) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        this.userName = response.data.name;
      } catch (error) {
        console.error(error);
      }
    },
  },
});
</script>

<style>
body {
  background-image: url("../img/runnin1.png");
  background-size: cover;
}

.profile-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.title-rectangle {
  width: 80%;
  background-color: rgba(247, 247, 247, 0.7);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  text-align: center;
  gap: 5px;
  margin-top: 50px;
}
.login-desc {
  margin: 30px;
}
.title {
  font-weight: 700;
}
.desc {
  font-size: 15px;
}
.logo {
  width: 50%;
  height: 50%;
}

.login-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  align-items: center;
}
.google-login-btn {
  background-color: #fff;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: none;
  color: rgba(0, 0, 0, 0.54);
  font-family: Roboto, sans-serif;
  font-size: 20px;
  height: 36px;
  margin-top: 20px;
  padding: 0;
  width: 240px;
}

.google-login-btn:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in;
}

.google-login-btn:focus {
  outline-width: 0;
}

.google-login-btn .google-icon {
  background: url("./icons/images/google-logo.png") left center no-repeat;
  background-size: contain;
  margin-right: 12px;
  display: inline-block;
  vertical-align: middle;
  width: 25px;
  height: 25px;
}

.rectangle {
  background-color: rgba(247, 247, 247, 0.7);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  text-align: center;
}
.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.profile-info .profile-pic {
  box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.1);
  border: solid 1px;
  border-radius: 8px;
  margin: 10px;
}

.profile-info h2 {
  font-weight: 700;
}

.profile-info .personal-h-w {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.profile-info .fitlogo {
  width: 140px;
  height: 100px;
  margin: 10px;
}

.info-rects {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  margin: 30px;
}

.fit-rects {
  display: flex;
  gap: 10px;
}
.fit-rects p {
  font-weight: 800;
}

.step-taken {
}

.calories-burned {
}

.distance-traveled {
}

.heart-rate {
}

.profileicon {
  width: 60px;
  height: 60px;
}
.nav-btns {
  display: flex;
  justify-content: center;
}
.svmap-btn {
  background-color: rgb(160, 209, 255);
  border: 2px solid #00357538;
  color: rgb(69, 69, 69);
  font-weight: 600;
  backdrop-filter: blur(10px);
}
.mapslogo {
  width: 100px;
  height: 55px;
}
</style>
