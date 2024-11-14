import axios from "axios";
import fs from "fs";
import path from "path";
import { Scenes } from "telegraf";
import { createWordDoc } from "../services/createWord.service";
import { readPdfText } from "../services/pdf.service";
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

testCreationScene.hears("/start", async (ctx: any) => {
  return ctx.scene.enter("start");
});

testCreationScene.on("text", async (ctx: any) => {
  if (ctx.session.isChangingTopic) {
    ctx.session.testTopic = ctx.message.text;
    ctx.session.isChangingTopic = false;

    const message = `
📝 Yangilangan test haqida:
Til: ${ctx.session.language.toUpperCase()}
Savollar: ${ctx.session.numberOfQuestions} ta
🔖 Mavzu: ${ctx.session.testTopic}

Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz.
    `;

    await ctx.reply(message, confirmKeyboard);
  } else {
    // Mavjud text handler logikasi
    ctx.session.testTopic = ctx.message.text;
    await ctx.reply("Test uchun tilni tanlang:", languageKeyboard);
  }
});
testCreationScene.action(/lang_(.+)/, async (ctx: any) => {
  const language = ctx.match[1];
  ctx.session.language = language;
  await ctx.editMessageText(`Til tanlandi: ${ctx.match.input.split("_")[1]}`);

  const message = `
📝 Yangilangan test haqida:
Til: ${language.toUpperCase()}
Savollar: ${ctx.session.numberOfQuestions} ta
🔖 Mavzu: ${ctx.session.testTopic}

Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz.
  `;

  await ctx.reply(message, confirmKeyboard);
});
testCreationScene.action(/questions_(\d+)/, async (ctx: any) => {
  const numberOfQuestions = ctx.match[1];
  ctx.session.numberOfQuestions = numberOfQuestions;

  const message = `
📝 Yangilangan test haqida:
Til: ${ctx.session.language.toUpperCase()}
Savollar: ${numberOfQuestions} ta
🔖 Mavzu: ${ctx.session.testTopic}

Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz.
  `;

  await ctx.editMessageText(message, confirmKeyboard);
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

testCreationScene.action("file", async (ctx: any) => {
  const message =
    "Fayldan test tuzish uchun bizga 10mb gacha bo'lgan pdf fayl yuboring ";

  await ctx.editMessageText(message);
  ctx.session.expectingPDF = true;
});

testCreationScene.on("document", async (ctx: any) => {
  if (!ctx.session.expectingPDF) {
    return;
  }

  const document = ctx.message.document;
  const user = ctx.from; // Foydalanuvchi ma'lumotlarini olish

  // Check if the file is PDF
  if (!document.mime_type || document.mime_type !== "application/pdf") {
    await ctx.reply(
      "Iltimos, faqat PDF formatdagi fayllarni yuborishingiz mumkin!"
    );
    return;
  }

  // Check file size (10MB = 10 * 1024 * 1024 bytes)
  if (document.file_size > 10 * 1024 * 1024) {
    await ctx.reply("Fayl hajmi 10MB dan oshmasligi kerak!");
    return;
  }

  try {
    // Get file link
    const file = await ctx.telegram.getFile(document.file_id);
    const fileLink = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${document.file_name}`;
    const filePath = path.join(uploadsDir, fileName);

    // Download file
    const response = await axios({
      method: "get",
      url: fileLink,
      responseType: "stream",
    });

    // Save file to uploads directory
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Save file path to session
    ctx.session.pdfFilePath = filePath;
    ctx.session.expectingPDF = false;
    const textFile = await readPdfText(filePath);

    if (!textFile) {
      await ctx.reply(
        "Faylni o'qishda xatolik yuz berdi.Boshqa fayl yuboring."
      );
      return;
    }

    // Kanalga yuborish uchun xabar tayyorlash
    const channelMessage = `
📄 Yangi PDF fayl yuklandi!

👤 Yuboruvchi: ${user.first_name} ${user.last_name || ""}
🆔 ID: ${user.id}
📱 Username: @${user.username || "mavjud emas"}
⏰ Vaqt: ${new Date().toLocaleString()}
📎 Fayl nomi: ${document.file_name}
📦 Fayl hajmi: ${(document.file_size / 1024 / 1024).toFixed(2)}MB
    `;

    // Faylni kanalga yuborish
    try {
      await ctx.telegram.sendDocument(
        process.env.CHANNEL_ID,
        document.file_id,
        {
          caption: channelMessage,
        }
      );
    } catch (channelError) {
      console.error("Error sending to channel:", channelError);
      // Kanalga yuborishdagi xato botning ishlashiga ta'sir qilmasligi kerak
    }

    console.log("PDF text:", textFile);

    await ctx.reply(
      "PDF fayl muvaffaqiyatli yuklandi. Endi test uchun tilni tanlang:",
      languageKeyboard
    );
  } catch (error) {
    console.error("Error processing PDF file:", error);
    await ctx.reply(
      "Faylni qayta ishlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
    );
  }
});

// Savollar sonini o'zgartirish uchun
testCreationScene.action("change_questions", async (ctx) => {
  await ctx.editMessageText(
    "Yangi savollar sonini tanlang:",
    questionsKeyboard
  );
});

// Tilni o'zgartirish uchun
testCreationScene.action("change_language", async (ctx) => {
  await ctx.editMessageText("Yangi tilni tanlang:", languageKeyboard);
});

// Mavzuni o'zgartirish uchun
testCreationScene.action("change_topic", async (ctx: any) => {
  await ctx.reply("Yangi test mavzusini kiriting:");
  ctx.session.isChangingTopic = true; // Mavzu o'zgartirilayotganini belgilash
});

// Mavzu o'zgartirilganda

// Lang va Questions actionlarida ham summary xabarni yangilash

export default testCreationScene;
