import { RouterOptions } from 'vue-router';

const SpotAutomationMainPage = () => import(/* webpackChunkName: "SpotAutomationMainPage" */ '@/views/automation/spot-automation/pages/SpotAutomationMainPage.vue');
const SpotDashboardPage = () => import(/* webpackChunkName: "SpotDashboardPage" */ '@/views/automation/spot-automation/pages/SpotDashboardPage.vue');
const SpotGroupListPage = () => import(/* webpackChunkName: "SpotGroupPage" */ '@/views/automation/spot-automation/pages/SpotGroupListPage.vue');
const SpotGroupDetailPage = () => import(/* webpackChunkName: "SpotGroupDetailPage" */ '@/views/automation/spot-automation/pages/SpotGroupDetailPage.vue');
const AddSpotGroupPage = () => import(/* webpackChunkName: "AddSpotGroupPage" */ '@/views/automation/spot-automation/pages/AddSpotGroupPage.vue');


const SPOT_AUTOMATION_ROUTE = Object.freeze({
    _NAME: 'spotAutomation',
    DASHBOARD: { _NAME: 'spotDashboard' },
    SPOT_GROUP: {
        _NAME: 'spotGroup',
        ADD: { _NAME: 'addSpotGroup' },
        DETAIL: { _NAME: 'spotGroupDetail' },
    },
});

export const routerOptions = {
    mode: 'history',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/',
            name: SPOT_AUTOMATION_ROUTE._NAME,
            redirect: 'spot-dashboard',
            component: SpotAutomationMainPage,
            children: [
                {
                    path: 'spot-dashboard',
                    name: SPOT_AUTOMATION_ROUTE.DASHBOARD._NAME,
                    component: SpotDashboardPage,
                },
                {
                    path: 'spot-group',
                    name: SPOT_AUTOMATION_ROUTE.SPOT_GROUP._NAME,
                    component: SpotGroupListPage,
                },
            ],
        },
        {
            path: 'spot-group/add/:projectId?',
            name: SPOT_AUTOMATION_ROUTE.SPOT_GROUP.ADD._NAME,
            component: AddSpotGroupPage,
        },
        {
            path: 'spot-group/:id',
            name: SPOT_AUTOMATION_ROUTE.SPOT_GROUP.DETAIL._NAME,
            props: true,
            component: SpotGroupDetailPage,
        },
    ],
    duplicateNavigationPolicy: 'reload',
} as RouterOptions;
