import { Bot } from "grammy";
import prisma from "./lib/db";
import dotenv from "dotenv";
import { updatePathProgressData } from "./actions/student/progress";
import { InlineKeyboard } from "grammy";
// import { sendMessagesToAllStudents } from "./setTimeInterval";
// import { Channel } from "diagnostics_channel";
dotenv.config();
// Replace this with your public domain or use an environment variable
const BASE_URL = process.env.FORWARD_URL || process.env.AUTH_URL;

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");

export async function startBot() {
  bot.command("start", async (ctx) => {
    const chatId = ctx.chat?.id;

    if (!chatId) {
      return ctx.reply("Unable to retrieve chat ID.");
    }

    // 1. Fetch channels
    let channels = await prisma.wpos_wpdatatable_23.findMany({
      where: {
        chat_id: chatId.toString(),
        status: { in: ["Active", "Notyet"] },
      },
      select: {
        wdt_ID: true,
        name: true,
        subject: true,
        activePackage: {
          where: { isPublished: true },
          select: {
            courses: {
              where: { order: 1 },
              select: {
                id: true,
                title: true,
                chapters: {
                  where: { position: 1 },
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Update youtubeSubject for all channels
    for (const channel of channels) {
      const subject = channel.subject;
      if (subject) {
        const subjectPackage = await prisma.subjectPackage.findFirst({
          where: { subject: subject },
          select: { packageId: true },
        });
        await prisma.wpos_wpdatatable_23.update({
          where: { wdt_ID: channel.wdt_ID },
          data: { youtubeSubject: subjectPackage?.packageId || null },
        });
      } else {
        await prisma.wpos_wpdatatable_23.update({
          where: { wdt_ID: channel.wdt_ID },
          data: { youtubeSubject: null },
        });
      }
    }

    // 3. Fetch channels again to get updated youtubeSubject
    channels = await prisma.wpos_wpdatatable_23.findMany({
      where: {
        chat_id: chatId.toString(),
        status: { in: ["Active", "Notyet"] },
      },
      select: {
        wdt_ID: true,
        name: true,
        subject: true,
        activePackage: {
          where: { isPublished: true },
          select: {
            courses: {
              where: { order: 1 },
              select: {
                id: true,
                title: true,
                chapters: {
                  where: { position: 1 },
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const lang = "en";
    const stud = "student";

    if (channels && channels.length > 0) {
      let sent;

      for (const channel of channels) {
        const studId = channel.wdt_ID;
        if (
          channel.activePackage &&
          channel.activePackage.courses.length > 0 &&
          channel.activePackage.courses[0].chapters.length > 0
        ) {
          const course = channel.activePackage.courses[0];
          const chapter = course.chapters[0];

          const studentProgress = await prisma.studentProgress.findFirst({
            where: {
              studentId: channel.wdt_ID,
              chapterId: chapter.id,
            },
          });

          if (!studentProgress) {
            await prisma.studentProgress.create({
              data: {
                studentId: channel.wdt_ID,
                chapterId: chapter.id,
                isCompleted: false,
              },
            });
          }

          const update = await updatePathProgressData(studId);
          const url = `${BASE_URL}/${lang}/${stud}/${studId}/${update?.chapter.course.id}/${update?.chapter.id}`;

          const channelName = channel.name || "ዳሩል-ኩብራ";
          const keyboard = new InlineKeyboard().webApp(
            `📚 የ${channelName}ን የትምህርት ገጽ ይክፈቱ`,
            url
          );

          await ctx.reply(
            "✅  እንኳን ወደ ዳሩል-ኩብራ የቁርአን ማእከል በደህና መጡ! ኮርሱን ለመከታተል ከታች ያለውን ማስፈንጠሪያ ይጫኑ፡፡",
            {
              reply_markup: keyboard,
            }
          );
          sent = true;
        }
      }
      if (!sent) {
        return ctx.reply("🚫 የኮርሱን ፕላትፎርም ለማግኘት አልተፈቀደለዎትም!");
      }
    } else {
      return ctx.reply("🚫 የኮርሱን ፕላትፎርም ለማግኘት አልተፈቀደለዎትም! አድሚኑን ያነጋግሩ፡፡");
    }
  });

  bot.on("message", (ctx) => ctx.reply("Got another message!"));

  bot.catch((err) => {
    console.error("Error in middleware:", err);
  });

  bot.start();
  console.log("Telegram bot started successfully.");
  // sendMessagesToAllStudents();
}

export default async function sendMessage(chat_id: number, message: string) {
  try {
    await bot.api.sendMessage(chat_id, message);
  } catch (err) {
    console.error("Failed to send initial message:", err);
  }
}