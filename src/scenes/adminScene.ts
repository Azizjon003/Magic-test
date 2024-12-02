import { Scenes, Markup } from "telegraf";
import prisma from "../../prisma/prisma";
import { adminKeyboard } from "../utils/keyboards";

const adminScene = new Scenes.BaseScene("admin");

adminScene.enter(async (ctx: any) => {
  await ctx.reply("Admin paneliga xush kelibsiz!", adminKeyboard);
});

// Broadcast message handler
adminScene.hears("📢 Hamma foydalanuvchilarga xabar yuborish", async (ctx: any) => {
  ctx.session.awaitingBroadcastMessage = true;
  await ctx.reply("Yuboriladigan xabarni kiriting:");
});

// Update the broadcast message handler text
adminScene.hears("✉️ Xabar yuborish", async (ctx: any) => {
  ctx.session.awaitingBroadcastMessage = true;
  await ctx.reply("Yuboriladigan xabarni kiriting:");
});

// Add balance handler
adminScene.hears("💰 Balans to'ldirish", async (ctx: any) => {
  ctx.session.awaitingUserId = true;
  await ctx.reply("Foydalanuvchi ID raqamini kiriting:");
});

// Statistika uchun umumiy funksiya
const calculatePaymentStats = (payments: any[]) => {
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // To'lov manbalari bo'yicha soni
  const paymentSources = payments.reduce((acc: any, payment) => {
    acc[payment.source] = acc[payment.source] || { count: 0, amount: 0 };
    acc[payment.source].count += 1;
    acc[payment.source].amount += payment.amount;
    return acc;
  }, {});

  // Sof tushgan pullar (faqat ADMIN va PAYME)
  const netAmount = payments
    .filter(payment => ['ADMIN', 'PAYME'].includes(payment.source))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalAmount,
    paymentSources,
    netAmount
  };
};

// Today's statistics handler
adminScene.hears("📊 Bugungi statistika", async (ctx: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newUsers, testsCreated, payments] = await Promise.all([
    prisma.user.count({
      where: { created_at: { gte: today } }
    }),
    prisma.chat.count({
      where: { created_at: { gte: today }, type: "test" }
    }),
    prisma.payment.findMany({
      where: { created_at: { gte: today }, type: "RECEIVED", status:"APPROVED" }
    })
  ]);

  const stats = calculatePaymentStats(payments);

  const statsMessage = `📊 Bugungi statistika:

👥 Yangi foydalanuvchilar: ${newUsers}
📝 Yaratilgan testlar: ${testsCreated}
💰 To'lovlar soni: ${payments.length}
💵 Umumiy Summa: ${stats.totalAmount} so'm

To'lov manbalari:
${Object.entries(stats.paymentSources)
  .map(([source, data]: [string, any]) => 
    `${source}: ${data.count} ta - ${data.amount} so'm`
  )
  .join('\n')}

💹 Sof tushum (Admin va Payme): ${stats.netAmount} so'm`;

  await ctx.reply(statsMessage);
});

// Umumiy va oylik statistika uchun ham shu formatni qo'llaymiz
adminScene.hears("📈 Umumiy statistika", async (ctx: any) => {
  const [totalUsers, totalTests, payments] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count({ where: { type: "test" } }),
    prisma.payment.findMany({ where: { type: "RECEIVED", status:"APPROVED" } })
  ]);

  const stats = calculatePaymentStats(payments);

  const statsMessage = `📈 Umumiy statistika:

👥 Jami foydalanuvchilar: ${totalUsers}
📝 Jami yaratilgan testlar: ${totalTests}
💰 Jami to'lovlar soni: ${payments.length}
💵 Umumiy Summa: ${stats.totalAmount} so'm

To'lov manbalari:
${Object.entries(stats.paymentSources)
  .map(([source, data]: [string, any]) => 
    `${source}: ${data.count} ta - ${data.amount} so'm`
  )
  .join('\n')}

💹 Sof tushum (Admin va Payme): ${stats.netAmount} so'm`;

  await ctx.reply(statsMessage);
});

adminScene.hears("📅 Bu oygi statistika", async (ctx: any) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthlyUsers, monthlyTests, payments] = await Promise.all([
    prisma.user.count({
      where: { created_at: { gte: startOfMonth } }
    }),
    prisma.chat.count({
      where: { created_at: { gte: startOfMonth }, type: "test" }
    }),
    prisma.payment.findMany({
      where: { created_at: { gte: startOfMonth }, type: "RECEIVED", status:"APPROVED" }
    })
  ]);

  const stats = calculatePaymentStats(payments);

  const today = new Date();
  const startDateStr = `${startOfMonth.getDate()}-${startOfMonth.getMonth() + 1}-${startOfMonth.getFullYear()}`;
  const endDateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

  const statsMessage = `📅 ${startDateStr} dan ${endDateStr} gacha bo'lgan statistika:

👥 Yangi foydalanuvchilar: ${monthlyUsers}
📝 Yaratilgan testlar: ${monthlyTests}
💰 To'lovlar soni: ${payments.length}
💵 Umumiy Summa: ${stats.totalAmount} so'm

To'lov manbalari:
${Object.entries(stats.paymentSources)
  .map(([source, data]: [string, any]) => 
    `${source}: ${data.count} ta - ${data.amount} so'm`
  )
  .join('\n')}

