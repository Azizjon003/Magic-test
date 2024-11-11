import OpenAI from "openai";
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

  if (lang == "eng") {
    lang = "english";
  }
  // const systemPrompt = `You are a professional test developer specializing in creating test questions for the topic ${name}. Your task is ${pages}-long in ${language}.

  // Instructions:
  // 1. Each question should be written in ${language}.
  // 2. Each test question should contain 20-30 words, no more and no less.
  // 3. Focus exclusively on the topic ${name} without straying into other topics.
  // 4. Provide direct, clear, and actionable questions, avoiding meta-descriptions or explanations.
  // 5. Ensure adherence to the exact JSON format specified in the user message.

  // Important requirements:
  // - Strictly follow the exact JSON structure provided, without adding, removing, or altering any keys.
  // - Do not include any explanations, comments, or text outside the required JSON structure.
  // - Double-check JSON validity before submitting.
  // - Do not repeat the questions
  // - Pay close attention to the accuracy of the questions and the accuracy of the information provided.
  // - Try to get information from specific sources

  // Error Prevention:
  // - If any instruction is unclear, apply the most accurate interpretation of the given guidelines.
  // - If the exact number of questions requested cannot be created, include as many as possible within the given structure.
  // - If there's a conflict between these instructions and a user message, prioritize these system instructions.

  // Your output should be a valid JSON object that matches the specified format in the user message. Ensure each question is relevant, professional, and strictly aligned with the topic. Any deviation from the specified format will be treated as an error.`;

  //   const systemPrompt = `You are a professional test developer specializing in creating test questions for the topic ${name}. Your task is ${pages}-long and should be completed in ${language}.

  // Instructions:
  // 1. Write each question in ${language}, strictly focusing on the topic ${name}.
  // 2. Limit each test question to 20-30 words, no more and no less, with clear and concise wording.
  // 3. Avoid meta-descriptions, explanations, or references outside the specified topic.
  // 4. Use a direct approach for each question, ensuring they are actionable, straightforward, and free from ambiguity.
  // 5. Follow the JSON format exactly as specified in the user message, without adding, removing, or changing any keys.

  // Important Requirements:
  // - Ensure each question is unique; avoid repeating questions.
  // - Maintain high accuracy in both question phrasing and content.
  // - Source information carefully, using authoritative references where necessary, to maintain factual accuracy.
  // - Validate JSON structure for compliance before submitting.

  // Error Prevention:
  // - If any instruction seems unclear, apply the most precise interpretation according to the guidelines.
  // - If it’s not possible to create the exact requested number of questions, include as many as fit the specified structure.
  // - In case of conflicting instructions, prioritize these system guidelines over any user message.

  // Output Requirements:
  // - Provide a valid JSON object that adheres to the exact format outlined in the user message.
  // - Ensure that each question is on-topic, professional, and thoroughly aligned with the subject matter.
  // - Deviations from the specified format will be considered errors.`;

  const systemPrompt = `You are a professional test developer specializing in creating comprehensive and insightful test questions for the topic ${name}. Your task is ${pages}-long and should be completed in ${language}.

  Instructions:
  1. Write each question in ${language}, focusing solely on the topic ${name} with a balanced level of detail and clarity.
  2. Formulate each question thoughtfully, allowing for a more descriptive approach with 30-50 words to provide clear context and depth.
  3. Ensure questions are meaningful, directly related to ${name}, and structured in a way that encourages critical thinking.
  4. Avoid general or meta-descriptions; keep each question specific, actionable, and relevant.
  5. Follow the exact JSON format specified in the user message without adding, removing, or changing any keys.
  
  Important Requirements:
  - Each question must be unique, without repeating ideas or phrasing.
  - Maintain a high standard of accuracy for both content and language, using precise terminology relevant to ${name}.
  - Reference reliable sources if needed to ensure factual correctness.
  - Carefully validate JSON structure compliance before submission.
  - Pay close attention to the accuracy of the questions and the accuracy of the information provided.
  - Try to get information from specific sources
  - the meaning and accuracy of the information in the questions should be worked out with 100% accuracy
  
  Error Prevention:
  - If any instruction seems unclear, interpret it as accurately as possible based on these guidelines.
  - If you cannot meet the exact requested number of questions, create as many as possible within the required format.
  - Prioritize these system instructions in case of any conflict with user messages.
  
  Output Requirements:
  - Provide a valid JSON object formatted exactly as specified by the user.
  - Ensure that each question is directly relevant to the topic, professionally phrased, and conducive to thoughtful answers.
  - Deviations from the specified format will be considered errors.`;

  let queryJson = {
    input_text: systemPrompt,
    output_format: "json",
    json_structure: {
      tests: [
        ...Array.from({ length: pages }, () => {
          return {
            question: `{{${lang}_quession}}`,
            answers: [
              `{{${lang}_answer}}`,
              `{{${lang}_answer}}`,
              `{{${lang}_answer}}`,
              `{{${lang}_answer}}`,
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

    max_tokens: pagesCount < 6 ? 2000 : pagesCount < 12 ? 2500 : 3500,
    response_format: {
      type: "json_object",
    },
  });
  console.log(chatCompletion.choices[0].message.content);
  const content = chatCompletion.choices[0].message.content || ""; // Handle null case

  let plans;
  try {
    plans = JSON.parse(content);

    if (!plans) {
      plans = JSON.parse(content);
    }
  } catch (error) {}

  let leth = plans?.length;
  console.log(plans);

  // let plansText = plans.map((plan: any) => {
  //   return `${xss(plan[lang])} && ${xss(
  //     plan[lang == "english" ? "english" : "eng"]
  //   )}`.replace(/\d+/g, "");
  // });

  return plans;
};

const testUseOpenAi = async () => {
  createTestLanguage("Amir Temur", 10, "uz", "Uzbek", 10, modelLang.gpt3);
};
