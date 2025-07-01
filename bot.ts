import { Bot } from "grammy";
import prisma from "./lib/db";
import dotenv from "dotenv";
import { allPackages } from "./actions/admin/adminBot";
import { getStudentAnalyticsperPackage } from "./actions/admin/analysis";
import {filterStudentsByPackageandStatus} from "./actions/admin/analysis";
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
        status: { in: ["Active", "Not yet"] },
      },
      select: {
        wdt_ID: true,
        name: true,
        subject: true,
        package:true,
        isKid:true,
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
      const packageType=channel.package;
      const kidPackage=channel.isKid;
      if (subject) {
        const subjectPackage = await prisma.subjectPackage.findFirst({
          where: { subject: subject ,packageType:packageType,kidpackage:kidPackage},
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
        status: { in: ["Active", "Not yet"] },
      },
      select: {
        wdt_ID: true,
        name: true,
        subject: true,
        package:true,
        isKid:true,
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
          const keyboard = new InlineKeyboard().url(
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


export async function terbiaAdminBot() {
  // Store admin's pending message context
  const pendingAdminMessages: Record<
    number,
    { packageId: string; status: string; message?: string; chatIds?: number[] }
  > = {};

  // Admin command
  bot.command("admin", async (ctx) => {
    const chatId = ctx.chat?.id;
    try {
      const user = await prisma.admin.findFirst({
        where: { chat_id: chatId?.toString() },
      });

      if (user) {
        const keyboard = new InlineKeyboard()
          .text("📊 Dashboard", "admin_dashboard_page_1")
          .row()
          .text("✉️ Send Message", "admin_send");
        await ctx.reply("👋 WELCOME ADMIN!", { reply_markup: keyboard });
      } else {
        await ctx.reply("🚫 YOU ARE NOT AUTHORIZED.");
      }
    } catch (error) {
      console.error("❌ DB ERROR:", error);
      await ctx.reply("❌ INTERNAL ERROR.");
    }
  });

  // Dashboard with pagination
  bot.callbackQuery(/admin_dashboard_page_(\d+)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const match = ctx.callbackQuery.data.match(/admin_dashboard_page_(\d+)/);
    const page = match && match[1] ? parseInt(match[1]) : 1;

    const { data, pagination } = await getStudentAnalyticsperPackage(
      undefined,
      page,
      5
    );

    let msg = `📊 <b>Student Analytics (Page ${pagination.currentPage}/${pagination.totalPages})</b>\n\n`;
    if (data.length === 0) {
      msg += "No students found.";
    } else {
      msg += data
        .map(
          (s, i) =>
            `<b>${i + 1 + (pagination.currentPage - 1) * 5}. ${
              s.name ?? "N/A"
            }</b>\n` +
            `ID: <code>${s.id}</code>\n` +
            `Phone: <code>${s.phoneNo ?? "N/A"}</code>\n` +
            `isKid: <code>${s.isKid ? "Yes" : "No"}</code>\n` +
            `Active Package: <code>${s.activePackage}</code>\n` +
            `Progress: <code>${s.studentProgress}</code>\n`
        )
        .join("\n");
    }

    const keyboard = new InlineKeyboard();
    if (pagination.hasPreviousPage)
      keyboard.text(
        "⬅️ Prev",
        `admin_dashboard_page_${pagination.currentPage - 1}`
      );
    if (pagination.hasNextPage)
      keyboard.text(
        "Next ➡️",
        `admin_dashboard_page_${pagination.currentPage + 1}`
      );
    keyboard.row().text("🏠 Home", "admin_dashboard_home");

    if (ctx.update.callback_query.message) {
      await ctx.editMessageText(msg, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(msg, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    }
  });

  // Home button handler (returns to main menu)
  bot.callbackQuery("admin_dashboard_home", async (ctx) => {
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard()
      .text("📊 Dashboard", "admin_dashboard_page_1")
      .row()
      .text("✉️ Send Message", "admin_send");
    await ctx.editMessageText("👋 WELCOME ADMIN!", { reply_markup: keyboard });
  });

  // Step 1: Show all packages
  bot.callbackQuery("admin_send", async (ctx) => {
    await ctx.answerCallbackQuery();
    const packages = await allPackages();
    if (!packages || packages.length === 0) {
      await ctx.reply("No packages found.");
      return;
    }
    const keyboard = new InlineKeyboard();
    for (const pkg of packages) {
      keyboard.text(pkg.name, `admin_package_${pkg.id}`).row();
    }
    await ctx.reply("📦 Select a package:", { reply_markup: keyboard });
  });

  // Step 2: Show status options after package selection
  bot.callbackQuery(/admin_package_(.+)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const packageId = ctx.match[1];
    if (ctx.chat?.id) {
      pendingAdminMessages[ctx.chat.id] = { packageId, status: "" };
    }
    const keyboard = new InlineKeyboard()
      .text("✅ Completed", `admin_status_${packageId}_completed`)
      .row()
      .text("❌ Not Started", `admin_status_${packageId}_notstarted`)
      .row()
      .text("🕗 On Progress", `admin_status_${packageId}_inprogress`);
    await ctx.reply("Select student status:", { reply_markup: keyboard });
  });

  // Step 3: Prompt for message after status selection and show filtered chat_ids
 
// Step 3: Prompt for message after status selection and show filtered chat_ids
bot.callbackQuery(
  /admin_status_(.+)_(completed|notstarted|inprogress)/,
  async (ctx) => {
    await ctx.answerCallbackQuery();
    const [, packageId, status] = ctx.match;
    const adminId = ctx.chat?.id;
    if (!adminId) return;

    // Map UI status to backend status
    let backendStatus: "completed" | "notstarted" | "inprogress";
    if (status === "completed") backendStatus = "completed";
    else if (status === "notstarted") backendStatus = "notstarted";
    else backendStatus = "inprogress";

    const chatIds = await filterStudentsByPackageandStatus(packageId, backendStatus);

    if (!chatIds.length) {
      await ctx.reply("No students found for the selected package and status.");
      return;
    }

    // Save pending state
    pendingAdminMessages[adminId] = { packageId, status, chatIds: chatIds.map(Number) };

    // Show prompt and cancel button
    const keyboard = new InlineKeyboard().text("❌ Cancel", "admin_cancel_send");
    await ctx.reply("✍️ Please type the message to send (text, image, or voice):", { reply_markup: keyboard });
  }
);

// Cancel handler
bot.callbackQuery("admin_cancel_send", async (ctx) => {
  const adminId = ctx.chat?.id;
  if (adminId) delete pendingAdminMessages[adminId];
  await ctx.answerCallbackQuery();
  await ctx.reply("❌ Sending cancelled.");
});

// Listen for admin's next message (text, photo, or voice)
bot.on(["message:text", "message:photo", "message:voice"], async (ctx) => {
  const adminId = ctx.chat?.id;
  const pending = adminId ? pendingAdminMessages[adminId] : undefined;
  if (!pending || !pending.chatIds?.length) return;

  // Remove pending state to avoid duplicate sends
  delete pendingAdminMessages[adminId];

  // Prepare content
  let sendFn;
  if (ctx.message.text) {
    sendFn = (id: number) => ctx.api.sendMessage(id, ctx.message.text!);
  } else if (ctx.message.photo) {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    sendFn = (id: number) => ctx.api.sendPhoto(id, fileId, { caption: ctx.message.caption });
  } else if (ctx.message.voice) {
    const fileId = ctx.message.voice.file_id;
    sendFn = (id: number) => ctx.api.sendVoice(id, fileId, { caption: ctx.message.caption });
  } else {
    await ctx.reply("Unsupported message type.");
    return;
  }

  // Send to all selected students
  let sent = 0, failed = 0;
  for (const chatId of pending.chatIds) {
    try {
      await sendFn(chatId);
      sent++;
    } catch (err) {
      failed++;
    }
  }
  await ctx.reply(`✅ Sent to ${sent} students.${failed ? ` ❌ Failed: ${failed}` : ""}`);
});

  bot.start();
  console.log("✅ Admin bot started.");
}