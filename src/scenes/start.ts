import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import { mainKeyboard, adminKeyboard } from "../utils/keyboards";
const scene = new Scenes.BaseScene("start");

scene.enter(async (ctx: any) => {
  const user_id = ctx.from?.id;

  const user_name = ctx.from?.first_name || ctx.from?.username;

  const enable = await enabled(String(user_id), String(user_name));

  if (enable === "one" || enable === "four") {
    ctx.telegram.sendMessage(
      user_id,
      "Assalomu alaykum! Test botga xush kelibsiz! 🎉\n\n" +
        "Sizga kerakli testlarni tez va oson tayyorlashda yordam beraman. " +
        'Boshlash uchun "Test yaratish" tugmasini bosing!\n\n' +
        "Biz bilan dars tayyorlash endi judayam tez va oson!",
      mainKeyboard
    );

    return await ctx.scene.enter("control");
  } else if (enable === "two") {
    const text = "Assalomu alaykum Admin xush kelibsiz";
    ctx.telegram.sendMessage(user_id, text, adminKeyboard);
    return await ctx.scene.enter("admin");
  } else if (enable === "three") {
    ctx.telegram.sendMessage(
      user_id,
      "Assalomu alaykum.Kechirasiz siz admin tomonidan bloklangansiz"
    );
    return;
  }
});

export default scene;
