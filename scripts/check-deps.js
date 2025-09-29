const { execSync } = require("child_process");
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
console.log("Project react (in package.json):", (pkg.dependencies && pkg.dependencies.react) || (pkg.devDependencies && pkg.devDependencies.react) || "not declared");
console.log("Project date-fns:", (pkg.dependencies && pkg.dependencies["date-fns"]) || (pkg.devDependencies && pkg.devDependencies["date-fns"]) || "not declared");
console.log("Scanning top-level dependencies:", Object.keys(deps).length);
console.log("");
for (const name of Object.keys(deps)) {
  try {
    const infoRaw = execSync(`npm view ${name} --json`, { stdio: ["pipe", "pipe", "ignore"] }).toString();
    const info = JSON.parse(infoRaw);
    console.log("------------------------------------------------------------");
    console.log(name + (deps[name] ? " @" + deps[name] : ""));
    if (info.version) console.log(" latest:", info.version);
    if (info.peerDependencies && Object.keys(info.peerDependencies).length) {
      console.log(" peerDependencies:", JSON.stringify(info.peerDependencies));
    } else {
      console.log(" peerDependencies: none");
    }
    if (info.engines && Object.keys(info.engines).length) {
      console.log(" engines:", JSON.stringify(info.engines));
    }
    console.log("");
  } catch (e) {
    console.log("------------------------------------------------------------");
    console.log(name, " -> ERROR fetching npm info:", e.message);
    console.log("");
  }
}
