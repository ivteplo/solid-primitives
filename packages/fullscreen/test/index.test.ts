import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { createRoot, createEffect, createSignal } from 'solid-js';

import { createFullscreen } from '../src';

const fsTest = suite('createFullscreen', { ref: document.createElement('div') });

// mock fullscreen API
fsTest.before(() => {
  let currentFullscreenElement: HTMLElement | undefined;

  HTMLElement.prototype.requestFullscreen = function (
    this: HTMLElement,
    options?: FullscreenOptions
  ) {
    (window as any)._fullScreenOptions = options;
    currentFullscreenElement = this;
    document.dispatchEvent(new Event("fullscreenchange"));
    return Promise.resolve();
  };
  
  Object.defineProperty(document, "fullscreenElement", {
    value: currentFullscreenElement,
    writable: false
  });
  
  Object.defineProperty(document, "exitFullscreen", {
    value: () => {
      currentFullscreenElement = undefined;
    },
    writable: false
  });  
});

fsTest('will call the fullscreen method', async ({ ref }) => {  
  const expected = [false, true];
  const actual: boolean[] = [];
  
  await new Promise<void>(resolve => createRoot(dispose => {
    const active = createFullscreen(ref);

    createEffect(() => {
      actual.push(active());
      if (actual.length === expected.length) {      
        dispose()
        resolve();        
      }
    });
  }));

  assert.equal(actual, expected);
});

fsTest("will exit fullscreen on reactive change", async ({ ref }) => {
  const expected = [false, true, false];
  const actual: boolean[] = [];

  await new Promise<void>(resolve => createRoot(dispose => {
    const [fs, setFs] = createSignal(true);
    const active = createFullscreen(ref, fs);

    createEffect(() => {
      actual.push(active());
      if (actual.length === 1) {
        setTimeout(() => setFs(false), 50);
      }
      if (actual.length === expected.length) {      
        dispose()
        resolve();        
      }
    });
  }));

  assert.equal(actual, expected);
});

fsTest('will open fullscreen with options', async ({ ref }) => {  
  const options: FullscreenOptions = { navigationUI: "hide" };
  const expected = [false, true];
  const actual: boolean[] = [];
  
  await new Promise<void>(resolve => createRoot(dispose => {
    const active = createFullscreen(ref, undefined, options);

    createEffect(() => {
      actual.push(active());
      if (actual.length === expected.length) {
        dispose()
        resolve();        
      }
    });
  }));

  assert.equal(actual, expected);
  assert.equal((window as any)._fullScreenOptions, options, 'options are not used for fullscreen');
});

fsTest.run();
