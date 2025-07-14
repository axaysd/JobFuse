// promptTemplate.js

/**
 * Returns a readable, well-formatted prompt for generating a cover letter.
 * @param {Object} params
 * @param {string} params.userDetailsString
 * @param {string} params.jobDescription
 * @param {string} params.resume
 * @param {string} [params.roleTitle]
 * @param {string} [params.companyName]
 * @param {string} [params.location]
 * @returns {string}
 */
function generateCoverLetterPrompt({ userDetailsString, jobDescription, resume, roleTitle, companyName, location }) {
  return `
You are an expert career coach and professional writer.

Your task:
- Write a highly effective, personalized cover letter using the provided job description, resume, candidate details, and job meta information.
- The cover letter must:
  * Follow all best practices for modern cover letters
  * Be tailored to the specific role
  * Make the candidate stand out
  * Be concise enough to fit on a single page in Microsoft Word using Calibri 11pt font (do not exceed one page)
  * Use only explicit line breaks (\\n) for every new paragraph or line
  * Use only Calibri 11pt font (do not mention font in the letter)
  * Never use em dashes (—) or any indication that this was written by AI or ChatGPT
  * Mark any placeholders (if any) clearly using double square brackets like [[PLACEHOLDER]]
  * Output only the cover letter itself, with no extra commentary or explanation

Job Meta:
${roleTitle ? `Role Title: ${roleTitle}\n` : ''}${companyName ? `Company Name: ${companyName}\n` : ''}${location ? `Location: ${location}\n` : ''}
Candidate Details:
${userDetailsString}

Job Description:
${jobDescription}

Resume:
${resume}

Cover Letter:
`;
} 