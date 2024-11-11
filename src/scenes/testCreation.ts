import { Scenes } from "telegraf";
import { createWordDoc } from "../services/createWord.service";
import {
  createTestLanguage,
  modelLang,
} from "../services/testUseOpenAi.service";
import {
  confirmKeyboard,
  languageKeyboard,
  questionsKeyboard,
} from "../utils/keyboards";

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
  await ctx.editMessageText(`Til tanlandi: ${ctx.match.input.split("_")[1]}`);
  await ctx.reply("Savollar sonini tanlang:", questionsKeyboard);
});

testCreationScene.action(/questions_(\d+)/, async (ctx: any) => {
  const numberOfQuestions = ctx.match[1];
  ctx.session.numberOfQuestions = numberOfQuestions;

  const message = `
📝 Test haqida:
Til: ${ctx.session.language.toUpperCase()}
Savollar: ${numberOfQuestions} ta

🔖 Mavzu: ${ctx.session.testTopic}

Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz. Sabr qilganingiz uchun rahmat!
  `;

  await ctx.editMessageText(`Savollar soni tanlandi: ${numberOfQuestions}`);
  await ctx.reply(message, confirmKeyboard);
});

testCreationScene.action("confirm", async (ctx: any) => {
  const message =
    "2 - 5 daqiqa ichida test tayyorlanadi. Sabr qilishingizni so'raymiz!";

  await ctx.editMessageText(message);

  await ctx.sendChatAction("upload_document");
  const { testTopic, language, numberOfQuestions } = ctx.session;
  const fulLang =
    language === "en"
      ? "english"
      : language === "uz"
      ? "uzbek"
      : language === "ru"
      ? "russian"
      : language === "ko"
      ? "korean"
      : language === "fr"
      ? "french"
      : language === "de"
      ? "german"
      : language === "es"
      ? "spanish"
      : "english";

  const data = await createTestLanguage(
    testTopic,
    numberOfQuestions,
    language,
    fulLang,
    numberOfQuestions,
    modelLang.gpt3
  );

  const testCreateBuffer = await createWordDoc(data);

  const id = Math.floor(Math.random() * 1000000);
  await ctx.replyWithDocument({
    source: testCreateBuffer,
    filename: `${id}.docx`,
  });
});

export default testCreationScene;
