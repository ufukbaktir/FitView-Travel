<template>
  <div>
    <div id="map"></div>
    <div id="pano" ref="pano"></div>
    <div class="mini-map"></div>
    <div class="interface">
      <div class="bike-arms-container">
        <img
          src="./icons/images/Adsıztasarım(1)-modified.png"
          class="watch-image"
        />
        <img src="./icons/images/Adsıztasarım.png" class="tablet-image" />
        <img src="./icons/images/Daco_5729879.png" class="bike-image" />
      </div>
      <div class="bike-arm">
        <button
          class="btn btn-primary watch-btn"
          id="btnW"
          @click="showTimePopup"
        >
          Show Time
        </button>
      </div>
      <ul>
        <!-- your buttons -->
      </ul>
      <ul>
        <h1><font-awesome-icon :icon="['far', 'shoe-prints']" /></h1>
        <li class="var1">
          <button id="btn1" type="button" class="btn btn-info neon1">
            Number of Steps
          </button>
          <div
            class="button-circle1"
            :style="{ width: circleSize, height: circleSize }"
          >
            <span class="icon"><i class="bi bi-bar-chart-steps"></i></span>
            <span class="text">{{ stepCount }}</span>
          </div>
        </li>

        <!-- add 2 next to showPopup to change the postion of the popup (showPopup2) -->
        <li class="var2">
          <button id="btn2" type="button" class="btn btn-info neon2">
            Calories Burned
          </button>
          <div
            class="button-circle2"
            :style="{ width: circleSize, height: circleSize }"
          >
            <span class="icon"><i class="bi bi-fire"></i></span>
            <span class="text1">{{ caloriesBurned }}</span>
          </div>
        </li>

        <li class="var3">
          <button id="btn3" type="button" class="btn btn-info neon3">
            Distance Traveled
          </button>
          <div
            class="button-circle3"
            :style="{ width: circleSize, height: circleSize }"
          >
            <span class="icon"><i class="bi bi-speedometer2"></i></span>
            <span class="text">{{ Math.round(distanceWalked) }}</span>
          </div>
        </li>
        <li class="var4">
          <button id="btn4" type="button" class="btn btn-info neon4">
            Heart Rate
          </button>

          <div
            class="button-circle4"
            :style="{ width: circleSize, height: circleSize }"
          >
            <span class="icon"><i class="bi bi-activity"></i></span>
            <span class="text">{{ heartRate }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div class="popup" v-if="popupVisible">
      <div class="popup-content">
        <button class="close" @click="hidePopup">×</button>
        <p>{{ popupTitle }}: {{ popupValue }}</p>
      </div>
    </div>

    <div class="popup3" v-if="popupVisible3">
      <button class="close" @click="hidePopup3">×</button>
      <div>{{ popupValue }}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { loadMapsAPI } from "../google-maps-api.js";

export default defineComponent({
  data() {
    return {
      popupVisible: false,
      popupTitle: "",
      popupValue: null,
      popupX: 0,
      popupY: 0,
      popupVisible3: false,

      currentTime: null,
      unit: "m",

      distanceWalked: 0,
      stepCount: 0,
      caloriesBurned: 0,
      weight: 0,
      heartRate: null,
      panorama: null,
      previousPosition: null,
      currentPosition: null,
    };
  },

  //rami

  computed: {
    circleSize() {
      return this.steps > 99
        ? `${this.steps.toString().length * 10}px`
        : "30px";
    },
  },

  methods: {
    showPopup(title, value, x, y) {
      this.popupTitle = title;
      this.popupValue = value;
      this.popupX = x;
      this.popupY = y;
      this.popupVisible = true;
    },
    showTimePopup() {
      fetch("http://worldtimeapi.org/api/ip")
        .then((response) => response.json())
        .then((data) => {
          const time = data.datetime;
          const date = new Date(time);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();
          this.popupValue = `Current time: ${hours}:${minutes}:${seconds}`;
          this.popupVisible = true;
          this.popupTitle = " ";
        })
        .catch((error) => console.error(error));
    },
    hidePopup() {
      this.popupVisible = false;
    },

    hidePopup3() {
      this.popupVisible = false;
    },
    readHeartRateFile(filePath) {
      fetch(filePath)
        .then((response) => response.text())
        .then((data) => (this.heartRate = data))
        .catch((error) => console.error(error));
    },
    readWeightFile(filePath) {
      fetch(filePath)
        .then((response) => response.text())
        .then((data) => (this.weight = data))
        .catch((error) => console.error(error));
    },

    //SUDEMELİSA

    updateStepCount() {
      const stepDistance = 0.762; // Average step distance in meters
      this.stepCount = Math.round(this.distanceWalked / stepDistance);
    },

    updatePosition() {
      const position = this.panorama.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      this.previousPosition = this.currentPosition;
      this.currentPosition = { lat, lng };
      this.updateCaloriesBurned();
    },
    updateDistance() {
      if (this.previousPosition && this.currentPosition) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(this.previousPosition),
          new google.maps.LatLng(this.currentPosition)
        );
        this.distanceWalked += distance;
      }
      this.updateCaloriesBurned();
    },

    //GOOGLEFITTEN KILO ÇEKİLECEK
    updateCaloriesBurned() {
      // Assuming weight is in kg
      const weightFile = "src/data/weight.txt";
      setInterval(() => {
        this.readWeightFile(weightFile);
      });
      const distance = this.distanceWalked / 1000; // Convert meters to kilometers
      const speed = 5; // Change this to the person's walking speed in km/h
      const met = 3.5; // MET value for walking at a moderate pace

      const calories = Math.round(this.weight * distance * met);
      this.caloriesBurned = calories;
    },

    //SUDEMELİSA
  },

  async mounted() {
    const filePath = "src/miband-heartrate-2.1.0/heartrate.txt";
    let startLocation = null;
    let endLocation = null;
    document.addEventListener("keydown", this.handleKeyDown);

    // Load Maps API and set up Street View panorama
    await loadMapsAPI().then((maps) => {
      // Ask user for starting location
      const userLocation = prompt("Where do you want to start at?");
      let initialPosition = { lat: 39.9334, lng: 32.8597 }; // Default to Ankara coordinates

      // Use Geocoding service to convert user input into lat/lng
      const geocoder = new maps.Geocoder();
      geocoder.geocode({ address: userLocation }, (results, status) => {
        if (status === "OK") {
          initialPosition = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }

        //Rami

        const map = new maps.Map(this.$el.querySelector("#map"), {
          center: initialPosition,
          zoom: 14,
        });

        this.panorama = new maps.StreetViewPanorama(
          this.$el.querySelector("#pano"),
          {
            position: initialPosition,
            pov: {
              heading: 24,
              pitch: -20,
            },
          }
        );

        map.setStreetView(this.panorama);
        this.panorama.controls[maps.ControlPosition.BOTTOM_CENTER].push(
          this.$el.querySelector(".interface")
        );

        const marker = new maps.Marker({
          position: initialPosition,
          map: map,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: "red",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 1,
            scale: 10,
          },
          zIndex: 999,
          draggable: true,
        });

        marker.addListener("dragend", () => {
          startLocation = marker.getPosition();
          this.updateDistance();
          this.updatePosition();
          this.updateStepCount();
        });

        map.addListener("click", (event) => {
          if (!endLocation) {
            const pin = new maps.Marker({
              position: event.latLng,
              map: map,
            });
            endLocation = event.latLng;
            this.updateDistance();
            this.updatePosition();
            this.updateStepCount();
          }
        });

        const trail = new maps.Polyline({
          path: [initialPosition],
          strokeColor: "red",
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map: map,
        });

        this.panorama.addListener("position_changed", () => {
          const position = this.panorama.getPosition();
          marker.setPosition(position);

          const trailPath = trail.getPath();
          trailPath.push(position);
          trail.setPath(trailPath);

          this.updateDistance();
          this.updatePosition();
          this.updateStepCount();
        });

        setInterval(() => {
          this.readHeartRateFile(filePath);
        }, 1000);

        // Define a custom map style with emphasis on roads and labels
        const customStyle = [
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#663300" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#333333" }, { visibility: "on" }],
          },
        ];

        // Add mini-map
        this.panorama.controls[maps.ControlPosition.TOP_RIGHT].push(
          this.$el.querySelector(".mini-map")
        );

        const miniMap = new maps.Map(this.$el.querySelector(".mini-map"), {
          center: initialPosition,
          zoom: 19,
          disableDefaultUI: true,
          draggable: false,
          clickableIcons: false,
          mapTypeId: "custom_style", // Set the map type ID to the custom style
        });

        const miniMarker = new maps.Marker({
          position: initialPosition,
          map: miniMap,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/micons/red-dot.png",
            scaledSize: new maps.Size(30, 30),
            labelOrigin: new maps.Point(15, -10),
          },
        });

        // Apply the custom map style
        miniMap.mapTypes.set(
          "custom_style",
          new maps.StyledMapType(customStyle)
        );

        this.panorama.addListener("pov_changed", () => {
          const pov = this.panorama.getPov();
          miniMap.setHeading(pov.heading);
          miniMap.setTilt(pov.pitch);
        });

        this.panorama.addListener("position_changed", () => {
          const position = this.panorama.getPosition();
          miniMarker.setPosition(position);
          miniMap.setCenter(position);
        });

        // Scroll to panorama view
        Vue.nextTick(() => {
          const panoElement = document.getElementById("pano");
          window.scrollTo({
            top: panoElement.offsetTop,
            behavior: "smooth",
          });
        });
      });
    });
  },
});
</script>

