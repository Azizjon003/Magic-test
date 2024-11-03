import { Scenes } from "telegraf";
import { languageKeyboard, questionsKeyboard, backToMainMenuKeyboard, mainKeyboard } from "../utils/keyboards";

const testCreationScene = new Scenes.BaseScene("testCreation");

testCreationScene.enter(async (ctx) => {
  await ctx.reply("Test mavzusini kiriting:");
});

testCreationScene.on("text", async (ctx: any) => {
  ctx.session.testTopic = ctx.message.text;
  await ctx.reply("Test uchun tilni tanlang:", languageKeyboard);
});

testCreationScene.action(/lang_(.+)/, async (ctx: any) => {
  const language = ctx.match[1];
  ctx.session.language = language;
  await ctx.editMessageText(`Til tanlandi: ${ctx.match.input.split('_')[1]}`);
  await ctx.reply("Savollar sonini tanlang:", questionsKeyboard);
});

testCreationScene.action(/questions_(\d+)/, async (ctx: any) => {
  const numberOfQuestions = ctx.match[1];
  ctx.session.numberOfQuestions = numberOfQuestions;

  const message = `
📝 Test haqida:
Til: 🇺🇿 O'zbek
Savollar: ${numberOfQuestions} ta

🔖 Mavzu: ${ctx.session.testTopic}

Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz. Sabr qilganingiz uchun rahmat!
  `;

  await ctx.editMessageText(`Savollar soni tanlandi: ${numberOfQuestions}`);
  await ctx.reply(message, mainKeyboard);
  await ctx.scene.leave();
});

export default testCreationScene;
