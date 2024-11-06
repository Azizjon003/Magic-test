import OpenAI from "openai";
import xss from "xss";
require("dotenv").config();
const key = process.env["OPEN_AI_KEY"] || "";
console.log(key);
const openai = new OpenAI({
  apiKey: key,
});

export enum modelLang {
  gpt3 = "gpt-3",
  gpt4 = "gpt-4",
}
export let createTestLanguage = async (
  name: string,
  pages: number,
  lang: string,
  language: string,
  pagesCount: number,
  model: modelLang = modelLang.gpt3
) => {
  let models = {
    "gpt-3": "gpt-4o-mini",
    "gpt-4": "gpt-4o-2024-08-06",
  };

  console.log(models["gpt-3"], pages);
  if (lang == "eng") {
    lang = "english";
  }
  const systemPrompt = `You are a professional test developer specializing in creating test questions for the topic ${name}. Your task is ${pages}-long in ${language}.

  Instructions:
  1. Each question should be written in ${language}.
  2. Each test question should contain 30-40 words, no more and no less.
  3. Focus exclusively on the topic ${name} without straying into other topics.
  4. Provide direct, clear, and actionable questions, avoiding meta-descriptions or explanations.
  5. Ensure adherence to the exact JSON format specified in the user message.
  
  Important requirements:
  - Strictly follow the exact JSON structure provided, without adding, removing, or altering any keys.
  - Do not include any explanations, comments, or text outside the required JSON structure.
  - Double-check JSON validity before submitting.
  
  Error Prevention:
  - If any instruction is unclear, apply the most accurate interpretation of the given guidelines.
  - If the exact number of questions requested cannot be created, include as many as possible within the given structure.
  - If there's a conflict between these instructions and a user message, prioritize these system instructions.
  
  Your output should be a valid JSON object that matches the specified format in the user message. Ensure each question is relevant, professional, and strictly aligned with the topic. Any deviation from the specified format will be treated as an error.`;

  let queryJson = {
    input_text: systemPrompt,
    output_format: "json",
    json_structure: {
      tests: [
        ...Array.from({ length: pages }, () => {
          return {
            [lang]: `{{${lang}_quession}}`,
            answers: [
              {
                [lang]: `{{${lang}_answer}}`,
              },
              {
                [lang]: `{{${lang}_answer}}`,
              },
              {
                [lang]: `{{${lang}_answer}}`,
              },
            ],
            correct_answer_index: "number answer",
          };
        }),
      ],
    },
  };

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify(queryJson),
      },
    ],

    model: models["gpt-3"],
    temperature: 0.5,

    max_tokens: pagesCount < 6 ? 1200 : pagesCount < 12 ? 1600 : 1800,
    response_format: {
      type: "json_object",
    },
  });
  console.log(chatCompletion.choices[0].message.content);
  const content = chatCompletion.choices[0].message.content || ""; // Handle null case

  let plans;
  try {
    plans = JSON.parse(content).slides.plans;

    if (!plans) {
      plans = JSON.parse(content)?.slides[0].plans;
    }
  } catch (error) {}

  let leth = plans?.length;
  console.log(plans);

  let plansText = plans.map((plan: any) => {
    return `${xss(plan[lang])} && ${xss(
      plan[lang == "english" ? "english" : "eng"]
    )}`.replace(/\d+/g, "");
  });

  console.log(plansText);

  return plansText;
};
