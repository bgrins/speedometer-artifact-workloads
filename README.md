# Speedometer Artifact Workloads

This is an experiment in generating code for remote [Speedometer](https://github.com/WebKit/Speedometer/) workloads.

## Building

```
npm install
npm run dev
npm run build
```

## Acknowledgements

This is essentially a fork of [claude-artifact-runner](https://github.com/claudio-silva/claude-artifact-runner), via `wget https://github.com/claudio-silva/claude-artifact-runner/archive/refs/heads/main.zip && unzip main.zip && rm main.zip`, with some extra machinery to make it easier to collect multiple artifacts, and to make it Speedometer-aware.
