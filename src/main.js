import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App';
import router from '@/routes/index';
import store from './store';
import directive from '@/directives';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import CountryFlag from 'vue-country-flag';
import { i18n } from '@/setup/i18n';
import { Mixin } from '@/setup/global_util';
import VueLodash from 'vue-lodash';

Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(CountryFlag);
Vue.use(Notifications, { velocity });
Vue.use(VueLodash, { name: 'lodash' });

Vue.prototype.$velocity = velocity;

/*****************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 *****************************************************************/
Vue.prototype.$bus = new Vue({});
directive(Vue);

new Vue({
    el: '#app',
    router,
    i18n,
    store,
    components: {
        App
    },
    template: '<App/>'
});