<style scoped>
.mini-map {
  height: 200px;
  width: 200px;
  border: 2px solid #333;
}
#map {
  height: 300px;
}
#pano {
  height: 720px;
}
.interface {
  position: flex;
  margin: 100px 10px -8px -100px;
  z-index: 9999;
  padding: 190px;
  background-color: white;
  list-style-type: none;
  overflow: hidden; /* hide any content that goes beyond the tablet borders */
  transform: perspective(420px) rotateX(30deg) translateZ(80px);
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 50%;
  max-height: 50%;
  background-color: rgba(0, 0, 0, 0);
}

.interface button {
  cursor: pointer;
  font-weight: bold;
  color: white;
}

.popup-content {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  padding: 30px;
  text-align: center;
}

.popup-content {
  background-color: #0077be;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  padding: 30px;
  text-align: center;
}

.close {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.close:hover {
  color: #000;
  transform: scale(1.2);
}

.popup3 {
  position: fixed;
  z-index: 9999;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #0077be;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  padding: 30px;
  text-align: center;
}
.popup3 .close {
  top: 5px;
  right: 5px;
  font-size: 18px;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.popup-close {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  padding: 10px;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: none;
}

ul {
  list-style-type: none;
  float: left;
}
.var1 {
  margin-right: 35px;
  position: relative;
  left: -95px;
  top: 12px;
  font-weight: 500;
}
.var2 {
  position: relative;
  right: -55px;
  top: -50px;
  font-weight: 500;
}
.var3 {
  position: relative;
  left: -95px;
  bottom: 26.5px;
  font-weight: 500;
}
.var4 {
  position: relative;
  right: -63px;
  bottom: 90px;
}
.weather {
  position: relative;
  left: -150px;
  bottom: 0px;
}

.button-circle1 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 42px;
  bottom: -50px;
  left: 75%;
  transform: translateX(-80%);
  background-color: #8d8d8d;
  box-shadow: 0 2px 3px #fff;
  width: 80px;
  height: 40px;
  border: 3px solid;
  border-color: white;
  transition: border-color 0.2s ease-in-out;
  border-radius: 10%;
  font-size: 15px;
  font-weight: bold;
  font-family: "DM Sans", sans-serif;
  animation: neon-animation 1.2s infinite alternate;
}

.button-circle1 .icon {
  margin-right: 5px;
}

.button-circle1 .text {
  display: inline-block;
}
.button-circle2 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 42px;
  bottom: -55px;
  left: 45%;
  transform: translateX(-80%);
  background-color: #8d8d8d;
  box-shadow: 0 2px 3px #fff;
  width: 80px;
  height: 40px;
  border: 3px solid;
  border-color: white;
  transition: border-color 0.2s ease-in-out;
  border-radius: 10%;
  font-size: 15px;
  font-weight: bold;
  font-family: "DM Sans", sans-serif;
  animation: neon-animation 1.2s infinite alternate;
}

