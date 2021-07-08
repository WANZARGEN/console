import { RouterOptions } from 'vue-router';

const PowerSchedulerLandingPage = () => import(/* webpackChunkName: "PowerSchedulerLanding" */ '@/views/automation/power-scheduler/pages/PowerSchedulerLandingPage.vue');
const PowerSchedulerPage = () => import(/* webpackChunkName: "PowerSchedulerPage" */ '@/views/automation/power-scheduler/pages/PowerSchedulerPage.vue');
const ResourceGroupPage = () => import(/* webpackChunkName: "ResourceGroup" */ '@/views/automation/power-scheduler/pages/ResourceGroupPage.vue');

const POWER_SCHEDULER_ROUTE = Object.freeze({
    _NAME: 'powerSchedulerLanding',
    ADD: { _NAME: 'powerScheduler' },
    DETAIL: { _NAME: 'powerSchedulerDetail' },
    RESOURCE_GROUP: { _NAME: 'powerSchedulerResourceGroup' },
});

export const routerOptions = {
    mode: 'history',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/',
            name: POWER_SCHEDULER_ROUTE._NAME,
            component: PowerSchedulerLandingPage,
        },
        {
            path: ':projectId',
            name: POWER_SCHEDULER_ROUTE.ADD._NAME,
            props: true,
            component: PowerSchedulerPage,
        },
        {
            path: ':projectId/:scheduleId',
            name: POWER_SCHEDULER_ROUTE.DETAIL._NAME,
            props: true,
            component: PowerSchedulerPage,
            children: [
                {
                    path: ':resourceGroupId',
                    name: POWER_SCHEDULER_ROUTE.RESOURCE_GROUP._NAME,
                    props: true,
                    component: ResourceGroupPage,
                },
            ],
        },
    ],
    duplicateNavigationPolicy: 'reload',
} as RouterOptions;
