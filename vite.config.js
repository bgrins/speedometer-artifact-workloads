import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

function createHTMLFilesForArtifacts() {
  const artifactsDir = resolve(__dirname, "src/artifacts");
  const artifacts = fs.readdirSync(artifactsDir);

  // Create a new HTML file for each component based on the template.
  // This way, the author only needs to add a single file in src/artifacts
  for (const component of artifacts) {
    if (
      path.extname(component) === ".tsx" ||
      path.extname(component) === ".jsx"
    ) {
      const componentName = component.replace(".tsx", "").replace(".jsx", "");
      const template = fs.readFileSync(
        resolve(__dirname, "workload-template/template.html"),
        "utf-8"
      );
      const newHTML = template.replace(
        "../src/artifacts/template",
        `../src/artifacts/${componentName}`
      );
      fs.writeFileSync(
        resolve(__dirname, `workloads/${componentName}.html`),
        newHTML
      );
    }
  }

  // remove anything left in workloads/ that isn't in artifacts
  const pagesDir = resolve(__dirname, "workloads");
  const pages = fs.readdirSync(pagesDir);
  for (const page of pages) {
    if (path.extname(page) === ".html") {
      const pageName = page.replace(".html", "");
      if (
        !artifacts.includes(`${pageName}.tsx`) &&
        !artifacts.includes(`${pageName}.jsx`)
      ) {
        fs.unlinkSync(resolve(__dirname, `workloads/${page}`));
      }
    }
  }

  const staticPages = fs.readdirSync(resolve(__dirname, "public/workloads"));
  let links = [];
  const remoteWorkloads = [];

  for (const component of artifacts) {
    if (
      path.extname(component) === ".tsx" ||
      path.extname(component) === ".jsx"
    ) {
      const componentName = path.basename(component, path.extname(component));
      links.push([componentName, `${componentName}/`]);
    }
  }

  for (const page of staticPages) {
    if (path.extname(page) === ".html") {
      const pageName = page.replace(".html", "");
      links.push([pageName, page]);
    }
  }

	links = links.sort();

  for (const link of links) {
    remoteWorkloads.push({
      name: link[0],
      url: `https://speedometer-artifact-workloads.pages.dev/workloads/${link[1]}/`,
    });
  }
  fs.writeFileSync(
    resolve(__dirname, "public/remote-workloads.json"),
    JSON.stringify(remoteWorkloads, null, 2)
  );

  // Update index.html with a listing
  const html = fs.readFileSync(resolve(__dirname, "index.html"), "utf-8");
  const ulStart = html.indexOf("<!-- workload listing -->");
  const ulEnd = html.indexOf("<!-- end workload listing -->");
  const ul = html.substring(
    ulStart + "<!-- workload listing -->".length,
    ulEnd
  );
  let newUl = "\n<ul>\n";
  for (const link of links) {
    newUl += `<li><a href="workloads/${link[1]}">${link[0]}</a></li>
`;
  }

  newUl += "\n</ul>\n";
  const newHTML = html.replace(ul, newUl);
  fs.writeFileSync(resolve(__dirname, "index.html"), newHTML);
}

createHTMLFilesForArtifacts();

function getHtmlInputs() {
  const pagesDir = resolve(__dirname, "workloads");
  const pages = fs.readdirSync(pagesDir);

  return pages.reduce((inputs, page) => {
    if (path.extname(page) === ".html") {
      const pageName = page.replace(".html", "");
      inputs[pageName] = resolve(pagesDir, page);
    }
    return inputs;
  }, {});
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-transform",
      enforce: "post",
      generateBundle(options, bundle) {
        // Rewrite workload/data-dashboard.html to dist/workload/data-dashboard/index.html
        const htmlFiles = Object.keys(bundle).filter((name) =>
          name.endsWith(".html")
        );
        htmlFiles.forEach((fileName) => {
          const chunk = bundle[fileName];
          const baseName = fileName.replace(".html", "");

          if (baseName === "index") {
            // Keep index.html at the root
            chunk.fileName = "index.html";
          } else {
            // Move other HTML files to their own directories
            chunk.fileName = `${baseName}/index.html`;
          }
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
      },
      output: {
        assetFileNames: "[name]/[name].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
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
