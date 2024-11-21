import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
const scene = new Scenes.BaseScene("control");

scene.hears("/start", async (ctx: any) => {
  await ctx.scene.leave();
  return await ctx.scene.enter("start");
});
scene.hears("📝 Test yaratish", async (ctx: any) => {
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  if (!user) {
    return ctx.reply("Foydalanuvchi topilmadi");
  }

  if (user.balance < 2000) {
    return ctx.reply(
      "Balansingizda yetarli mablag' mavjud emas.Test yaratish uchun balansingizni to'ldiring "
    );
  }

  await ctx.scene.enter("testCreation");
});

scene.hears("💰 Balans", async (ctx: any) => {
  await ctx.scene.enter("balance");
});

export default scene;
