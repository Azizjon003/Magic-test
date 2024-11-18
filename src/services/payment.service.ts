import { walletRequestStatus } from "@prisma/client";
import prisma from "../../prisma/prisma";

export async function processPayment(ctx: any, tgId: any, amount: any) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(tgId),
      },
    });
    if (!user) return ctx.reply("Bu foydalanuchi mavjud emas");
    const newRequest = await prisma.payment.create({
      data: {
        amount,
        user_id: user.id,
        status: walletRequestStatus.PENDING,
      },
    });

    const res = await ctx.telegram.sendInvoice(user.telegram_id, {
      title: `Quiz market bot uchun balansni to'ldirish`,
      description: `Siz hisobingizni to\'ldirayotgan mablag' ${amount}, ~${Math.floor(
        amount / 2000
      )} ta test uchun to'g'ri keladi.To'ldirish tugmasini bosing va to'lovni amalga oshiring.`,
      payload: `id:${newRequest.id}`,
      provider_token: process.env.PROVIDER_TOKEN,
      currency: "UZS",
      photo_url:
        "https://s3.timeweb.cloud/729e17de-andasoft-buckets/magicslide/7899.png",
      // "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Paymeuz_logo.png/2560px-Paymeuz_logo.png",
      prices: [{ label: "Balans", amount: amount * 100 }],
    });

    // ctx.telegram.sendMessage(
    //   "-1002103794627",
    //   `Foydalanuvchi ${user.name} quyidagi summani to'lamoqchi bo'ldi ${
    //     amount * 100
    //   } `
    // );
  } catch (error) {
    console.error("Error processing payment:", error);
    ctx.telegram.sendMessage(
      ctx.from.id,
      "Xatolik sodir bo'ldi qayta kiriting /start ni bosing"
    );
  }
}
