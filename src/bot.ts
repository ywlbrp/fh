import { NoStackError } from "./utils/NoStackError";
import { clientOptions } from "./config";
import { Disc } from "./structures/Disc";

const client = new Disc(clientOptions);

process.on("exit", code => {
    client.logger.info(`NodeJS process exited with code ${code}`);
});
process.on("uncaughtException", err => {
    client.logger.error("UNCAUGHT_EXCEPTION:", err);
    client.logger.warn("Uncaught Exception detected. Restarting...");
    process.exit(1);
});
process.on("unhandledRejection", reason => {
    client.logger.error("UNHANDLED_REJECTION:", (reason as Error).stack ? reason : new NoStackError(reason as string));
});
process.on("warning", client.logger.warn);

client.build(process.env.CONFIG_DISCORD_TOKEN!)
    .catch(e => client.logger.error("PROMISE_ERR:", e));
