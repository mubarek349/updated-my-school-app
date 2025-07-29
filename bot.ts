import { Bot } from "grammy";
import cron from "node-cron";
import prisma from "./lib/db";
import dotenv from "dotenv";
import { getStudentById } from "./actions/admin/adminBot";
import { allPackages } from "./actions/admin/adminBot";
import { sendProgressMessages } from "./actions/admin/analysis";
import { getStudentAnalyticsperPackage } from "./actions/admin/analysis";
import { filterStudentsByPackageList } from "./actions/admin/analysis";
import { filterStudentsByPackageandStatus } from "./actions/admin/analysis";
import { updatePathProgressData } from "./actions/student/progress";
import { InlineKeyboard } from "grammy";
import { getAvailablePacakges } from "./actions/student/package";
dotenv.config();
const BASE_URL = process.env.FORWARD_URL || process.env.AUTH_URL;
const sentMessageIds: Record<string, number[]> = {};
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
    // Check if user is admin
    const admin = await prisma.admin.findFirst({
      where: { chat_id: chatId.toString() },
    });

    if (admin) {
      // Admin help message (Amharic & English)
      return ctx.reply(
        `👋 <b>እንኳን ወደ አድሚን ፓነል በደህና መጡ!</b>\n\n` +
          `ይህ ቦት የተማሪዎችን ሁኔታ ማየት፣ መልእክት ላክ እና የትምህርት ጥራት ማጣራት ይረዳዎታል።\n\n` +
          `• <b>/login</b> – ወደ አድሚን ድህረገፅ ይግቡ።\n` +
          `• <b>/admin</b> – ተማሪዎችን ያስተዳድሩ እና መልእክት ይላኩ።\n` +
          `• <b>/start</b> – የትምህርት መጀመሪያ ገጽ ይመልከቱ።\n\n` +
          `Welcome to the Admin Portal!\n\n` +
          `This bot helps you manage students, send messages, and monitor course quality.\n\n` +
          `• <b>/login</b> – Access the admin website.\n` +
          `• <b>/admin</b> – Manage students and send messages in the bot.\n` +
          `• <b>/start</b> – Start learning the course as a student.\n\n` +
          `እንኳን ደህና መጡ!`,
        { parse_mode: "HTML" }
      );
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
            id: true,
            name: true,
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
      if (!packageType || !subject || kidPackage === null) continue;
      
        const subjectPackage = await prisma.subjectPackage.findMany({
          where: {
            subject: subject,
            packageType: packageType,
            kidpackage: kidPackage,
          },
          orderBy: { createdAt: "desc" },
          select: { packageId: true },
        });
      if (!subjectPackage || subjectPackage.length === 0) continue;
      const lastPackageId = subjectPackage[0].packageId;
      // Check if the active package is already set
      const activePackageAvailabilty = subjectPackage.filter((pkg) => pkg.packageId=== channel.activePackage?.id).length > 0;
      // If no active package, set youtubeSubject to the latest subjectPackage
        if (channel.activePackage === null || channel.activePackage === undefined || !activePackageAvailabilty) {
          await prisma.wpos_wpdatatable_23.update({
            where: { wdt_ID: channel.wdt_ID },
            data: { youtubeSubject: lastPackageId },
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
            id: true,
            name: true,
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
        const packageType = channel.package;
        const subject = channel.subject;
        const isKid = channel.isKid;
        if (!packageType || !subject || isKid === null) continue;
        const availablePackages = await getAvailablePacakges(
          packageType,
          subject,
          isKid
        );
        if (!availablePackages || availablePackages.length === 0) continue;
        const studId = channel.wdt_ID;
        if (availablePackages.filter((p) => p.id).length === 1) {
          if (
            channel.activePackage &&
            channel.activePackage.courses.length > 0 &&
            channel.activePackage.courses[0].chapters.length > 0
          ) {
            const course = channel.activePackage.courses[0];
            const chapter = course.chapters[0];

            const studentProgress = await prisma.studentProgress.findFirst({
              where: {
                studentId: studId,
                chapterId: chapter.id,
              },
            });

            if (!studentProgress) {
              await prisma.studentProgress.create({
                data: {
                  studentId: studId,
                  chapterId: chapter.id,
                  isCompleted: false,
                },
              });
            }

            const update = await updatePathProgressData(studId);
            const url = `${BASE_URL}/${lang}/${stud}/${studId}/${update[0]}/${update[1]}`;

            const channelName = channel.name || "ዳሩል-ኩብራ";
            const packageName = channel.activePackage.name || "የተማሪ ፓኬጅ";
            const keyboard = new InlineKeyboard().url(
              `📚 የ${channelName}ን የ${packageName}ትምህርት ገጽ ይክፈቱ`,
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
        } else {
          // 2. Fetch available packages for this student
          if (!channel.package || !channel.subject || channel.isKid === null) {
            return ctx.reply("🚫 ተማሪ ፓኬጅ ወይም ርዕስ መረጃ አልተገኘም። አድሚኑን ያነጋግሩ፡፡");
          }
          const availablePackages = await getAvailablePacakges(
            channel.package,
            channel.subject,
            channel.isKid
          );

          if (!availablePackages || availablePackages.length === 0) {
            return ctx.reply("🚫 ምንም ፓኬጅ አልተገኘም። አድሚኑን ያነጋግሩ፡፡");
          }

          // 3. Show packages as inline buttons
          const keyboard = new InlineKeyboard();
          for (const pkg of availablePackages) {
            keyboard
              .text(
                pkg.package.name,
                `choose_package_${pkg.package.id}@${studId}`
              )
              .row();
          }
          await ctx.reply(
            `ለተማሪ ${channel.name} እባክዎ ፓኬጅ ይምረጡ፡፡\nPlease choose your package:`,
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
  // 4. Handle package selection
  bot.callbackQuery(/choose_package_(.+)/, async (ctx) => {
    const chatId = ctx.chat?.id;
    const packageId = ctx.match[1].split("@")[0];
    const wdt_ID = Number(ctx.match[1].split("@")[1]);
    console.log("Selected package:", packageId, "for student ID:", wdt_ID);
    // Set the chosen package as active for the student
    const student = await prisma.wpos_wpdatatable_23.findFirst({
      where: {
        chat_id: chatId?.toString(),
        wdt_ID: wdt_ID,
        status: { in: ["Active", "Notyet"] },
      },
    });

    if (!student) {
      return ctx.reply("🚫 ተማሪ አልተገኘም።");
    }
    const studentName = student.name || "ዳሩል-ኩብራ";
    // Check if the package exists
    const validPackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
    });
    if (!validPackage) {
      return ctx.reply("🚫 ይህ ፓኬጅ አልተገኘም። አድሚኑን ያነጋ፡");
    }

    // Now update
    await prisma.wpos_wpdatatable_23.update({
      where: { wdt_ID: wdt_ID },
      data: { youtubeSubject: packageId },
    });
    // Update student's youtubeSubject (or active package field as needed)
    await prisma.wpos_wpdatatable_23.update({
      where: { wdt_ID: wdt_ID },
      data: { youtubeSubject: packageId },
    });

    // Fetch the package details (including first course/chapter)
    const activePackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
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
    });

    if (
      !activePackage ||
      !activePackage.courses.length ||
      !activePackage.courses[0].chapters.length
    ) {
      return ctx.reply("🚫 ይህ ፓኬጅ ትምህርት አይዟትም። አድሚኑን ያነጋግሩ፡፡");
    }

    // Ensure student progress exists
    const course = activePackage.courses[0];
    const chapter = course.chapters[0];
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: wdt_ID,
        chapterId: chapter.id,
      },
    });

    if (!studentProgress) {
      await prisma.studentProgress.create({
        data: {
          studentId: wdt_ID,
          chapterId: chapter.id,
          isCompleted: false,
        },
      });
    }

    // Send the learning link
    const lang = "en";
    const stud = "student";
    const update = await updatePathProgressData(wdt_ID);
    const url = `${BASE_URL}/${lang}/${stud}/${wdt_ID}/${update[0]}/${update[1]}`;

    const packageName = activePackage.name || "የተማሪ ፓኬጅ";
    const openKeyboard = new InlineKeyboard().url(
      `📚 የ${studentName}ን የ${packageName}ትምህርት ገጽ ይክፈቱ`,
      url
    );

    await ctx.reply(
      "✅  እንኳን ወደ ዳሩል-ኩብራ የቁርአን ማእከል በደህና መጡ! ኮርሱን ለመከታተል ከታች ያለውን ማስፈንጠሪያ ይጫኑ፡፡",
      {
        reply_markup: openKeyboard,
      }
    );
  });
  // bot.on("message", (ctx) => ctx.reply("Got another message!"));

  bot.catch((err) => {
    console.error("Error in middleware:", err);
  });

  // bot.start();
  console.log("Telegram bot started successfully.");
  // sendMessagesToAllStudents();

  bot.command("login", async (ctx) => {
    // Show an inline button that triggers a callback query
    const keyboard = new InlineKeyboard().text("🔑 Login", "admin_login_check");
    await ctx.reply("Please click the button below to login:", {
      reply_markup: keyboard,
    });
  });

  // Handle the callbackQuery for the login button
  bot.callbackQuery("admin_login_check", async (ctx) => {
    const chatId = ctx.chat?.id;
    // Check if user is admin
    const admin = await prisma.admin.findFirst({
      where: { chat_id: chatId?.toString() },
    });

    if (admin) {
      // If admin, show web app button
      const keyboard = new InlineKeyboard().webApp(
        "🔑 Open Admin WebApp",
        "https://darelkubra.com:5000/en/login" // Replace with your actual web app URL
      );
      await ctx.editMessageText(
        "Welcome, admin! Click below to open the admin web app:",
        {
          reply_markup: keyboard,
        }
      );
    } else {
      await ctx.editMessageText(
        "🚫 You are not authorized to access the admin web app."
      );
    }
  });

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
  ////////
  bot.command("starts", async (ctx) => {
    const chatId = ctx.chat?.id;
    // 1. Fetch channels
    if (!chatId) {
      return ctx.reply("Unable to retrieve chat ID.");
    }
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
            id: true,
            name: true,
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
    try {
      // 2. Update youtubeSubject for all channels
      for (const channel of channels) {
        if (!channel.wdt_ID) continue; // Skip if wdt_ID is not set
        const subject = channel.subject;
        const packageType = channel.package;
        const kidPackage = channel.isKid;
        if (!subject || !packageType || kidPackage === null) continue; // Skip if any required field is missing
        const availablePackageId = (
          await getAvailablePacakges(packageType, subject, kidPackage)
        ).map((p) => p.id);
        if (!availablePackageId || availablePackageId.length === 0) {
          await ctx.reply(
            `🚫 ለተማሪ ${channel.name} ምንም ፓኬጅ አልተገኘም። አድሚኑን ያነጋግሩ፡፡`
          );
          return;
        }

        await prisma.wpos_wpdatatable_23.update({
          where: { wdt_ID: channel.wdt_ID },
          data: { youtubeSubject: availablePackageId[0] ?? null },
        });

        const keyboard = new InlineKeyboard()
          .text("📊 Packages", `package_selection_${availablePackageId[0]}`)
          .row();
        await ctx.reply(
          "👋 እንኳን ወደ አድሚን ፓነል በደህና መጡ!\n\n" +
            "ከዚህ በታች ያሉትን ቁልፎች በመጠቀም የተማሪዎችን አካውንት መከታተል፣ መልእክት መላክ እና የትምህርት ጥራት ማጣራት ይችላሉ።\n\n" +
            "• <b>📊 ዳሽቦርድ</b> – የተማሪዎችን ሁኔታ ይመልከቱ።\n" +
            "• <b>✉️ መልእክት ላክ</b> – ለተመረጡ ተማሪዎች መልእክት ይላኩ።",
          { reply_markup: keyboard, parse_mode: "HTML" }
        );
      }
    } catch (error) {
      console.error("❌ DB ERROR:", error);
      await ctx.reply("❌ የውሂብ ችግር።");
    }
  });
  bot.callbackQuery("/package_selection_(.+)/", async (ctx) => {
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard()
      .text("📊 ዳሽቦርድ", "admin_dashboard_page_1")
      .row()
      .text("✉️ መልእክት ላክ", "admin_send");
    await ctx.editMessageText("👋 እንኳን ወደ አድሚን ፓነል በደህና መጡ!", {
      reply_markup: keyboard,
    });
  });

  // Schedule a task to run every day at 00:00
  // import { sendProgressMessages } from "./actions/admin/analysis";

  cron.schedule("28 12 * * *", async () => {
    console.log("Running progress notification job...");
    console.log("Current time:", new Date().toLocaleString());
    console.log("current time zone  >>>", new Date().getTimezoneOffset());
    try {
      const studentsWithProgress = await sendProgressMessages();

      for (const { chatid, progress, studId, name } of studentsWithProgress) {
        if (!chatid) continue;

        // Delete all previous messages for this user
        if (sentMessageIds[chatid]) {
          for (const msgId of sentMessageIds[chatid]) {
            try {
              // await bot.api.deleteMessage(Number(chatid), msgId);
            } catch (err) {
              // Ignore errors (message might already be deleted)
            }
          }
          sentMessageIds[chatid] = [];
        }

        let message = "";
        let extraOptions = {};

        if (progress === "completed") {
          message =
            "🎉 እንኳን ደስ አለህ! ኮርሱን በትክክል ጨርሰሃል። አመሰግናለሁ!\n\nበትጋትና በትክክል ስራህን በመሟሟት የተማሪነትህን ምርጥ አሳየህ። ይህ የመጀመሪያ አስደሳች እድገት ነው። በሚቀጥለው ደረጃ ደግሞ በትጋት ቀጥለህ እንዲሰራህ እንመኛለን።\n\nአብረንህ እንሰራለን። አዲስ ትምህርቶችን ለመጀመር ዝግጁ እንደሆንህ አሳየኸን። እንኳን አዲስ ደረጃ ላይ በደህና መጡ!";
        } else {
          message =
            progress === "notstarted"
              ? "👋 ሰላም፣ ኮርሱን መጀመር አልተጀመርም። እባክህ ዛሬ ጀምር!"
              : `⏳ ኮርሱ በመካከለኛ ሁኔታ ነው። ሂደተዎ: ${progress} ነው።እባከዎን ት/ትዎን በርትተው ይጨርሱ።`;

          const update = await updatePathProgressData(studId);
          const lang = "en";
          const stud = "student";
          const url = `${BASE_URL}/${lang}/${stud}/${studId}/${update[0]}/${update[1]}`;
          const channelName = name || "ዳሩል-ኩብራ";
          const keyboard = new InlineKeyboard().url(
            `📚 የ${channelName}ን የትምህርት ገጽ ይክፈቱ`,
            url
          );
          extraOptions = { reply_markup: keyboard };
        }

        try {
          const sentMsg = await bot.api.sendMessage(
            Number(chatid),
            message,
            extraOptions
          );
          // Track the new message ID
          await Promise.all(
            Array(sentMsg.message_id)
              .fill({})
              .map((v, i) => i)
              .reverse()
              .map(async (v) => {
                try {
                  const res = await bot.api.deleteMessage(chatid, v);
                  console.log("Deleted message >> ", res, v, chatid);
                } catch (error) {
                  console.log("Failed to delete message >> ", error);
                }
                return;
              })
          );
          // if (!sentMessageIds[chatid]) sentMessageIds[chatid] = [];
          // sentMessageIds[chatid].push(sentMsg.message_id);
        } catch (err) {
          // console.error("Failed to send progress message to", chatid, err);
        }
      }
      // console.log("✅ Progress messages sent to all students.");
    } catch (error) {
      // console.error("Error in progress notification job:", error);
    }
  });
  // console.log("✅ Daily task scheduled to run at 00:00");
}
