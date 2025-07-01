import { startBot } from "./bot";
import { terbiaAdminBot } from "./bot";

(async () => {
  console.log("Starting the bot...");
  //   await startBot();
  await terbiaAdminBot();
  console.log("Bot started.");
})();
