import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

interface TestAnswer {
  question: string;
  answers: string[];
  correct_answer_index: string;
}

interface TestData {
  tests: TestAnswer[];
}

// Function to convert tests to Word document
export async function createWordDoc(jsonData: any) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Test savollari",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Generate questions and answers
          ...generateQuestions(jsonData.tests),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

function generateQuestions(tests: TestAnswer[]): Paragraph[] {
  const elements: Paragraph[] = [];

  tests.forEach((test: TestAnswer, index: number) => {
    // Add question
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${test.question}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: {
          before: 400,
          after: 200,
        },
      })
    );

    // Add answer options
    test.answers.forEach((answer: string, answerIndex: number) => {
      const letter: string = String.fromCharCode(65 + answerIndex); // A, B, C, D
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${letter}) ${answer}`,
              size: 24,
            }),
          ],
          indent: {
            left: 720, // 0.5 inch indent
          },
          spacing: {
            before: 100,
            after: 100,
          },
        })
      );
    });

    // Add correct answer
    const correctLetter: string = String.fromCharCode(
      65 + parseInt(test.correct_answer_index)
    );
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `To'g'ri javob: ${correctLetter}`,
            bold: true,
            size: 24,
            color: "2b5a84",
          }),
        ],
        spacing: {
          before: 200,
          after: 200,
        },
      })
    );

    // Add separator
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "",
            color: "999999",
          }),
        ],
        spacing: {
          before: 200,
          after: 200,
        },
      })
    );
  });

  return elements;
}

// const jsonString: string = fs.readFileSync("test.json", "utf-8");

// Parse JSON
// const jsonData: TestData = JSON.parse(jsonString);

// Create document
// const doc: Document = createWordDoc(jsonData);

// Save document
// Packer.toBuffer(doc).then((buffer: Buffer) => {
//   fs.writeFileSync("test_questions.docx", buffer);
//   console.log("Word fayli muvaffaqiyatli yaratildi!");
// });
