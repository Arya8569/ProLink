import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const DEFAULT_MODEL = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';

/**
 * Matches a resume with a list of jobs using Groq AI.
 * @param {string} resumeText - The text content of the resume.
 * @param {Array} jobs - A list of available jobs.
 * @returns {Promise<Object>} - An object containing matched jobs and scores.
 */
export const matchJobsWithGroq = async (resumeText, jobs) => {
  if (!API_KEY || API_KEY === 'your-groq-api-key-here') {
    throw new Error('Groq API key is missing. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  // Sample the jobs to fit within context (e.g., top 20 or first 10000 chars)
  const jobListString = jobs.map(job => 
    `ID: ${job.id}, Title: ${job.title}, Company: ${job.company}, Requirements: ${Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || 'N/A')}`
  ).join('\n---\n');

  const prompt = `
    You are an AI Job Matching Assistant. I will provide you with a candidate's resume and a list of available jobs.
    Your task is to analyze the resume and recommend the top 3-5 jobs that best match the candidate's skills and experience.
    
    Candidate Resume:
    """
    ${resumeText.substring(0, 5000)} // Truncate to avoid context limit
    """
    
    Available Jobs:
    """
    ${jobListString.substring(0, 10000)} // Truncate to avoid context limit
    """
    
    Return the result ONLY as a JSON object with a "matches" key containing an array of objects:
    {
      "matches": [
        {
          "id": "job_id_from_provided_list",
          "matchScore": 85,
          "reason": "Brief explanation of why this is a good match"
        }
      ]
    }
    
    Only include jobs from the provided list. If no jobs match, return an empty array under "matches".
    Do not include any other text in your response.
  `;

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a precise job matching assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.matches || Object.values(parsed)[0] || []);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    const detail = error.response?.data?.error?.message || error.message || '';
    throw new Error(`AI matching failed: ${detail || 'Please try again later.'}`);
  }
};

/**
 * Detailed screening analysis for recruiters.
 * @param {string} resumeText - Candidate's resume text.
 * @param {Object} job - Job details.
 * @returns {Promise<Object>} - Detailed analysis.
 */
export const screenCandidateForJob = async (resumeText, job) => {
  if (!API_KEY || API_KEY === 'your-groq-api-key-here') {
    throw new Error('Groq API key is missing.');
  }

  const prompt = `
    Analyze this candidate's resume against the following job requirements.
    
    Job Title: ${job.title}
    Company: ${job.company}
    Requirements: ${Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || 'N/A')}
    Description: ${job.description || 'N/A'}
    
    Candidate Resume:
    """
    ${resumeText.substring(0, 5000)}
    """
    
    Provide a detailed evaluation in JSON format:
    {
      "matchScore": 85, // 0-100
      "fitAnalysis": "Summary of overall fit",
      "pros": ["Key strength 1", "Key strength 2"],
      "cons": ["Missing skill 1", "Concern 1"],
      "recommendation": "Shortlist/Reject/Interview"
    }
  `;

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are an expert recruiter assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error in AI screening:', error);
    const detail = error.response?.data?.error?.message || error.message || '';
    throw new Error(`Candidate screening failed: ${detail || 'Please try again later.'}`);
  }
};

/**
 * Parses resume text into structured profile data.
 * @param {string} resumeText - The text content of the resume.
 * @returns {Promise<Object>} - Structured profile data.
 */
export const parseResumeToProfile = async (resumeText) => {
  if (!API_KEY || API_KEY === 'your-groq-api-key-here') {
    throw new Error('Groq API key is missing.');
  }

  const prompt = `
    Analyze the following resume text and extract information into a structured JSON format.
    Group the data into: skills, experience, education, and projects.
    
    Resume Text:
    """
    ${resumeText.substring(0, 8000)}
    """
    
    Return the result ONLY as a JSON object with this structure:
    {
      "skills": ["Skill 1", "Skill 2"],
      "experience": [
        {
          "role": "Job Title",
          "company": "Company Name",
          "duration": "e.g., 2020 - 2022",
          "description": "Brief summary of responsibilities"
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "University/School",
          "year": "e.g., 2020"
        }
      ],
      "projects": [
        {
          "title": "Project Name",
          "description": "Brief summary of the project",
          "link": "Optional URL or N/A"
        }
      ]
    }
  `;

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a professional resume parser." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    const detail = error.response?.data?.error?.message || error.message || '';
    throw new Error(`Resume parsing failed: ${detail || 'Please try again later.'}`);
  }
};

