import JSZip from "jszip";
import { getLatestDependencyVersion, readRemoteFile } from "./utils";
import { Project } from "./types";
import { saveAs } from "file-saver";
import { Dispatch, SetStateAction } from "react";

export const generateZip = async (
  setGenerateText: Dispatch<SetStateAction<string>>,
  setIsValidatingPopupOpen: Dispatch<SetStateAction<boolean>>,
  p: Project
) => {
  const { language, name } = p;

  // validating the name field
  if (name.trim().length < 1) {
    setIsValidatingPopupOpen(true);
    return;
  }

  setGenerateText("Generating...");

  // creating the ZIP and a folder to append the files
  const zip = new JSZip();
  const project = zip.folder(name);

  // public and src folders
  const fpublic = project?.folder("public");
  const fsrc = project?.folder("src");

  // downloading and/or generating the necessary code
  const packageJson = await generatePackageJson(p);
  const gitignore = await readRemoteFile(
    "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-js/.gitignore"
  );
  const indexcss = await readRemoteFile(
    "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-ts/src/index.css"
  );
  const appSrc = await readRemoteFile(
    "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-ts/src/App.tsx"
  );
  const manifest = await readRemoteFile(
    "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-js/public/manifest.json"
  );
  const indexhtml = await readRemoteFile(
    "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-js/public/index.html"
  );

  // creating the files and adding it to the zip
  project?.file("package.json", packageJson);
  project?.file("README.md", `# ${name}`);
  project?.file(".gitignore", gitignore);
  fsrc?.file("index.css", indexcss);
  fsrc?.file(
    language.toLowerCase() === "typescript" ? "Aptsx" : "Apjs",
    appSrc
  );
  fpublic?.file("manifest.json", JSON.stringify(manifest, null, 2));
  fpublic?.file("index.html", indexhtml);
  fpublic?.file("robots.txt", "User-agent: *");

  // if the language is TS
  if (language.toLowerCase() === "typescript") {
    // tsconfig
    const tsconfig = await readRemoteFile(
      "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-ts/tsconfig.json"
    );
    project?.file("tsconfig.json", JSON.stringify(tsconfig, null, 2));

    // index
    const index = await readRemoteFile(
      "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-ts/src/index.tsx"
    );
    fsrc?.file("index.tsx", index);

    // if the language is not TS (so it's JS)
  } else {
    // index
    const index = await readRemoteFile(
      "https://raw.githubusercontent.com/0l1v3rr/react-initializr/master/templates/cra-js/src/index.js"
    );
    fsrc?.file("index.js", index);
  }

  // donwloading the ZIP
  zip
    .generateAsync({ type: "blob" })
    .then((res) => saveAs(res, `${name === "" ? "project" : name}.zip`));

  setGenerateText("Generate ZIP");
};

const generatePackageJson = async (p: Project) => {
  const {
    description,
    version,
    language,
    author,
    gitRepo,
    homepage,
    license,
    name,
    packages,
  } = p;

  let dependencies: any = {};

  // we only append these dependencies if the choosen language is typescript
  if (language.toLowerCase() === "typescript") {
    // adding some libraries manually
    // but firstly, finding out the latest version each of them
    let tsVersion = await getLatestDependencyVersion("typescript");
    let jestVersion = await getLatestDependencyVersion("@types/jest");
    let nodeVersion = await getLatestDependencyVersion("@types/node");
    let reactVersion = await getLatestDependencyVersion("@types/react");
    let reactDomVersion = await getLatestDependencyVersion("@types/react-dom");

    dependencies["typescript"] = `^${tsVersion}`;
    dependencies["@types/jest"] = `^${jestVersion}`;
    dependencies["@types/node"] = `^${nodeVersion}`;
    dependencies["@types/react"] = `^${reactVersion}`;
    dependencies["@types/react-dom"] = `^${reactDomVersion}`;
  }

  // iterating through the packages and adding each of them
  // to the dependencies
  for (let i of packages) {
    dependencies[i.packageName] = `^${i.version}`;
  }

  // package.json object
  const result: any = {
    name: name === "" ? "my-project" : version,
    version: version === "" ? "1.0.0" : version,
    private: true,
    dependencies: dependencies,
    scripts: {
      start: "react-scripts start",
      build: "react-scripts build",
      test: "react-scripts test",
      eject: "react-scripts eject",
    },
    eslintConfig: {
      extends: ["react-app", "react-app/jest"],
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
  };

  // only append if the current value is not empty
  if (description !== "") result.description = description;
  if (author !== "") result.author = author;
  if (license !== "") result.license = license;
  if (homepage !== "") result.homepage = homepage;

  if (gitRepo !== "") {
    result.repository = {
      type: "git",
      url: gitRepo,
    };
    result.bugs = {
      url: `${gitRepo}/issues`,
    };
  }

  // converting the object to a JSON
  return JSON.stringify(result, null, 2);
};