
document.addEventListener('DOMContentLoaded', () => {
  console.log(window.TESTS);
  console.log("TESTS:\n  " + window.TESTS?.map(test => test.name).join('\n  '));
});
