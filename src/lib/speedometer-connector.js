
import { BenchmarkStep, BenchmarkSuite } from "Speedometer/resources/shared/benchmark.mjs";
import * as helpers from "Speedometer/resources/shared/helpers.mjs";
import { BenchmarkConnector } from "Speedometer/resources/shared/workload-testing-utils.mjs";

const suites = {};
for (const test of (window.TESTS || [])) {
  suites[test.name] = new BenchmarkSuite(test.name, [
    new BenchmarkStep(test.name, () => {
      test.test(helpers)
    }),
  ]);
}

// https://speedometer-artifact-workloads.pages.dev/workloads/edu-1/ should be edu-1
const name = window.location.pathname.replace(/\/$/, "").split("/").pop();

document.addEventListener('DOMContentLoaded', () => {
  console.log(suites, name);
  const benchmarkConnector = new BenchmarkConnector(suites, name, 1);
  benchmarkConnector.connect();
});