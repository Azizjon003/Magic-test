import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { processPayment } from "../services/payment.service";
import {
  balanceKeyboard,
  cardPaymentOptionsKeyboard,
  paymentKeyboard,
  paymentOptionsKeyboard,
} from "../utils/keyboards";

const balanceScene = new Scenes.BaseScene("balance");

balanceScene.enter(async (ctx: any) => {
  const userId = ctx.from?.id;

  // Fetch user balance from the database
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(userId),
    },
  });

  if (user) {
    const balanceMessage = `
💰 Balansingiz: ${user.balance} so'm
/referal - do'stlarni taklif qilib balansni to'ldirish✏️
/my - barcha ma'lumotlaringiz.

Balansingizda pul qolmagan. Balansingizni 2xil usulda to'ldirishingiz mumkin:
1. Bepul - /referal buyrug'ini yuboring, do'stlaringizni taklif qiling. Har bir botga qo'shilgan do'stingiz uchun 1000 so'mdan oling!
2. To'lov usulida - /buy buyrug'ini yuboring va kartaga to'lov qilib chekni yuboring!
    `;

    await ctx.reply(balanceMessage, balanceKeyboard);
  } else {
    await ctx.reply("Foydalanuvchi topilmadi.");
  }
});

balanceScene.action("payme", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply(
    "To'lov shakli: PAYME\nQancha to'lov qilmoqchisiz?",
    paymentOptionsKeyboard
  );
});

balanceScene.action("card", async (ctx: any) => {
  await ctx.deleteMessage();
  const paymentInfo = `
❗ Eng kamida 2000 so'm to'lov qiling,

💳 5614 6868 0954 7279
👤 Aliqulov Azizjon

Ushbu karta raqamiga to'lov qiling va @aliqulov_a03 chekni quyidagi adminimizga yuboring!
  `;
  await ctx.reply(paymentInfo, cardPaymentOptionsKeyboard);
});

// Handle back action
balanceScene.action("back", async (ctx: any) => {
  await ctx.deleteMessage();
  await ctx.scene.enter("balance");
});

balanceScene.action("referal", async (ctx: any) => {
  console.log("Referal action triggered");
  await ctx.deleteMessage();
  const botUsername = ctx.botInfo.username; // Bot username ni ctx.botInfo dan olish
  const referralLink = `https://t.me/${botUsername}?start=${ctx.from.id}`;
  const message = `Do'stlaringizni taklif qiling va bonus oling! 🎉\n\nSizning referal havolangiz: [Referal Link](${referralLink})`;
  const shareLink = `https://telegram.me/share/url?url=${referralLink}`;
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "👥 Do'stlarni taklif qilish",
          url: shareLink,
        },
      ],
    ],
  };

  await ctx.replyWithMarkdown(message, {
    reply_markup: inlineKeyboard,
    disable_web_page_preview: true,
  });
});

balanceScene.action("buy", async (ctx: any) => {
  await ctx.deleteMessage();
  const paymentMessage =
    "Qaysi usulda to'lov qilmoqchisiz? ❓ Quyidagi tugmalardan foydalaning 👇";
  await ctx.reply(paymentMessage, paymentKeyboard);
});

balanceScene.action(/^[0-9]+$/, async (ctx: any) => {
  try {
    const number = parseInt(ctx.callbackQuery.data);

    // Son 0 dan katta bo'lishi kerak
    if (number <= 0) {
      await ctx.reply("❌ Iltimos, 0 dan katta son kiriting!");
      return;
    }

    console.log("To'lov summasi:", number);
    ctx.reply("To'lov summasi: " + number + " so'm");
    processPayment(ctx, ctx.from.id, number);
  } catch (error) {
    console.error("Xatolik yuz berdi:", error);
    await ctx.reply("⚠️ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  }
});

balanceScene.action("send_check", async (ctx: any) => {
  await ctx.deleteMessage();
  await ctx.reply("Iltimos, to'lov chekingizni yuboring (rasm yoki fayl).");
});

balanceScene.on(["photo", "document"], async (ctx: any) => {
  const userId = ctx.from.id;
  const admins = await getAdminUserIds(); // Implement this function to fetch admin IDs from the database

  for (const adminId of admins) {
    await ctx.telegram.forwardMessage(
      adminId,
      ctx.chat.id,
      ctx.message.message_id
    );
  }

  await ctx.reply(
    "Biroz kuting adminlar sizning chekingizni ko'rib chiqadi va to'gri to'lov checki bo'lsa balansingizga pul tushiriladi bot sizga xabardor qiladi."
  );
});

async function getAdminUserIds() {
  return (await prisma.user.findMany({ where: { role: "ADMIN" } })).map(
    (user: any) => user.telegram_id
  );
}

export default balanceScene;
