window.onmessage = function(event) {
  console.log("message posted", event);
  if (event.data.type === 'run') {
    console.log("Request to run");

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
      }
    }

    window.parent?.postMessage({ type: 'done' }, '*');
  }
};
document.addEventListener('DOMContentLoaded', () => {
  console.log(window.TESTS);
  console.log("TESTS:\n  " + window.TESTS?.map(test => test.name).join('\n  '));
});
