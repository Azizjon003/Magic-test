require("dotenv").config();
import console from "console";
import { Context, Middleware } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import prisma from "../prisma/prisma";
import bot from "./core/bot";
import session from "./core/session";
import stage from "./scenes/index";
import { mainKeyboard } from "./utils/keyboards";
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

bot.on("pre_checkout_query", async (ctx: any) => {
  try {
    const user_id = ctx.from.id;
    console.log(ctx.update);
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(user_id),
      },
    });

    if (!user) {
      return ctx.answerPreCheckoutQuery(
        false,
        "Balansingizni tekshiring balansingiz topilmadi"
      );
    }
    // return ctx.answerPreCheckoutQuery(false, "Foydalanuvchi topilmadi");

    const wallet = await prisma.payment.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!wallet) {
      // return ctx.answerPreCheckoutQuery(
      //   false,
      //   "Balansingizni tekshiring balansingiz topilmadi"
      // );
      return ctx.answerPreCheckoutQuery(
        false,
        "Balansingizni tekshiring balansingiz topilmadi"
      );
      // return bot.telegram.sendMessage(
      //   user_id,
      //   "Balansingizni tekshiring balansingiz topilmadi"
      // );
    }

    const amount = ctx.update.pre_checkout_query.total_amount / 100;
    // const newRequest = await prisma.walletRequest.findFirst({
    //   where: {
    //     id: ctx.update.message.successful_payment.invoice_payload.split(":")[1],
    //     status: "PENDING",
    //   },
    // });

    let newRequest = await prisma.payment.findFirst({
      where: {
        user_id: user.id,
        status: "PENDING",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!newRequest) {
      return ctx.answerPreCheckoutQuery(false, "To'lov so'rovi topilmadi");
      // return ctx.answerPreCheckoutQuery(false, "To'lov so'rov topilmadi");
    }

    if (amount !== newRequest.amount) {
      return ctx.answerPreCheckoutQuery(false, "To'lov so'rovi topilmadi");
      // return bot.telegram.sendMessage(user.id, "To'lov so'rov topilmadi");
    }

    await bot.telegram.sendMessage(
      "-4509389908",
      `Foydalanuvchi ${user.name} userId ${user.telegram_id} so'rovni precheckout ga o'tkazdi ${amount} `
    );
    return ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    console.log(error);
  }
});

bot.on("successful_payment", async (ctx: any) => {
  try {
    console.log(
      ctx.update.message.successful_payment,
      "successful payment",
      "users"
    );
    const user_id = ctx.from.id;
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(user_id),
      },
    });

    if (!user) {
      return bot.telegram.sendMessage(user_id, "Foydalanuvchi topilmadi");
    }
    // return ctx.answerPreCheckoutQuery(false, "Foydalanuvchi topilmadi");

    const wallet = await prisma.payment.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!wallet) {
      // return ctx.answerPreCheckoutQuery(
      //   false,
      //   "Balansingizni tekshiring balansingiz topilmadi"
      // );

      return bot.telegram.sendMessage(
        user_id,
        "Balansingizni tekshiring balansingiz topilmadi"
      );
    }

    const amount = ctx.update.message.successful_payment.total_amount / 100;
    // const newRequest = await prisma.walletRequest.findFirst({
    //   where: {
    //     id: ctx.update.message.successful_payment.invoice_payload.split(":")[1],
    //     status: "PENDING",
    //   },
    // });

    let newRequest = await prisma.payment.findFirst({
      where: {
        user_id: user.id,
        status: "PENDING",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!newRequest) {
      return bot.telegram.sendMessage(user_id, "To'lov so'rov topilmadi");
      // return ctx.answerPreCheckoutQuery(false, "To'lov so'rov topilmadi");
    }

    if (amount !== newRequest.amount) {
      return bot.telegram.sendMessage(user.id, "To'lov so'rov topilmadi");
      // return await ctx.answerPreCheckoutQuery(false, "To'lov summasi noto'g'ri");
    }

    // let amountId = await prisma.walletRequest.findFirst({
    //   where: {
    //     id: newRequest.id,
    //   },

    // });

    let amountId = await prisma.payment.update({
      where: {
        id: newRequest.id,
      },
      data: {
        status: "APPROVED",
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        balance: user.balance + amount,
      },
    });

    // await ctx.answerPreCheckoutQuery(true, "To'lov qabul qilindi");

    // await bot.telegram.sendMessage(
    //   user_id,
    //   "To'lov qabul qilindi. Balansingizga " +
    //     amount +
    //     " so'm qo'shildi\n Qayta /start buyrug'ini bosib botni ishlatishingiz mumkin"
    // );

    // bot.telegram.deleteMessage(
    //   user_id,
    //   parseInt(String(amountId.message_id)) || ctx.message.message_id - 1
    // );
    await bot.telegram.sendMessage(
      "-4509389908",
      `Foydalanuvchi ${user.name} userId ${user.telegram_id}  so'rovni to'lov qildi ${amount} `
    );
    return await ctx.scene.enter("start");
  } catch (error) {
    console.log(error);
  }
});

bot.catch(async (err: any, ctx) => {
  const userId = ctx?.from?.id;
  if (userId) {
    await bot.telegram.sendMessage(
      userId,
      "Xatolik yuz berdi. Iltimos qayta urinib ko'ring\n 5 daqiqadan so'ng /start buyrug'ini bosib qayta urunib ko'ring"
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
