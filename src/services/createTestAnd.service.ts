import prisma from "../../prisma/prisma";
import { createWordDoc } from "./createWord.service";
import { createByFileTest, createTestLanguage } from "./testUseOpenAi.service";

export async function createTests(
  ctx: any,
  chat: any,
  testTopic: any,
  numberOfQuestions: any,
  language: any
) {
  try {
    const data = await createTestLanguage(
      testTopic,
      numberOfQuestions,
      language,
      String(chat.lang),
      numberOfQuestions
    );

    await prisma.description.create({
      data: {
        name: testTopic,
        content: JSON.parse(JSON.stringify(data)), // JSON array
        plan_id: "test_" + Date.now(),
        chat_id: chat.id,
      },
    });

    const testCreateBuffer = await createWordDoc(data);
    const id = Math.floor(Math.random() * 1000000);

    await ctx.replyWithDocument({
      source: testCreateBuffer,
      filename: `${id}.docx`,
    });

    await prisma.user.update({
      where: { id: chat.user_id },
      data: { balance: { decrement: 2000 } },
    });

    return ctx.scene.enter("start");
  } catch (error) {
    console.log(error);
    ctx.reply(
      "Xatolik yuz berdi. Iltimos, 5 daqiqadan so'ng qayta  qaytadan urinib ko'ring."
    );
    return ctx.scene.enter("start");
  }
}

export async function createTestFile(
  ctx: any,
  chat: any,
  testTopic: any,
  numberOfQuestions: any,
  language: any
) {
  try {
    const fileContent = chat.fileText[0].content;

    const data = await createByFileTest(
      testTopic,
      numberOfQuestions,
      language,
      String(chat.lang),
      numberOfQuestions,
      fileContent
    );

    await prisma.description.create({
      data: {
        name: testTopic,
        content: JSON.parse(JSON.stringify(data)), // JSON array
        plan_id: "test_" + Date.now(),
        chat_id: chat.id,
      },
    });

    const testCreateBuffer = await createWordDoc(data);
    const id = Math.floor(Math.random() * 1000000);

    await ctx.replyWithDocument({
      source: testCreateBuffer,
      filename: `${id}.docx`,
    });

    await prisma.user.update({
      where: { id: chat.user_id },
      data: { balance: { decrement: 2000 } },
    });
    return ctx.scene.enter("start");
  } catch (error) {
    console.log(error);
    ctx.reply(
      "Xatolik yuz berdi. Iltimos, 5 daqiqadan so'ng qayta  qaytadan urinib ko'ring."
    );
    return ctx.scene.enter("start");
  }
}
