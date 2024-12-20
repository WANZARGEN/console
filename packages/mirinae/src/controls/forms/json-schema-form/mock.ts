import { faker } from '@faker-js/faker';
import Fuse from 'fuse.js';
import { range } from 'lodash';

import type { SelectDropdownMenuItem } from '@/controls/dropdown/select-dropdown/type';
import type { ReferenceHandler } from '@/controls/forms/json-schema-form/type';

export const getDefaultSchema = () => ({
    type: 'object',
    properties: {
        user_name: {
            minLength: 4,
            title: 'Name',
            description: 'Your name',
            type: 'string',
            examples: [
                faker.name.firstName(),
            ],
            default: faker.name.firstName(),
            disabled: true,
        },
        user_nickname: {
            title: 'Nickname',
            description: 'Nick name',
            minLength: 1,
            type: 'string',
            examples: [
                'Genie',
            ],
        },
        user_id: {
            title: 'ID',
            format: 'generate_id',
            markdown: '[How to generate ID?](https://www.google.com)',
        },
        is_that_true: {
            type: 'boolean',
            title: 'Is that true?',
            default: true,
        },
        password: {
            title: 'Password',
            minLength: 8,
            format: 'password',
            default: '12345678',
        },
        country_code: {
            examples: ['82'],
            description: 'Country code to call. Only numbers without special characters. Not mandatory, 82(Korea country code) is default.',
            title: 'Country Code',
            pattern: '^[0-9\\-]{1,5}$',
            minLength: 1,
            type: 'string',
            default: '82',
            enum: ['82', '333', '232'],
        },
        provider: {
            title: 'Provider',
            minLength: 1,
            type: 'string',
            default: 'long',
            enum: ['aws', 'google_cloud', 'azure', 'long'],
            menuItems: [
                { name: 'aws', label: 'AWS' },
                { name: 'google_cloud', label: 'Google Cloud' },
                { name: 'azure', label: 'Azure' },
                { name: 'long', label: 'this is very long long long long long long long long long long provider name' },
            ],
        },
        age: {
            title: 'Age',
            type: 'number',
            examples: ['27'],
        },
        emails: {
            description: 'Email addresses',
            title: 'Email Addresses',
            type: 'array',
            items: {
                type: 'string',
                minLength: 10,
                pattern: '^[\\W]*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4}[\\W]*,{1}[\\W]*)*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4})[\\W]*$',
            },
            examples: [
                'user1@test.com, user2@test.com',
            ],
            default: ['user1@test.com'],
            uniqueItems: true,
        },
        colors: {
            description: 'Favorite Colors',
            title: 'Favorite Colors (non-strict select)',
            type: 'array',
            items: [
                {
                    enum: ['red', 'blue', 'gold', 'purple', 'gray'],
                },
                {
                    type: 'string',
                },
            ],
            default: ['gray', 'blue', 'hello!'],
        },
        foods: {
            description: 'Favorite Foods',
            title: 'Favorite Foods (strict select / multi select)',
            type: 'array',
            items: {
                enum: ['hamburger', 'pizza', 'kimchi', 'bulgogi', 'bibimbob'],
            },
            default: ['bulgogi', 'kimchi', 'hello!!!'],
        },
        food: {
            description: 'Favorite Food',
            title: 'Favorite Food (strict select / single select)',
            type: 'array',
            items: {
                enum: ['hamburger', 'pizza', 'kimchi', 'bulgogi', 'bibimbob'],
            },
            default: ['bulgogi'],
            maxItems: 1,
        },
        homepage: {
            type: 'string',
            minLength: 4,
            examples: [
                'https://myjira.atlassian.net',
            ],
            title: 'Homepage',
            description: 'Homepage URL',
        },
        phone: {
            pattern: '^(01([0|1|6|7|8|9]?)\\d{7,8}(, |,|$))*',
            description: 'The phone number to receive alerts. Must insert the cell phone numbers format without special characters.',
            title: 'Phone',
            examples: [
                '0104445566, 01077778888',
            ],
            type: 'string',
            minLength: 10,
        },
        additional: {
            title: 'Additional Information',
            type: 'object',
            json: true,
            properties: {
                gender: {
                    type: 'string',
                },
            },
            required: ['gender'],
        },
        friends: {
            title: 'Friends (use referenceHandler)',
            type: 'array',
            reference: { resource_type: 'friend', reference_key: 'friend' },
            items: {},
        },
        pem_key: {
            title: 'PEM Key',
            type: 'string',
            format: 'pem_key',
            default: `-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQDCFENGw33yGihy92pDjZQhl0C36rPJj+CvfSC8+q28hxA161QF
NUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6Z4UMR7EOcpfdUE9Hf3m/hs+F
UR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJwoYi+1hqp1fIekaxsyQIDAQAB
AoGBAJR8ZkCUvx5kzv+utdl7T5MnordT1TvoXXJGXK7ZZ+UuvMNUCdN2QPc4sBiA
QWvLw1cSKt5DsKZ8UETpYPy8pPYnnDEz2dDYiaew9+xEpubyeW2oH4Zx71wqBtOK
kqwrXa/pzsdfucRRjk6vE6YY7EBBs/g7uanVpdibOVAEsqH1AkEA7DkjVH28WDUg
f1nqvfn6Kj6CT7nIcE3jGJsZZ7zlZmBmHFDONfLUrXR/Zm3pR5m0tCmBqa5RK95u
412jt1dPIwJBANJT3v8pnkth48bQo/fKel6eEYyboRtA5/uHuHkZ6FQF7OUkGogc
mSJluOdc5t6hI1VsLn0QZEjQZMEOWr+wKAMCQQCC4kXJEsHAve77oP6HtG/IiEn7
kpyUXRNvFsDE0czpJJBvL/aRFUJxuRK91jhjC68sA7NsKMGg5OXb5I5Jj36xAkEA
gIT7aFPOIFwGgQAQkWNKLvySgKbAZRDeLBacpHMuQdl1DfdntvAyqpAZ0lY0RKmW
G6aFKaqQfOXKCyWoUiVknQJAXsssyFFci/2ueKlIE1QqIiLSZ8V8OlpFLRnb1pzI
7U1yQXnTAEKJM560yDjzUpOs1V3cGcGd365tiSMvxLOvTA==
-----END RSA PRIVATE KEY-----`,
            examples: [
                `-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----`,
            ],
        },
    },
    required: ['user_id', 'password', 'user_name', 'age', 'homepage', 'phone', 'additional', 'emails', 'colors', 'provider', 'friends', 'pem_key'],
    order: ['user_id', 'is_that_true', 'password', 'user_name', 'user_nickname', 'country_code', 'provider', 'age', 'phone', 'homepage', 'additional', 'colors', 'foods', 'food', 'pem_key'],
});

