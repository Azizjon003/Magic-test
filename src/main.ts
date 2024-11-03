require("dotenv").config();
import { Context, Middleware } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import bot from "./core/bot";
import session from "./core/session";
import stage from "./scenes/index";
import botStart from "./utils/startBot";
import { mainKeyboard } from "./utils/keyboards";

bot.use(session);

const middleware: Middleware<Context | SceneContext> = (ctx: any, next: any) => {
  ctx?.session ?? (ctx.session = {});
};

bot.use(stage.middleware());

bot.use((ctx: any, next: any) => {
  console.log("next", ctx?.session);
  return next();
});

bot.start(async (ctx: any) => {
  return await ctx.scene.enter("start");
});

bot.hears("Bosh menyu", async (ctx: any) => {
  await ctx.reply("Asosiy menyuga qaytdingiz.", mainKeyboard);
});

bot.hears("📝 Test yaratish", async (ctx: any) => {
  await ctx.scene.enter("testCreation");
});

bot.hears(
  ["Yangi Taqdimot", "Balans", "Do'stlarimni taklif qilish"],
  async (ctx: any) => {
    ctx.reply("Nomalum buyruq.Qayta /start buyrug'ini bosing");
  }
);

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
