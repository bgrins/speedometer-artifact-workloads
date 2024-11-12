window.onmessage = async function(event) {
  console.log("message posted", event);
  if (event.data.type === 'metadata') {
    window.parent?.postMessage({ type: 'tests', tests: window.TESTS?.map(test => test.name) }, '*');
  }
  if (event.data.type === 'run') {
    console.log("Request to run");
    window.parent?.postMessage({ type: 'tests', tests: window.TESTS?.map(test => test.name) }, '*');

    if (!window.TESTS) {
      console.error('No tests found on ' + window.location.href);
    } else {
      for (const test of window.TESTS) {
        console.log(`Running test ${test.name}`, test);
        try {
          test.test();
        } catch(e) {
          console.error('Error running test', e);
        }
        console.log(`Finished test ${test.name}`);
        window.postMessage({ type: 'test', name: test.name }, '*');
      }
    }

    window.parent?.postMessage({ type: 'done' }, '*');
  }
};
document.addEventListener('DOMContentLoaded', () => {
  console.log(window.TESTS);
  console.log("TESTS:\n  " + window.TESTS?.map(test => test.name).join('\n  '));
});