.button-circle2 .icon {
  margin-right: 5px;
}

.button-circle2 .text {
  display: inline-block;
  animation: neon-animation 1.2s infinite alternate;
}
.button-circle3 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 42px;
  bottom: -50px;
  left: 56%;
  transform: translateX(-80%);
  background-color: #8d8d8d;
  box-shadow: 0 2px 3px #fff;
  width: 80px;
  height: 40px;
  border: 3px solid;
  border-color: white;
  transition: border-color 0.2s ease-in-out;
  border-radius: 10%;
  font-size: 15px;
  font-weight: bold;
  font-family: "DM Sans", sans-serif;
  animation: neon-animation 1.2s infinite alternate;
}

.button-circle3 .icon {
  margin-right: 5px;
}

.button-circle3 .text {
  display: inline-block;
}
.button-circle4 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 42px;
  bottom: -55px;
  left: 36%;
  transform: translateX(-80%);
  background-color: #8d8d8d;
  box-shadow: 0 2px 3px #fff;
  width: 80px;
  height: 40px;
  border: 3px solid;
  border-color: white;
  transition: border-color 0.2s ease-in-out;
  border-radius: 10%;
  font-size: 15px;
  font-weight: bold;
  font-family: "DM Sans", sans-serif;
  animation: neon-animation 1.2s infinite alternate;
}

.button-circle4 .icon {
  margin-right: 5px;
}

.button-circle4 .text {
  display: inline-block;
}

.btn-success,
.btn-info,
.btn-warning,
.btn-danger {
  transition: all 0.2s ease-in-out;
}

.btn-success:hover,
.btn-info:hover,
.btn-warning:hover,
.btn-danger:hover {
  transform: scale(1.15);
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
}

.btn-info:active {
  transform: scale(0.9);
  box-shadow: none;
}

