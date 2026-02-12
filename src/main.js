import Vue from 'vue';
//-- import the app
import App from './App.vue';
//-- import and prepare fontawesome
//import '@fortawesome/fontawesome-free/css/all.css';
//import '@fortawesome/fontawesome-free/js/all.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faRocket, faPaperPlane, faComment, faGlobe, faSignOutAlt, faHeart, faInfo, faQuestion, faCog } from '@fortawesome/free-solid-svg-icons';
//import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
//library.add(fas);
library.add(faRocket, faPaperPlane, faComment, faGlobe, faSignOutAlt, faHeart, faInfo, faQuestion, faCog);
Vue.component('font-awesome-icon', FontAwesomeIcon);

//-- import and prepare sweetalert
import VueSweetalert2 from 'vue-sweetalert2';
const options = {
  confirmButtonColor: '#41b882',
  cancelButtonColor: '#ff7674',
  padding: '0.5rem',
};
Vue.use(VueSweetalert2, options);

//-- import and prepare beautiful chat
// import Chat from 'vue-beautiful-chat'
// Vue.use(Chat)

//-- import animate
import 'animate.css';
// https://animate.style/

//-- import pwa support
//import './registerServiceWorker'

Vue.config.productionTip = false

/* eslint-disable no-unused-vars */
const vm = new Vue({
  render: h => h(App),
}).$mount('#app')

