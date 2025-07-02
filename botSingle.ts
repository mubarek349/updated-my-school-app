import { startBot, bot } from "./bot";

(async () => {
  await startBot();
  // await terbiaAdminBot();
  console.log("Starting the bot...");
  await bot.start();
  console.log("Bot started.");
})();