.left {
  left: -10px; /* adjust as needed */
}

.right {
  right: -10px; /* adjust as needed */
}

.bike-arms-container {
  position: absolute;
  top: 80%;
  left: 25%;
  width: 50%;
  height: auto;
}
.bike-arm {
  position: absolute;
  bottom: 45px;
  left: 62%;
  transform: translateX(-90%);
  width: 100px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: contain;
  animation: bikeArm 2.5s infinite alternate;
}

.bike-arms-container img {
  display: block;
  width: 507px;
  height: auto;
  margin: -100px -80px;
}
#btnW {
  width: 45px;
  height: 25px;
  font-size: 8px;
  position: flex;
  top: 10px; /* Adjust the top position according to your needs */
  left: -80%; /* Center the button horizontally */
  transform: translateX(-50%); /* Center the button horizontally */
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.bike-image {
  position: relative;
  top: 200px;
  left: -45px;
  width: 100%;
}
.tablet-image {
  position: absolute;
  max-width: 105%;
  top: -100px;
  left: 58px;
  height: auto;
  overflow: visible;
}
.watch-image {
  position: relative;
  left: 258px;
  top: 88px;
  max-width: 20%;
  display: block;
  width: 550px;
  height: auto;
  margin: -100px -80px;
  border-radius: 35%;
}
.neon1 {
  position: relative;
  bottom: -40px;
  background-color: #2682b0; /* Set the background color to white */
  color: #00014a; /* Set the text color to neon green */
  border: none; /* Remove the border */
  padding: 5px 15px; /* Adjust the padding as needed */
  font-size: 12px; /* Adjust the font size as needed */
  font-weight: bold; /* Apply bold font weight */
  border-radius: 50px; /* Make the button round */
  box-shadow: 0 0 5px #00014a, 0 0 20px #00014a, 0 0 30px #109dc8; /* Apply the neon glow effect */
}
.neon2 {
  position: relative;
  bottom: -45px;
  right: 15px;
  background-color: #2682b0; /* Set the background color to white */
  color: #00014a; /* Set the text color to neon green */
  border: none; /* Remove the border */
  padding: 5px 15px; /* Adjust the padding as needed */
  font-size: 12px; /* Adjust the font size as needed */
  font-weight: bold; /* Apply bold font weight */
  border-radius: 50px; /* Make the button round */
  box-shadow: 0 0 5px #00014a, 0 0 20px #00014a, 0 0 30px #109dc8; /* Apply the neon glow effect */
}
.neon3 {
  position: relative;
  bottom: -40px;
  background-color: #2682b0; /* Set the background color to white */
  color: #00014a; /* Set the text color to neon green */
  border: none; /* Remove the border */
  padding: 5px 10px; /* Adjust the padding as needed */
  font-size: 12px; /* Adjust the font size as needed */
  font-weight: bold; /* Apply bold font weight */
  border-radius: 50px; /* Make the button round */
  box-shadow: 0 0 5px #00014a, 0 0 20px #00014a, 0 0 30px #109dc8; /* Apply the neon glow effect */
}
.neon4 {
  position: relative;
  bottom: -45px;
  right: 15px;
  background-color: #2682b0; /* Set the background color to white */
  color: #00014a; /* Set the text color to neon green */
  border: none; /* Remove the border */
  padding: 5px 15px; /* Adjust the padding as needed */
  font-size: 12px; /* Adjust the font size as needed */
  font-weight: bold; /* Apply bold font weight */
  border-radius: 50px; /* Make the button round */
  box-shadow: 0 0 5px #00014a, 0 0 20px #00014a, 0 0 30px #109dc8; /* Apply the neon glow effect */
}
.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns with equal width */
  grid-gap: 20px; /* Spacing between buttons */
}

.button-grid button {
  /* Styles for the button */
  background-color: #fff;
  color: #00ff00;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 50px;
  text-transform: uppercase;
  box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
  animation: neon-animation 1s infinite alternate;
}

.button-grid .button-circle {
  /* Styles for the circle div */
  background-color: #fff;
  color: #00ff00;
  text-align: center;
  padding: 20px;
  font-size: 16px;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
  animation: neon-animation 1s infinite alternate;
}

.buttons_container {
  position: relative;
  top: 10px;
  right: 0px;
  width: 90%;
  height: 90%;
}

@keyframes neon-animation {
  0% {
    border-color: white;
    box-shadow: 0 2px px rgba(0, 0, 0, 0.4);
  }
  50% {
    border-color: #020070; /* Replace with desired neon color */
    box-shadow: 0 0 1px #524396, 0 0 10px #422d9f, 0 0 5px #412383; /* Customize the glow effect */
  }
  100% {
    border-color: rgb(1, 12, 101);
    box-shadow: 0 1px px rgba(0, 0, 0, 0.1);
  }
}
</style>
