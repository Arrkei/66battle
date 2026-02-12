<template>
  <div id="app">
    <img id="logo" alt="App logo" src="./assets/logo.png">
    <Main66/>
   </div>
</template>

<script>
import Main66 from './components/Main66.vue'

export default {
  name: 'App',
  components: {
    Main66
  }
}
</script>

<style>
html, body {
  margin: 0;
  overflow: hidden;
  touch-action: manipulation;
}


#app {
  position: absolute;
  top: 0px;
  overscroll-behavior: none; /* prevent nasty browser effect on mobile, page does not move */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
   font-size: 1.1em;
  text-align: center;
  margin: auto;
  width: 100%;
  height: 100%;
  background:#070707;
  color: #f1da0a;
  margin-top: 0px; 
} 

#logo {
  position: absolute;
  top: 15px;
  margin-left: -160px;
  display: none;
}

.buttonXX {
  color: goldenrod;
  background: transparent;
  padding: 5px;
  cursor: pointer;
  font-size: 1.1em;
  padding: 5px;
  outline: 3px solid #daa520;
}

.buttonXX:hover {
  color: yellow;
  background: darkgrey;
}
</style>
