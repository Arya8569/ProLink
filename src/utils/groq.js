import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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
    `ID: ${job.id}, Title: ${job.title}, Company: ${job.company}, Requirements: ${job.requirements ? job.requirements.join(', ') : 'N/A'}`
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
    
    Return the result ONLY as a JSON array of objects with the following structure:
    [
      {
        "id": "job_id_from_provided_list",
        "matchScore": 85, // Integer 0-100
        "reason": "Brief explanation of why this is a good match"
      }
    ]
    
    Only include jobs from the provided list. If no jobs match, return an empty array.
    Do not include any other text in your response.
  `;

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: "llama-3.3-70b-versatile", // Use a fast and capable model
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
    // Handle Groq potentially wrapping in a root object if response_format: {type: "json_object"} is used
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.matches || Object.values(parsed)[0] || []);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('AI matching failed. Please try again later.');
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
    Requirements: ${job.requirements ? job.requirements.join(', ') : 'N/A'}
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
      model: "llama-3.3-70b-versatile",
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
    throw new Error('Candidate screening failed.');
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
      model: "llama-3.3-70b-versatile",
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
            model: "llama-3.3-70b-versatile",
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
        throw new Error(`Skill gap analysis failed: ${detail}`);
    }
};
