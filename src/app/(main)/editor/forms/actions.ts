"use server";

import openai from "@/lib/openai";
import { canUseAITools } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `
    You are an expert AI resume writer. Your task is to write a compelling, professional, and concise introduction summary for a resume based on the provided user data.
    - Write in third person (no "I" or "my").
    - Summarize key skills, experience, and education relevant to the job title.
    - Focus on strengths, unique value, and achievements.
    - Do not include greetings, labels, or any information not directly supported by the data.
    - Length: 1-2 sentences.
    - Output only the summary, nothing else.
    `;
    

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description:
        ${exp.description || "N/A"}
        `,
      )
      .join("\n\n")}

      Education:
    ${educations
      ?.map(
        (edu) => `
        Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
        `,
      )
      .join("\n\n")}

      Skills:
      ${skills}
    `;

  console.log("systemMessage", systemMessage);
  console.log("userMessage", userMessage);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  return aiResponse;
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
You are an AI resume generator and expert in MIT CAPD resume writing standards.

Your task is to generate a single work experience entry in professional English based on the user's input paragraph, which may be written in Thai or English.

Format your response exactly as below (omit any field not provided):
Job title: <job title>
Company: <company name>
Start date: <YYYY-MM-DD> (only if clearly provided)
End date: <YYYY-MM-DD> (only if clearly provided)
Description:
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>
...

Guidelines:
- Only include information that is directly inferable from the input. Do not invent or assume missing details.
- Each bullet must begin with a strong past-tense action verb (e.g., Led, Built, Designed, Increased).
- Bullets must be concise and focus on impact or responsibility.
- Include quantifiable achievements wherever possible.
- Do not include greetings, explanations, or anything outside the format.
- Final output must be in English, regardless of the language used in the input.
- The tone must be professional and resume-appropriate, following the MIT CAPD resume examples.
`;

  const userMessage = `
Please generate a professional resume work experience entry from the following input paragraph. This input may be in Thai or English:

"""
${description}
"""
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  console.log("aiResponse", aiResponse);

  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
