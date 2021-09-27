const { execSync } = require("child_process");
const { resolve } = require("path");
const { Server } = require("https");
require("dotenv/config");

const isGlitch = (
    process.env.PROJECT_DOMAIN !== undefined &&
    process.env.PROJECT_INVITE_TOKEN !== undefined &&
    process.env.API_SERVER_EXTERNAL !== undefined &&
    process.env.PROJECT_REMIX_CHAIN !== undefined);

const isReplit = (
    process.env.REPLIT_DB_URL !== undefined &&
    process.env.REPL_ID !== undefined &&
    process.env.REPL_IMAGE !== undefined &&
    process.env.REPL_LANGUAGE !== undefined &&
    process.env.REPL_OWNER !== undefined &&
    process.env.REPL_PUBKEYS !== undefined &&
    process.env.REPL_SLUG !== undefined)

if (isGlitch) {
    new Server((req, res) => {
        const now = new Date().toLocaleString("en-US");
        res.end(`OK (200) - ${now}`);
    }).listen(process.env.PORT);
} else if (isReplit && (Number(process.version.split(".")[0]) < 16)) {
    console.info("[INFO] Replit doesn't use Node.js v16 or newer, trying to install Node.js v16...");
    execSync(`npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH`);
    console.info("[INFO] Node.js v16 has installed, please re-run the bot.");
    process.exit(1);
}

start();

function start() {
    if (isGlitch) {
        console.info("[INFO] Glitch environment detected, trying to compile...");
        execSync(`${resolve(process.cwd(), "node_modules", "typescript", "bin", "tsc")} --build tsconfig.json`);
        console.info("[INFO] Compiled, starting the bot...");
    }
    require("./dist/index.js");
}

