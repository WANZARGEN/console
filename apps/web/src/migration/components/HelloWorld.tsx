import React, { useRef, useEffect } from 'react';
import { useStore } from 'zustand';

import userStore from '@/migration/stores/user-store';


type HelloWorldProps = {
 title: string;
 respondFunction: () => void;
};

// eslint-disable-next-line react/function-component-definition
const HelloWorld: React.FC<HelloWorldProps> = ({ title, respondFunction }) => {
    // const useBoundStore = (selector) => useStore(userStore, selector)
    // const language = useBoundStore((state) => state.language);

    // const languageRef = useRef(userStore.getState().language);
    // useEffect(() => userStore.subscribe(
    //     (state) => {
    //         console.debug('update use effect!', state.language);
    //         languageRef.current = state.language;
    //     },
    // ), []);
    // setInterval(() => {
    //     console.debug('interval', languageRef.current);
    //     if (languageRef.current === 'en') languageRef.current = 'ko';
    //     else languageRef.current = 'en';
    // }, 3000);

    const count = useRef(0);
    setInterval(() => {
        count.current += 1;
        console.debug('interval', count.current, userStore.getState().language);
    }, 7000);
    return (
      <div>
          <h2>Store Test!</h2>
          {title}
          {' '}
          {count.current}
          {userStore.getState().language}
          <br />
          <button onClick={() => respondFunction()}>Change Language</button>
        </div>
    );
};

export default HelloWorld;