export const getDefaultFormData = () => ({
    user_name: faker.name.firstName(),
    user_nickname: faker.random.word(),
    age: faker.datatype.number(),
    phone: faker.phone.number(),
});


export const getJsonInputSchema = () => {
    const schema: any = getDefaultSchema();
    schema.json = true;
    return schema;
};

const getMenuItem = (): SelectDropdownMenuItem => ({
    name: faker.datatype.uuid(),
    label: `${faker.random.word()}`, // (${faker.random.word()})`,
    type: 'item',
    // disabled: faker.datatype.boolean(),
});
export const getMenuItems = (min = 10, max = 30): SelectDropdownMenuItem[] => range(faker.datatype.number({ min, max })).map(() => getMenuItem());

export const getReferenceHandler = (pageSize = 10): ReferenceHandler => {
    const allItems: SelectDropdownMenuItem[] = getMenuItems(pageSize * 3, pageSize * 4);
    return async (inputText, { pageStart, pageSize: pageLimit }) => {
        const allResults = await new Promise<SelectDropdownMenuItem[]>((resolve) => {
            setTimeout(() => {
                let filtered;
                const trimmed = inputText.trim();
                if (trimmed) {
                    filtered = new Fuse(allItems, {
                        keys: ['label'],
                        distance: 100,
                        threshold: 0.1,
                        ignoreLocation: true,
                    }).search(trimmed);
                } else {
                    filtered = [...allItems];
                }

                resolve(filtered);
            });
        });


        let sliced = allResults;
        if (pageStart !== undefined && pageLimit !== undefined) {
            sliced = allResults.slice(pageStart - 1, pageLimit);
        }
        return {
            results: sliced,
            more: pageLimit ? allResults.length > pageLimit : false,
        };
    };
};
