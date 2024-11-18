require("dotenv").config();
import console from "console";
import { Context, Middleware } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import bot from "./core/bot";
import session from "./core/session";
import stage from "./scenes/index";
import {
  cardPaymentOptionsKeyboard,
  mainKeyboard,
  paymentOptionsKeyboard,
} from "./utils/keyboards";
import botStart from "./utils/startBot";
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

bot.command("referal", async (ctx: any) => {
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
