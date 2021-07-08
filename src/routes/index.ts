import Vue from 'vue';
import VueRouter from 'vue-router';
import { routerOptions } from '@/routes/config';


Vue.use(VueRouter);


const router = new VueRouter(routerOptions);

router.onError((error) => {
    if (/loading chunk \d* failed./i.test(error.message)) {
        window.location.reload();
    }
});


export default router;