/**
 * Generates a skill gap analysis by comparing user skills with job market requirements.
 * @param {Array<string>} userSkills - List of skills the user possesses.
 * @param {Array<Object>} availableJobs - List of job objects with descriptions/requirements.
 * @returns {Promise<Object>} - Analysis with gaps and recommendations.
 */
export const generateSkillGapAnalysis = async (userSkills, availableJobs) => {
    if (!API_KEY || API_KEY === 'your-groq-api-key-here') {
        throw new Error('Groq API key is missing.');
    }

    const jobRequirements = availableJobs.map(job => 
        `Job: ${job.title}\nRequirements: ${job.description || job.requirements}`
    ).join('\n\n').substring(0, 10000);

    const prompt = `
        Compare the candidate's skills with the provided job market requirements.
        Identify the most critical missing skills (skill gaps) that the candidate should be aware of.
        
        Candidate Skills: ${userSkills.join(', ')}
        
        Job Market Requirements:
        """
        ${jobRequirements}
        """
        
        Return the result ONLY as a JSON object with this structure:
        {
          "skillGaps": [
            {
              "id": "unique_id_1",
              "name": "Skill Name",
              "category": "e.g., Programming, Design, etc.",
              "marketDemand": 0-100 (percentage),
              "jobsRequiring": number of jobs needing this (estimated),
              "currentLevel": 0-100 (percentage user has, usually low if it's a gap)
            }
          ]
        }
    `;

    try {
        const response = await axios.post(GROQ_API_URL, {
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: "You are a career development AI." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error('Error generating skill gap analysis:', error);
        const detail = error.response?.data?.error?.message || error.message || '';
        throw new Error(`Skill gap analysis failed: ${detail || 'Please try again later.'}`);
    }
};

/**
 * Generates a polished, professional cover letter based on user draft/notes, job details, and optional resume.
 * @param {string} userNotes - User's draft or points for the cover letter.
 * @param {Object} job - Details of the job being applied for.
 * @param {string} [resumeText] - Optional extracted text from candidate's resume.
 * @param {string} [candidateName] - Optional name of candidate for sign-off.
 * @returns {Promise<string>} - Professional cover letter text.
 */
export const generateCoverLetterWithGroq = async (userNotes, job, resumeText = '', candidateName = '') => {
  if (!API_KEY || API_KEY === 'your-groq-api-key-here') {
    throw new Error('Groq API key is missing. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  const prompt = `
You are an expert career consultant and executive resume writer.
A candidate is applying for the following job and has provided their initial thoughts/draft for a cover letter.

Job Details:
- Title: ${job?.title || 'Job Position'}
- Company: ${job?.company?.name || job?.company || 'Hiring Company'}
- Requirements: ${Array.isArray(job?.requirements) ? job.requirements.join(', ') : (job?.requirements || 'N/A')}
- Description: ${job?.description || 'N/A'}

${resumeText ? `Candidate Resume / Background:\n"""\n${resumeText.substring(0, 4000)}\n"""\n` : ''}

Candidate's Initial Draft / Key Points:
"""
${userNotes.substring(0, 2000)}
"""

Task:
Transform the candidate's draft into a polished, compelling, and professional cover letter.
- Retain the candidate's authentic intent and key points while elevating the vocabulary, structure, and professional tone.
- Directly connect the candidate's stated interests and skills to this specific job's requirements and company.
- Keep it concise, engaging, and well-organized (salutation, hook/opening paragraph, body paragraph highlighting relevant value and fit, and a polite call-to-action closing).
${candidateName ? `- Sign off the letter with: "Sincerely,\n${candidateName}"` : '- Sign off with: "Sincerely,\n[Applicant]"'}

Return the response ONLY as a JSON object with a "coverLetter" key:
{
  "coverLetter": "Full generated text here..."
}
`;

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a professional cover letter writer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.coverLetter || parsed.letter || Object.values(parsed)[0] || '';
  } catch (error) {
    console.error('Error generating cover letter with Groq:', error);
    const detail = error.response?.data?.error?.message || error.message || '';
    throw new Error(`Cover letter generation failed: ${detail || 'Please try again later.'}`);
  }
};

