import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

function injectScriptToHTML(htmlContent, scriptSrc) {
  const script = `<script type="module" src="${scriptSrc}"></script>`;
  return htmlContent.replace("</html>", `${script}\n</html>`);
}

function processVanillaWorkloads(staticPages, links) {
  const vanillaDir = resolve(__dirname, "vanilla-workloads");
  const workloadsDir = resolve(__dirname, "workloads");

  staticPages.forEach(page => {
    if (path.extname(page) !== ".html") return;

    let html = fs.readFileSync(resolve(vanillaDir, page), "utf-8");

    if (!html.includes("runner-adapter.js")) {
      html = injectScriptToHTML(html, "/runner-adapter.js");
    }
    if (!html.includes("speedometer-connector.js")) {
      html = injectScriptToHTML(html, "/src/lib/speedometer-connector.js");
    }

    fs.writeFileSync(resolve(vanillaDir, page), html);
    fs.copyFileSync(resolve(vanillaDir, page), resolve(workloadsDir, page));

    const pageName = page.replace(".html", "");
    links.push([pageName, `${pageName}/`, {
      hasTestsObject: html.includes("window.TESTS"),
    }]);
  });
}

function createHTMLFilesForArtifacts() {
  const artifactsDir = resolve(__dirname, "src/artifacts");
  const artifacts = fs.readdirSync(artifactsDir);
  const links = [];

  // Create HTML files for React components
  artifacts.forEach(component => {
    if (![".tsx", ".jsx"].includes(path.extname(component))) return;

    const componentName = path.basename(component, path.extname(component));
    const template = fs.readFileSync(resolve(__dirname, "workload-template/template.html"), "utf-8");
    const newHTML = template.replace("../src/artifacts/template", `../src/artifacts/${componentName}`);

    fs.writeFileSync(resolve(__dirname, `workloads/${componentName}.html`), newHTML);
    links.push([componentName, `${componentName}/`, {
      hasTestsObject: fs.readFileSync(resolve(__dirname, "src/artifacts/" + component)).includes("window.TESTS"),
    }]);
  });

  // Clean up obsolete workload files
  const workloadsDir = resolve(__dirname, "workloads");
  fs.readdirSync(workloadsDir)
    .filter(page => path.extname(page) === ".html")
    .forEach(page => {
      const pageName = page.replace(".html", "");
      if (!artifacts.some(a => a.startsWith(pageName))) {
        fs.unlinkSync(resolve(workloadsDir, page));
      }
    });

  // Process vanilla workloads
  const staticPages = fs.readdirSync(resolve(__dirname, "vanilla-workloads"));
  processVanillaWorkloads(staticPages, links);

  // Generate remote workloads config
  const remoteWorkloads = links.sort().filter(([name, path, { hasTestsObject }]) => {
    return hasTestsObject;
  }).map(([name, path]) => ({
    name,
    url: `https://speedometer-artifact-workloads.pages.dev/workloads/${path}`,
  }));
  fs.writeFileSync(
    resolve(__dirname, "public/remote-workloads.json"),
    JSON.stringify(remoteWorkloads, null, 2)
  );

  // Update index.html
  const indexPath = resolve(__dirname, "index.html");
  const html = fs.readFileSync(indexPath, "utf-8");
  const listingContent = `\n<ul>\n${links.sort().map(([name, path]) =>
    `<li><a href="workloads/${path}">${name}</a></li>`).join("\n")}\n</ul>\n`;

  const newHTML = html.replace(
    /<!-- workload listing -->.*<!-- end workload listing -->/s,
    `<!-- workload listing -->${listingContent}<!-- end workload listing -->`
  );
  fs.writeFileSync(indexPath, newHTML);
}

function getHtmlInputs() {
  const pagesDir = resolve(__dirname, "workloads");
  return fs.readdirSync(pagesDir)
    .filter(page => path.extname(page) === ".html")
    .reduce((inputs, page) => {
      inputs[page.replace(".html", "")] = resolve(pagesDir, page);
      return inputs;
    }, {});
}

createHTMLFilesForArtifacts();

export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-transform",
      enforce: "post",
      generateBundle(options, bundle) {
        Object.keys(bundle)
          .filter(name => name.endsWith(".html"))
          .forEach(fileName => {
            const chunk = bundle[fileName];
            const baseName = fileName.replace(".html", "");
            chunk.fileName = baseName === "index" ? "index.html" : `${baseName}/index.html`;
          });
      },
    },
  ],
  build: {
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        ...getHtmlInputs(),
        speedometerConnector: fileURLToPath(new URL("./src/lib/speedometer-connector.js", import.meta.url)),
      },
      output: {
        assetFileNames: "[name]/[name].[ext]",
        manualChunks(id) {
          if (id.includes("Speedometer")) return "speedometer";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      src: path.resolve(__dirname, "./src"),
    },
  },
});
