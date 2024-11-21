import axios from "axios";
import fs from "fs";
import path from "path";
import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createTestFile, createTests } from "../services/createTestAnd.service";
import { readPdfText } from "../services/pdf.service";
import {
  confirmKeyboard,
  confirmKeyboard2,
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
  await ctx.reply("Savollar sonini tanlang:", questionsKeyboard);
});

testCreationScene.action(/questions_(\d+)/, async (ctx: any) => {
  if (!ctx.session.language) {
    await ctx.reply("Avval tilni tanlang:", languageKeyboard);
    return;
  }

  const numberOfQuestions = parseInt(ctx.match[1]);
  ctx.session.numberOfQuestions = numberOfQuestions;

  const message = `
 📝 Test haqida:
 Til: ${ctx.session.language.toUpperCase()}
 Savollar: ${numberOfQuestions} ta
 🔖 Mavzu: ${ctx.session.testTopic}
 
 Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz.
 `;

  await ctx.editMessageText(message, confirmKeyboard);
});

// testCreationScene.action("confirm", async (ctx: any) => {
//   const message =
//     "2 - 5 daqiqa ichida test tayyorlanadi. Sabr qilishingizni so'raymiz!";

//   await ctx.editMessageText(message);

//   await ctx.sendChatAction("upload_document");
//   const { testTopic, language, numberOfQuestions } = ctx.session;
//   const fulLang =
//     language === "en"
//       ? "english"
//       : language === "uz"
//       ? "uzbek"
//       : language === "ru"
//       ? "russian"
//       : language === "ko"
//       ? "korean"
//       : language === "fr"
//       ? "french"
//       : language === "de"
//       ? "german"
//       : language === "es"
//       ? "spanish"
//       : "english";

//   const data = await createTestLanguage(
//     testTopic,
//     numberOfQuestions,
//     language,
//     fulLang,
//     numberOfQuestions,
//     modelLang.gpt3
//   );

//   const testCreateBuffer = await createWordDoc(data);

//   const id = Math.floor(Math.random() * 1000000);
//   await ctx.replyWithDocument({
//     source: testCreateBuffer,
//     filename: `${id}.docx`,
//   });
// });

testCreationScene.action("confirm", async (ctx: any) => {
  try {
    const message =
      "2 - 5 daqiqa ichida test tayyorlanadi. Sabr qilishingizni so'raymiz!";
    await ctx.editMessageText(message);
    await ctx.sendChatAction("upload_document");

    const { testTopic, language, numberOfQuestions } = ctx.session;
    const telegram_id = ctx.from.id.toString();

    // Foydalanuvchini bazadan topish
    const user = await prisma.user.findUnique({
      where: { telegram_id },
    });

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }

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

    // Chat yaratish
    const chat = await prisma.chat.create({
      data: {
        name: testTopic,
        user_id: user.id,
        language: language,
        lang: fulLang,
        type: "test",
        pageCount: Number(numberOfQuestions),
      },
    });

    createTests(ctx, chat, testTopic, numberOfQuestions, language);
    // const data = await createTestLanguage(
    //   testTopic,
    //   numberOfQuestions,
    //   language,
    //   fulLang,
    //   numberOfQuestions,
    //   modelLang.gpt3
    // );
    // console.log(data);
    // // Description yaratish
    // await prisma.description.create({
    //   data: {
    //     name: testTopic,
    //     content: JSON.parse(JSON.stringify(data)), // JSON array
    //     plan_id: "test_" + Date.now(),
    //     chat_id: chat.id,
    //   },
    // });

    // const testCreateBuffer = await createWordDoc(data);
    // const id = Math.floor(Math.random() * 1000000);

    // await ctx.replyWithDocument({
    //   source: testCreateBuffer,
    //   filename: `${id}.docx`,
    // });

    // // To'lov yozish (agar pullik bo'lsa)
    // if (testTopic !== "free") {
    //   // Foydalanuvchi balansini yangilash
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { balance: { decrement: 2000 } },
    // });
    // }
  } catch (error) {
    console.error("Test creation error:", error);
    await ctx.reply("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
  }
});

testCreationScene.action("confirm_file", async (ctx: any) => {
  try {
    const message =
      "2 - 5 daqiqa ichida test tayyorlanadi. Sabr qilishingizni so'raymiz!";
    await ctx.editMessageText(message);
    await ctx.sendChatAction("upload_document");

    const { testTopic, language, numberOfQuestions } = ctx.session;
    const telegram_id = ctx.from.id.toString();

    // Foydalanuvchini bazadan topish
    const user = await prisma.user.findUnique({
      where: { telegram_id },
    });

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }

    const chat = await prisma.chat.findFirst({
      where: {
        user_id: user.id,
      },
      include: {
        description: true,
        fileText: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!chat) {
      return ctx.reply("Chat topilmadi");
    }

    // const fileContent = chat.fileText[0].content;

    // const data = await createByFileTest(
    //   testTopic,
    //   numberOfQuestions,
    //   language,
    //   String(chat.lang),
    //   numberOfQuestions,
    //   fileContent
    // );

    // await prisma.description.create({
    //   data: {
    //     name: testTopic,
    //     content: JSON.parse(JSON.stringify(data)), // JSON array
    //     plan_id: "test_" + Date.now(),
    //     chat_id: chat.id,
    //   },
    // });

    // const testCreateBuffer = await createWordDoc(data);
    // const id = Math.floor(Math.random() * 1000000);

    // await ctx.replyWithDocument({
    //   source: testCreateBuffer,
    //   filename: `${id}.docx`,
    // });
    createTestFile(ctx, chat, testTopic, numberOfQuestions, language);
  } catch (error) {
    console.error("Test creation error:", error);
    await ctx.reply("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
  }
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
  const users = await prisma.user.findUnique({
    where: { telegram_id: user.id.toString() },
  });

  if (!users) {
    return ctx.reply("Foydalanuvchi topilmadi");
  }
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

    const { testTopic, language, numberOfQuestions } = ctx.session;

    // Foydalanuvchini bazadan topish

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

    // Chat yaratish
    const chat = await prisma.chat.create({
      data: {
        name: testTopic,
        user_id: users.id,
        language: language,
        lang: fulLang,
        type: "test",
        pageCount: Number(numberOfQuestions),
      },
    });

    await prisma.fileText.create({
      data: {
        name: document.file_name,
        content: textFile,
        user_id: users.id,
        chat_id: chat.id,
      },
    });

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

    const message = `
    📝 Test haqida:
    Til: ${ctx.session.language.toUpperCase()}
    Savollar: ${numberOfQuestions} ta
    🔖 Mavzu: ${ctx.session.testTopic}
    Fayl: ${document.file_name}
    
    Eslatma: Buyurtmangiz tayyorlash jarayonida! 2-5 daqiqa ichida tayyor faylni yuboramiz.
    `;

    await ctx.reply(message, confirmKeyboard2);
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
  await ctx.deleteMessage();
  await ctx.reply("Yangi test mavzusini kiriting:");
  ctx.session.isChangingTopic = true; // Mavzu o'zgartirilayotganini belgilash
});

// Mavzu o'zgartirilganda

// Lang va Questions actionlarida ham summary xabarni yangilash

export default testCreationScene;