💹 Sof tushum (Admin va Payme): ${stats.netAmount} so'm`;

  await ctx.reply(statsMessage);
});

// Handle text messages for broadcast
adminScene.on("text", async (ctx: any) => {
  if (ctx.session.awaitingBroadcastMessage) {
    ctx.session.broadcastMessage = ctx.message.text;
    ctx.session.awaitingBroadcastMessage = false;
    
    const confirmBroadcastKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback("✅ Tasdiqlash", "confirm_broadcast")],
      [Markup.button.callback("❌ Bekor qilish", "cancel_broadcast")]
    ]);

    await ctx.reply(
      `Ushbu xabarni yuborishni tasdiqlaysizmi?\n\n${ctx.session.broadcastMessage}`,
      confirmBroadcastKeyboard
    );
  } else if (ctx.session.awaitingUserId) {
    ctx.session.userId = ctx.message.text;
    ctx.session.awaitingUserId = false;
    ctx.session.awaitingAmount = true;
    await ctx.reply("Qo'shiladigan pul miqdorini kiriting (so'm):");
  } else if (ctx.session.awaitingAmount) {
    const amount = parseInt(ctx.message.text);
    if (isNaN(amount)) {
      await ctx.reply("Iltimos, to'g'ri raqam kiriting");
      return;
    }

    ctx.session.amount = amount;
    ctx.session.awaitingAmount = false;

    const confirmKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback("✅ Tasdiqlash", "confirm_balance")],
      [Markup.button.callback("❌ Bekor qilish", "cancel_balance")]
    ]);

    await ctx.reply(
      `Quyidagi ma'lumotlarni tasdiqlaysizmi?\n\nID: ${ctx.session.userId}\nPul miqdori: ${amount} so'm`,
      confirmKeyboard
    );
  }
});

// Broadcast confirmation action
adminScene.action("confirm_broadcast", async (ctx: any) => {
  try {
    const users = await prisma.user.findMany();
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await ctx.telegram.sendMessage(user.telegram_id, ctx.session.broadcastMessage);
        successCount++;
        if (successCount % 30 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        failCount++;
      }
    }

    await ctx.editMessageText(
      `Xabar yuborish yakunlandi:\n✅ Muvaffaqiyatli: ${successCount}\n❌ Muvaffaqiyatsiz: ${failCount}`
    );
    
    delete ctx.session.broadcastMessage;
    delete ctx.session.awaitingBroadcastMessage;
    
  } catch (error) {
    await ctx.reply("Xabar yuborishda xatolik yuz berdi");
  }
});

// Cancel broadcast action
adminScene.action("cancel_broadcast", async (ctx: any) => {
  delete ctx.session.broadcastMessage;
  delete ctx.session.awaitingBroadcastMessage;
  await ctx.editMessageText("Xabar yuborish bekor qilindi");
});

// Add balance confirmation handler
adminScene.action("confirm_balance", async (ctx: any) => {
  try {
    const user = await prisma.user.findFirst({
      where: { telegram_id: ctx.session.userId }
    });

    if (!user) {
      await ctx.editMessageText("Foydalanuvchi topilmadi!");
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: ctx.session.amount } }
      }),
      prisma.payment.create({
        data: {
          user_id: user.id,
          amount: ctx.session.amount,
          type: "RECEIVED",
          source: "ADMIN",
          status: "APPROVED"
        }
      })
    ]);

    await ctx.telegram.sendMessage(
      user.telegram_id,
      `Hisobingizga ${ctx.session.amount} so'm qo'shildi!`
    );

    await ctx.editMessageText("Balans muvaffaqiyatli qo'shildi!");

    delete ctx.session.userId;
    delete ctx.session.amount;
  } catch (error) {
    console.error("Balance addition error:", error);
    await ctx.editMessageText("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
});

// Add balance cancellation handler
adminScene.action("cancel_balance", async (ctx: any) => {
  delete ctx.session.userId;
  delete ctx.session.amount;
  await ctx.editMessageText("Balans qo'shish bekor qilindi");
});

export default adminScene; 