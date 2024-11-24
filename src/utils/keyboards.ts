import { Markup } from "telegraf";

export const mainKeyboard = Markup.keyboard([
  ["📝 Test yaratish","Qo'llanma"],
  ["💰 Balans", "Foydali botlar"],
]).resize();
export const confirmKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("✅ Tasdiqlash", "confirm")],
  [Markup.button.callback("❌ Bekor qilish", "cancel")],
  [Markup.button.callback("Savollar sonini o'zgartirish", "change_questions")],
  [Markup.button.callback("Tilni o'zgartirish", "change_language")],
  [Markup.button.callback("Mavzuni o'zgartirish", "change_topic")],
  [Markup.button.callback("Test tuzishda fayldan foydalanamiz", "file")],
]);

export const confirmKeyboard2 = Markup.inlineKeyboard([
  [Markup.button.callback("✅ Tasdiqlash", "confirm_file")],
  [Markup.button.callback("❌ Bekor qilish", "cancel")],
]);
export const languageKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback("🇺🇿 O'zbek", "lang_uz"),
    Markup.button.callback("🇷🇺 Русский", "lang_ru"),
  ],
  [
    Markup.button.callback("🇬🇧 English", "lang_en"),
    Markup.button.callback("🇰🇷 한국어", "lang_ko"),
  ],
  [
    Markup.button.callback("🇫🇷 Français", "lang_fr"),
    Markup.button.callback("🇩🇪 Deutsch", "lang_de"),
  ],
  [Markup.button.callback("🇪🇸 Español", "lang_es")],
]);

export const questionsKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback("5", "questions_5"),
    Markup.button.callback("10", "questions_10"),
    Markup.button.callback("15", "questions_15"),
    Markup.button.callback("20", "questions_20"),
    // Markup.button.callback("25", "questions_25"),
  ],
  // [
  //   Markup.button.callback("30", "questions_30"),
  //   Markup.button.callback("35", "questions_35"),
  //   Markup.button.callback("40", "questions_40"),
  //   Markup.button.callback("45", "questions_45"),
  //   Markup.button.callback("50", "questions_50"),
  // ],
]);

export const backToMainMenuKeyboard = Markup.keyboard([
  ["Bosh menyu"],
]).resize();

export const balanceKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🛒 Xarid qilish", "buy")],
  [Markup.button.callback("🆓 Bepul qo'lga kiritish", "referal")],
]);

export const paymentKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback("💳 PAYME", "payme"),
    // Markup.button.callback("💳 Karta orqali to'lov", "card"),
  ],
]);

export const paymentOptionsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("2000 so'm", "2000")],
  [
    Markup.button.callback("5000 so'm", "5000"),
    Markup.button.callback("10000 so'm", "10000"),
  ],
  [
    Markup.button.callback("5000 so'm", "15000"),
    Markup.button.callback("10000 so'm", "20000"),
  ],
  [
    Markup.button.callback("20000 so'm", "25000"),
    Markup.button.callback("50000 so'm", "50000"),
  ],
  [Markup.button.callback("Ortga", "back")],
]);

export const cardPaymentOptionsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("Checkni yuborish", "send_check")],
  [Markup.button.callback("Ortga", "back")],
]);
