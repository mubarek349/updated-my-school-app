import { Bot } from "grammy";
import prisma from "./lib/db";
import dotenv from "dotenv";
import { getStudentById } from "./actions/admin/adminBot";
import { allPackages } from "./actions/admin/adminBot";
import { getStudentAnalyticsperPackage } from "./actions/admin/analysis";
import { filterStudentsByPackageList } from "./actions/admin/analysis";
import { filterStudentsByPackageandStatus } from "./actions/admin/analysis";
import { updatePathProgressData } from "./actions/student/progress";
import { InlineKeyboard } from "grammy";
dotenv.config();
const BASE_URL = process.env.FORWARD_URL || process.env.AUTH_URL;

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
export { bot };

export default async function sendMessage(chat_id: number, message: string) {
  try {
    await bot.api.sendMessage(chat_id, message);
  } catch (err) {
    console.error("Failed to send initial message:", err);
  }
}
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
        package: true,
        isKid: true,
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
      const packageType = channel.package;
      const kidPackage = channel.isKid;
      if (subject) {
        const subjectPackage = await prisma.subjectPackage.findFirst({
          where: {
            subject: subject,
            packageType: packageType,
            kidpackage: kidPackage,
          },
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
        package: true,
        isKid: true,
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

  // bot.on("message", (ctx) => ctx.reply("Got another message!"));

  bot.catch((err) => {
    console.error("Error in middleware:", err);
  });

  // bot.start();
  console.log("Telegram bot started successfully.");
  // sendMessagesToAllStudents();

  // Store admin's pending message context
  const pendingAdminMessages: Record<
    number,
    {
      packageId: string;
      status: string;
      message?: string;
      chatIds?: number[];
      studentName?: string;
      studentId?: string;
    }
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
          .text("📊 ዳሽቦርድ", "admin_dashboard_page_1")
          .row()
          .text("✉️ መልእክት ላክ", "admin_send");
        await ctx.reply(
          "👋 እንኳን ወደ አድሚን ፓነል በደህና መጡ!\n\n" +
            "ከዚህ በታች ያሉትን ቁልፎች በመጠቀም የተማሪዎችን አካውንት መከታተል፣ መልእክት መላክ እና የትምህርት ጥራት ማጣራት ይችላሉ።\n\n" +
            "• <b>📊 ዳሽቦርድ</b> – የተማሪዎችን ሁኔታ ይመልከቱ።\n" +
            "• <b>✉️ መልእክት ላክ</b> – ለተመረጡ ተማሪዎች መልእክት ይላኩ።",
          { reply_markup: keyboard, parse_mode: "HTML" }
        );
      } else {
        await ctx.reply("🚫 ይቅርታ፣ ወደ አድሚን ፓነል ማግኘት አትችሉም።");
      }
    } catch (error) {
      console.error("❌ DB ERROR:", error);
      await ctx.reply("❌ የውሂብ ችግር።");
    }
  });

  // Step 0: When admin clicks "መልእክት ላክ", show two options
  bot.callbackQuery("admin_send", async (ctx) => {
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard()
      .text("ለአንዱ ተማሪ መልእክት ላክ", "admin_send_individual")
      .row()
      .text("ፓኬጅ በመምረጥ መልእክት ላክ", "admin_send_package");
    await ctx.reply("እባክዎ የመልእክት አይነት ይምረጡ:", { reply_markup: keyboard });
  });

  // Step 1a: If "Send by package" is selected, continue as before
  bot.callbackQuery("admin_send_package", async (ctx) => {
    await ctx.answerCallbackQuery();
    const packages = await allPackages();
    if (!packages || packages.length === 0) {
      await ctx.reply("ምንም ፓኬጅ አልተገኘም።");
      return;
    }
    const keyboard = new InlineKeyboard();
    for (const pkg of packages) {
      keyboard
        .text(
          `${pkg.name} -- ጠቅላላ ተማሪ ${pkg.totalStudents}`,
          `admin_package_${pkg.id}`
        )
        .row();
    }
    await ctx.reply("📦 ፓኬጅ ይምረጡ:", { reply_markup: keyboard });
  });

  // Step 1b: If "Send to individual" is selected, ask for student ID
  bot.callbackQuery("admin_send_individual", async (ctx) => {
    await ctx.answerCallbackQuery();
    const adminId = ctx.chat?.id;
    if (adminId) {
      pendingAdminMessages[adminId] = { packageId: "", status: "individual" };
    }
    await ctx.reply("እባክዎ የተማሪውን ID ያስገቡ:");
  });

  // Step 2b: Listen for student ID, fetch and show student name, then prompt for message
  bot.on("message:text", async (ctx, next) => {
    const adminId = ctx.chat?.id;
    const pending = adminId ? pendingAdminMessages[adminId] : undefined;
    if (!pending || pending.status !== "individual" || pending.chatIds) {
      return next(); // Not in individual mode, continue to other handlers
    }

    // Try to find the student by ID using getStudentById
    const studentId = ctx.message.text?.trim();
    if (!studentId) {
      await ctx.reply("የተማሪ ID ያስገቡ።");
      return;
    }

    const student = await getStudentById(Number(studentId));

    if (!student) {
      await ctx.reply("ተማሪ አልተገኘም። እባክዎ ትክክለኛ መለያ ያስገቡ።");
      return; // Wait for another ID input
    }

    // Save chatId for next step
    pendingAdminMessages[adminId] = {
      ...pending,
      chatIds: [Number(student.chat_id)],
      studentName: student.name ?? "",
      studentId: (student as any).id ?? "",
    };

    await ctx.reply(
      `ተማሪ: ${student.name}\n\n✍️ ለመላክ መልእክት ይጻፉ (ጽሑፍ፣ ፎቶ፣ ወይም ድምጽ)፡፡`
    );
  });

  // Step 3b: Listen for message to send to individual student or group
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
      sendFn = (id: number) =>
        ctx.api.sendPhoto(id, fileId, { caption: ctx.message.caption });
    } else if (ctx.message.voice) {
      const fileId = ctx.message.voice.file_id;
      sendFn = (id: number) =>
        ctx.api.sendVoice(id, fileId, { caption: ctx.message.caption });
    } else {
      await ctx.reply("የሚደገፍ ያልሆነ ዓይነት መልእክት።");
      return;
    }

    // Send to all selected students
    let sent = 0,
      failed = 0;
    for (const chatId of pending.chatIds) {
      try {
        await sendFn(chatId);
        sent++;
      } catch (err) {
        failed++;
      }
    }
    await ctx.reply(
      `✅ ለ${sent} ተማሪ${sent > 1 ? "ዎች" : ""} ተልኳል።${
        failed ? ` ❌ አልተላከላቸውም: ${failed}` : ""
      }`
    );
  });

  // Step 2: Show status options after package selection
  bot.callbackQuery(/admin_package_(.+)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const packageId = ctx.match[1];
    console.log("Selected package ID:", packageId);
    if (ctx.chat?.id) {
      // pendingAdminMessages[ctx.chat.id] = { packageId, status: "" };
    }

    // Get status counts for this package
    const statusCounts = await filterStudentsByPackageList(packageId);
    console.log("Status counts:", statusCounts);

    const statusMap: Record<string, number> = {
      completed: 0,
      notstarted: 0,
      inprogress_0: 0,
      inprogress_10: 0,
      inprogress_40: 0,
      inprogress_70: 0,
      inprogress_o: 0,
    };
    if (Array.isArray(statusCounts)) {
      for (const s of statusCounts) {
        statusMap[s.status] = s.count;
      }
    }

    // 2 in first row, 4 in second row
    const keyboard = new InlineKeyboard()
      .row()
      .text(
        `✅ ተጠናቀቀ (${statusMap.completed})`,
        `admin_status_${packageId}_completed`
      )
      .row()
      .text(
        `❌ አልጀመረም (${statusMap.notstarted})`,
        `admin_status_${packageId}_notstarted`
      )
      .row()
      .text(
        `0️⃣ 0% (${statusMap.inprogress_0})`,
        `admin_status_${packageId}_inprogress_0`
      )
      .row()
      .text(
        `🔟 10% (${statusMap.inprogress_10})`,
        `admin_status_${packageId}_inprogress_10`
      )
      .row()
      .text(
        `⏳ 40% (${statusMap.inprogress_40})`,
        `admin_status_${packageId}_inprogress_40`
      )
      .row()
      .text(
        `🕗 70% (${statusMap.inprogress_70})`,
        `admin_status_${packageId}_inprogress_70`
      )
      .row()
      .text(
        `🟡 ቀሪዎች (${statusMap.inprogress_o})`,
        `admin_status_${packageId}_inprogress_o`
      );
    await ctx.reply("የተማሪዎችን ሁኔታ ይምረጡ:", { reply_markup: keyboard });
  });

  // Step 3: Prompt for message after status selection and show filtered chat_ids
  bot.callbackQuery(
    /admin_status_(.+)_(completed|notstarted|inprogress_0|inprogress_10|inprogress_40|inprogress_70|inprogress_o)/,
    async (ctx) => {
      await ctx.answerCallbackQuery();
      const [, packageId, status] = ctx.match;
      const adminId = ctx.chat?.id;
      if (!adminId) return;

      // Pass status directly to your filter function
      const chatIds = await filterStudentsByPackageandStatus(packageId, status);

      if (!chatIds.length) {
        await ctx.reply("ለተመረጠው ፓኬጅ እና ሁኔታ ምንም ተማሪ አልተገኘም።");
        return;
      }

      // Save pending state
      pendingAdminMessages[adminId] = {
        packageId,
        status,
        chatIds: chatIds.map(Number),
      };

      // Show prompt and cancel button
      const keyboard = new InlineKeyboard().text("❌ ሰርዝ", "admin_cancel_send");
      await ctx.reply("✍️ ለመላክ የሚፈልጉትን መልእክት (ጽሑፍ፣ ፎቶ፣ ወይም ድምጽ) ይጻፉ፡፡", {
        reply_markup: keyboard,
      });
    }
  );

  // Cancel handler
  bot.callbackQuery("admin_cancel_send", async (ctx) => {
    const adminId = ctx.chat?.id;
    if (adminId) delete pendingAdminMessages[adminId];
    await ctx.answerCallbackQuery();
    await ctx.reply("❌ መላክ ተሰርዟል።");
  });

  // Dashboard with pagination (unchanged)
  bot.callbackQuery(/admin_dashboard_page_(\d+)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const match = ctx.callbackQuery.data.match(/admin_dashboard_page_(\d+)/);
    const page = match && match[1] ? parseInt(match[1]) : 1;

    const { data, pagination } = await getStudentAnalyticsperPackage(
      undefined,
      page,
      5
    );

    let msg = `📊 <b>የተማሪ ትንታኔ (ገፅ ${pagination.currentPage}/${pagination.totalPages})</b>\n\n`;
    if (data.length === 0) {
      msg += "ተማሪዎች አልተገኙም።";
    } else {
      msg += data
        .map(
          (s, i) =>
            `<b>${i + 1 + (pagination.currentPage - 1) * 5}. ${
              s.name ?? "N/A"
            }</b>\n` +
            `መለያ: <code>${s.id}</code>\n` +
            `ስልክ: <code>${s.phoneNo ?? "N/A"}</code>\n` +
            `ልጅ ነው?: <code>${s.isKid ? "አዎ" : "አይደለም"}</code>\n` +
            `ፓኬጅ: <code>${s.activePackage}</code>\n` +
            `እድገት: <code>${s.studentProgress}</code>\n`
        )
        .join("\n");
    }

    const keyboard = new InlineKeyboard();
    if (pagination.hasPreviousPage)
      keyboard.text(
        "⬅️ ቀዳሚ",
        `admin_dashboard_page_${pagination.currentPage - 1}`
      );
    if (pagination.hasNextPage)
      keyboard.text(
        "ቀጣይ ➡️",
        `admin_dashboard_page_${pagination.currentPage + 1}`
      );
    keyboard.row().text("🏠 መነሻ", "admin_dashboard_home");

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
      .text("📊 ዳሽቦርድ", "admin_dashboard_page_1")
      .row()
      .text("✉️ መልእክት ላክ", "admin_send");
    await ctx.editMessageText("👋 እንኳን ወደ አድሚን ፓነል በደህና መጡ!", {
      reply_markup: keyboard,
    });
  });

  // bot.start();
  console.log("✅ አድሚን ቦት ተጀምሯል።");
}
