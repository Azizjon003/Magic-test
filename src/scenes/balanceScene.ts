import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { balanceKeyboard, paymentKeyboard } from "../utils/keyboards";

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

balanceScene.action("referal", async (ctx: any) => {
  await ctx.deleteMessage();
  const botUsername = ctx.botInfo.username; // Bot username ni ctx.botInfo dan olish
  const referralLink = `https://t.me/${botUsername}?start=${ctx.from.id}`;
  const message = `Do'stlaringizni taklif qiling va bonus oling! 🎉\n\nSizning referal havolangiz: [Referal Link](${referralLink})`;

  await ctx.replyWithMarkdown(message);
});

balanceScene.action("buy", async (ctx: any) => {
  await ctx.deleteMessage();
  const paymentMessage =
    "Qaysi usulda to'lov qilmoqchisiz? ❓ Quyidagi tugmalardan foydalaning 👇";
  await ctx.reply(paymentMessage, paymentKeyboard);
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
