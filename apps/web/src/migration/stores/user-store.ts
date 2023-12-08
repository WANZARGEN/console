import { createStore } from 'zustand';

import { store } from '@/store';

const userStore = createStore(() => ({
    language: store.state.user.language,
}));

const { getState, setState, subscribe } = userStore;
subscribe((state) => {
    console.log('zustand userStore > language: ', state.language);
    if (state.language !== store.state.user.language) {
        store.dispatch('user/setLanguage', state.language);
    }
});

store.watch((state) => state.user.language, (language) => {
    console.log('vuex store > language: ', language);
    if (language !== getState().language) {
        setState({ language });
    }
});

export default userStore;
