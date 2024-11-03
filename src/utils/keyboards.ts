import { Markup } from "telegraf";

export const mainKeyboard = Markup.keyboard([
  ["📝 Test yaratish"],
  ["💰 Balans", "📄 Qo'shimcha xizmatlar"],
  ["Foydali botlar"]
]).resize();

export const languageKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🇺🇿 O'zbek", "lang_uz"), Markup.button.callback("🇷🇺 Русский", "lang_ru")],
  [Markup.button.callback("🇬🇧 English", "lang_en"), Markup.button.callback("🇰🇷 한국어", "lang_ko")],
  [Markup.button.callback("🇫🇷 Français", "lang_fr"), Markup.button.callback("🇩🇪 Deutsch", "lang_de")],
  [Markup.button.callback("🇪🇸 Español", "lang_es")]
]);

export const questionsKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("5", "questions_5"), Markup.button.callback("10", "questions_10"), Markup.button.callback("15", "questions_15"), Markup.button.callback("20", "questions_20"), Markup.button.callback("25", "questions_25")],
  [Markup.button.callback("30", "questions_30"), Markup.button.callback("35", "questions_35"), Markup.button.callback("40", "questions_40"), Markup.button.callback("45", "questions_45"), Markup.button.callback("50", "questions_50")]
]);

export const backToMainMenuKeyboard = Markup.keyboard([
  ["Bosh menyu"]
]).resize();
