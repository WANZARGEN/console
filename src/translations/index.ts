/* eslint-disable import/no-unresolved */
import Vue from 'vue';
import VueI18n, { LocaleMessageObject } from 'vue-i18n';

// @ts-ignore
import ko from '@lang/ko.json';
// @ts-ignore
import en from '@lang/en.json';
// @ts-ignore
import ja from '@lang/ja.json';

import { messages } from '@spaceone/design-system';

Vue.use(VueI18n);

// simple recursive remove keys with empty value
const removeEmpty = (obj: object | any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: {
        en: removeEmpty({ ...en, ...messages.en }),
        ko: removeEmpty({ ...ko, ...messages.ko }),
        jp: removeEmpty({ ...ja, ...messages.jp }),
    },
    silentFallbackWarn: true,
});
