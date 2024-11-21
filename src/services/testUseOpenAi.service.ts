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
  - Let the answers to the questions be varied. Pay close attention to the clarity of the questions. Pay attention to the content of the questions. Use clear facts in the questions and answers.
   - Pay close attention to the clarity of the questions. Pay attention to the content of the questions. Use clear facts in the questions and answers. Avoid answers where several answers are correct and several answers are incorrect.  
   - The answers should be exactly one, not multiple.
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

    max_tokens:
      pagesCount < 10
        ? 500
        : pagesCount < 20
        ? 3500
        : pagesCount < 30
        ? 5000
        : 7000,
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

export let createByFileTest = async (
  name: string,
  pages: number,
  lang: string,
  language: string,
  pagesCount: number,
  contentFile: string,
  model: modelLang = modelLang.gpt3
) => {
  let models = {
    "gpt-3": "gpt-4o-mini",
    "gpt-4": "gpt-4o-2024-08-06",
  };

  const systemPrompt = `
    You are a professional test developer specializing in creating comprehensive and insightful test questions. 
    Your task is to create ${pages} test questions in ${language}, using the information provided in the file located at "./input.txt" for the topic "${name}".
    
    Instructions:
    1. Carefully analyze the content of the file at "./input.txt" to formulate ${pages} unique test questions.
    2. Write each question in ${language}, focusing specifically on the topic "${name}".
    3. Each question must be between 30-50 words long to provide clear context and depth.
    4. Ensure all questions are precise, contextually relevant, and based solely on the information in the file.
    5. Each question must be unique, and no ideas or phrasings should be repeated.
    6. Use the exact JSON format provided below without any deviations.

    Requirements:
    - Questions must be well-structured and clear, encouraging critical thinking.
    - The file data must be accurately interpreted, ensuring factual correctness.
    - If any issue arises while reading the file, report it immediately.
    - Include a valid "correct_answer_index" for each question, ensuring it aligns with the file data.


    Your goal is to generate ${pages} high-quality and accurate test questions in ${language} based on the content of the file. 
    Ensure all instructions are strictly followed, and the final output meets the specified requirements.
  `;

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
      {
        role: "user",
        content: contentFile,
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
