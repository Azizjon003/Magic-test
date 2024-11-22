import prisma from "../../prisma/prisma";

export let subcribeFunk = async (ctx: any, next: any) => {
  try {
    console.log("handleReferral triggered");

    const action = ctx.message?.text?.split(" ")[0];
    const userId = String(ctx?.from?.id);
    let referrerId: string | null = null;

    // Agar foydalanuvchi /start bilan kirsa va referal bo'lsa
    if (action === "/start") {
      referrerId = ctx.message?.text?.split(" ")[1];

      // Referrer ID uzunligi 24dan oshsa, noto'g'ri deb hisoblaymiz
      if ((referrerId ?? "").length > 24) {
        referrerId = null;
      }

      console.log("Current User ID: ", userId);
      console.log("Referrer ID: ", referrerId);

      if (referrerId) {
        // Avval foydalanuvchini va referrerni tekshiramiz
        const isAlreadyReferred = await prisma.invitedUsers.findFirst({
          where: { user_id: userId },
        });
        const referrerExists = await prisma.user.findFirst({
          where: { telegram_id: referrerId },
        });

        if (!isAlreadyReferred && referrerExists) {
          const newUser = await prisma.user.findFirst({
            where: { telegram_id: userId },
          });

          if (!newUser) {
            console.log("Adding referral bonus...");

            try {
              // Referral yozuvini yaratish
              await prisma.invitedUsers.create({
                data: {
                  user_id: userId,
                  invited_user_id: referrerId,
                },
              });

              // Referrer balansini yangilash va to'lov yaratish
              await prisma.$transaction([
                prisma.user.update({
                  where: { telegram_id: referrerId },
                  data: { balance: { increment: 1000 } },
                }),
                prisma.payment.create({
                  data: {
                    user_id: referrerExists.id,
                    amount: 1000,
                    type: "RECEIVED",
                    source: "REFERRAL",
                    description: "Referral bonus",
                  },
                }),
              ]);

              // Referrerni xabardor qilish
              await ctx.telegram.sendMessage(
                referrerExists.telegram_id,
                "Sizning balansingizga referal orqali 1000 sum qo'shildi!"
              );

              console.log("Referral bonus added successfully.");
            } catch (error) {
              console.error("Error adding referral bonus:", error);
            }
          }
        }
      }
    }

    // Chat turini tekshirish
    const chatType = ctx.chat?.type;
    if (["channel", "supergroup", "group"].includes(chatType)) {
      return next();
    }

    const callbackData = String(ctx?.callbackQuery?.data || "");
    if (callbackData.includes("checkSubscribing")) {
      referrerId = callbackData.split("_")[1];
      await ctx.deleteMessage();
    }

    // Tekshiriladigan kanallar ro'yxati
    const channels = [
      {
        name: "Tatu1k ",
        link: "JaysonsClub",
      },
    ];

    const allowedStatuses = ["creator", "administrator", "member"];
    const remainingChannels = [];

    for (let channel of channels) {
      const username = `@${channel.link}`;
      try {
        const { status } = await ctx.telegram.getChatMember(
          username,
          ctx.from.id
        );
        if (!allowedStatuses.includes(status)) {
          remainingChannels.push(channel);
        }
      } catch (error) {
        console.error(`Error checking channel membership: ${username}`, error);
        remainingChannels.push(channel);
      }
    }

    if (!remainingChannels.length) {
      if (callbackData.includes("checkSubscribing")) {
        await ctx.reply(
          `Tabriklaymiz! Siz botdan to'liq foydalanishingiz mumkin! 🎉\n/start buyrug'ini bosing`
        );
      }
      return next();
    }

    const joinPrompt =
      "❗️ Botdan to'liq foydalanish imkoniga quyidagi kanallarga a'zo bo'lish orqali erishishingiz mumkin!";
    const keyboard: any = remainingChannels.map((channel) => [
      {
        text: `A'zo bo'lish: ${channel.name}`,
        url: `https://t.me/${channel.link}`,
      },
    ]);

    keyboard.push([
      {
        text: "Qo'shildim 🤝",
        callback_data: referrerId
          ? `checkSubscribing_${referrerId}`
          : `checkSubscribing`,
      },
    ]);

    await ctx.reply(joinPrompt, {
      reply_markup: { inline_keyboard: keyboard },
    });
  } catch (error) {
    console.error("Error in handleReferral:", error);
  }
};
