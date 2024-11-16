require("dotenv").config();
import { Context, Middleware, Scenes } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import bot from "./core/bot";
import session from "./core/session";
import stage from "./scenes/index";
import { mainKeyboard, paymentOptionsKeyboard, cardPaymentOptionsKeyboard } from "./utils/keyboards";
import botStart from "./utils/startBot";
import prisma from "../prisma/prisma";
import { subcribeFunk } from "./utils/subcribe";

bot.use(session);

const middleware: Middleware<Context | SceneContext> = (
  ctx: any,
  next: any
) => {
  ctx?.session ?? (ctx.session = {});
};

bot.use(stage.middleware());

bot.use((ctx: any, next: any) => {
  console.log("next", ctx?.session);
  return next();
});

bot.use(subcribeFunk);
bot.start(async (ctx: any) => {
  return await ctx.scene.enter("start");
});

bot.hears("Bosh menyu", async (ctx: any) => {
  await ctx.reply("Asosiy menyuga qaytdingiz.", mainKeyboard);
});

bot.hears(
  ["Yangi Taqdimot", "Balans", "Do'stlarimni taklif qilish"],
  async (ctx: any) => {
    ctx.reply("Nomalum buyruq.Qayta /start buyrug'ini bosing");
  }
);

bot.hears("📝 Test yaratish", async (ctx: any) => {
  await ctx.scene.enter("testCreation");
});

bot.hears("💰 Balans", async (ctx: any) => {
  await ctx.scene.enter("balance");
});

bot.hears("📄 Qo'shimcha xizmatlar", async (ctx: any) => {
  await ctx.reply("Qo'shimcha xizmatlar haqida ma'lumot.");
});

bot.hears("Foydali botlar", async (ctx: any) => {
  await ctx.reply("Foydali botlar ro'yxati.");
});

bot.catch(async (err: any, ctx) => {
  const userId = ctx?.from?.id;
  if (userId) {
    await bot.telegram.sendMessage(
      userId,
      "Xatolik yuz berdi. Iltimos qayta urinib ko'ring\n /start buyrug'ini bosib qayta urunib ko'ring"
    );
  }

  console.log(err);
  console.log(`Ooops, encountered an error for ${ctx}`, err);
});

botStart(bot);

process.on("uncaughtException", (error) => {
  console.log("Ushlanmagan istisno:", error, "Sabab:", new Date());
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Ushlanmagan rad etilgan va'da:", promise, "Sabab:", new Date());
});

bot.use((ctx: any, next: any) => {
  if (ctx.message && ctx.message.text) {
    const text = ctx.message.text;
    if (text === "📝 Test yaratish") {
      return ctx.scene.enter("testCreation");
    } else if (text === "💰 Balans") {
      return ctx.scene.enter("balance");
    } else if (text === " Qo'shimcha xizmatlar") {
      return ctx.reply("Qo'shimcha xizmatlar haqida ma'lumot.");
    } else if (text === "Foydali botlar") {
      return ctx.reply("Foydali botlar ro'yxati.");
    }
  }
  return next();
});

bot.action("payme", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("To'lov shakli: PAYME\nQancha to'lov qilmoqchisiz?", paymentOptionsKeyboard);
});

bot.action("card", async (ctx: any) => {
  await ctx.deleteMessage();
  const paymentInfo = `
❗ Eng kamida 5000 so'm to'lov qiling, 5000 dan kam summalar bilan muammo bo'lishi mumkin.

💳 8600 0417 7483 8644
👤 Abdulaliev Boburmirzo

Ushbu karta raqamiga to'lov qiling va quyidagi tugmani bosing yoki /chek ni yuboring!
  `;
  await ctx.reply(paymentInfo, cardPaymentOptionsKeyboard);
});

// Handle back action
bot.action("back", async (ctx: any) => {
  await ctx.deleteMessage();
  await ctx.scene.enter("balance");
});

