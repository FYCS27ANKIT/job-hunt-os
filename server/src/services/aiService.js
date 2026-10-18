const SKILL_DATABASE = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Golang', 'Rust', 'C++', 'C#', '.NET', 'PHP', 'Ruby',
  'React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Svelte', 'Tailwind CSS', 'Redux', 'Zustand', 'HTML5', 'CSS3', 'Sass',
  'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Ruby on Rails', 'GraphQL', 'REST APIs',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'Prisma', 'Mongoose', 'SQL',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Linux', 'Microservices',
  'System Design', 'Kafka', 'RabbitMQ', 'WebSockets', 'gRPC', 'Jest', 'Cypress', 'Playwright', 'TDD', 'Agile', 'Scrum'
];

/**
 * Extract skills found in a block of text
 */
function extractSkillsFromText(text) {
  if (!text) return [];
  const normalizedText = ' ' + text.toLowerCase().replace(/[^a-z0-9#+.\s]/g, ' ') + ' ';
  const matched = new Set();

  for (const skill of SKILL_DATABASE) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s,;()/'"])${escaped}([\\s,;()/'"]|$)`, 'i');
    if (regex.test(normalizedText)) {
      matched.add(skill);
    }
  }

  // Also catch common aliases
  if (/(\bjs\b|\becmascript\b)/i.test(normalizedText)) matched.add('JavaScript');
  if (/(\bts\b)/i.test(normalizedText)) matched.add('TypeScript');
  if (/(\bpostgres\b)/i.test(normalizedText)) matched.add('PostgreSQL');
  if (/(\bk8s\b)/i.test(normalizedText)) matched.add('Kubernetes');
  if (/(\breactjs\b|\breact\.js\b)/i.test(normalizedText)) matched.add('React');
  if (/(\bnodejs\b|\bnode\b)/i.test(normalizedText)) matched.add('Node.js');
  if (/(\bmongo\b)/i.test(normalizedText)) matched.add('MongoDB');

  return Array.from(matched);
}

/**
 * Match user resume skills against job description text and requirements
 */
async function analyzeSkillGap({ resumeText = '', resumeSkills = [], jobDescription = '', role = '' }) {
  // Try Gemini if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await callGeminiAnalysis({ resumeText, resumeSkills, jobDescription, role });
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local NLP matching engine:', err.message);
    }
  }

  // Local semantic matching engine
  const userSkillSet = new Set(
    [
      ...resumeSkills.map(s => s.trim()),
      ...extractSkillsFromText(resumeText)
    ].filter(Boolean)
  );

  const jobSkills = extractSkillsFromText(jobDescription);
  
  // If job description had very few detected skills, add role-inferred skills
  if (jobSkills.length === 0) {
    if (/frontend/i.test(role)) jobSkills.push('React', 'TypeScript', 'JavaScript', 'CSS3', 'REST APIs');
    else if (/backend/i.test(role)) jobSkills.push('Node.js', 'MongoDB', 'PostgreSQL', 'REST APIs', 'System Design', 'Docker');
    else if (/full\s*stack/i.test(role)) jobSkills.push('React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Docker');
    else if (/devops/i.test(role)) jobSkills.push('Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux');
    else jobSkills.push('JavaScript', 'REST APIs', 'Git', 'Agile');
  }

  const matched = [];
  const missing = [];

  const userSkillsLower = Array.from(userSkillSet).map(s => s.toLowerCase());

  jobSkills.forEach(reqSkill => {
    const isMatched = userSkillsLower.some(us => us === reqSkill.toLowerCase() || us.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us));
    if (isMatched) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const total = matched.length + missing.length;
  const matchScore = total > 0 ? Math.round((matched.length / total) * 100) : 75;

  const aiRecommendations = [];
  if (missing.length > 0) {
    aiRecommendations.push(`Target High-Impact Skills: Focus study on ${missing.slice(0, 3).join(', ')}.`);
    aiRecommendations.push(`Portfolio Adjustment: Add a small feature or repository showcasing ${missing[0]} to address this gap.`);
  } else {
    aiRecommendations.push('Excellent Profile Match: Your existing tech stack aligns with over 90% of the core prerequisites.');
  }

  aiRecommendations.push(`Interview Strategy: Highlight your hands-on mastery in ${matched.slice(0, 3).join(', ') || 'core principles'}.`);
  aiRecommendations.push(`System Design: Prepare to discuss scaling and trade-offs relevant to ${role || 'this position'}.`);

  return {
    matchedSkills: matched,
    missingSkills: missing,
    matchScore,
    aiRecommendations,
    jobExtractedSkills: jobSkills,
    summary: `Your profile matches ${matchScore}% of the identified technical requirements for ${role || 'this role'}.`
  };
}

/**
 * Call Gemini API when API key is provided
 */
async function callGeminiAnalysis({ resumeText, resumeSkills, jobDescription, role }) {
  const prompt = `You are an elite Tech Career Coach & Applicant Tracking System (ATS) expert.
Analyze the following candidate's resume and job description.

Candidate Skills: ${resumeSkills.join(', ')}
Candidate Resume Summary: ${resumeText.substring(0, 2000)}
Target Role: ${role}
Job Description:
${jobDescription.substring(0, 3000)}

Respond strictly in valid JSON format with this exact structure:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "matchScore": 85,
  "aiRecommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "summary": "Brief 1-2 sentence executive summary of candidate alignment"
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error('Empty response from Gemini');

  return JSON.parse(textContent);
}

/**
 * Generate tailored interview questions based on company, role and missing skills
 */
async function generateInterviewQuestions({ company, role, missingSkills = [], matchedSkills = [] }) {
  const sampleQuestions = [
    {
      question: `How have you architected state management and data caching in a complex web application?`,
      category: 'Technical',
      difficulty: 'Medium',
      answerKey: 'Explain context/stores, normalization, optimistic updates, and invalidation strategies.'
    },
    {
      question: `Describe a time when you had to quickly ramp up on a technology you hadn\'t used before (${missingSkills[0] || 'a new framework'}). How did you deliver on deadline?`,
      category: 'Behavioral',
      difficulty: 'Medium',
      answerKey: 'STAR Method: Situation, Task, Ramp-up tactics (docs, spikes, mentors), and Successful deliverable.'
    },
    {
      question: `How would you design a scalable notification and task reminder service for millions of daily active users at ${company || 'a high-growth startup'}?`,
      category: 'System Design',
      difficulty: 'Hard',
      answerKey: 'Address message queues (Kafka/RabbitMQ), cron workers, partitioned databases, idempotency, and push notification services.'
    },
    {
      question: `Tell me about a high-severity bug in production. How did you diagnose, mitigate, and prevent recurrence?`,
      category: 'Behavioral',
      difficulty: 'Medium',
      answerKey: 'Focus on blameless post-mortem, immediate rollback/hotfix, logging/metrics, and automated regression testing.'
    }
  ];

  if (matchedSkills.includes('MongoDB') || matchedSkills.includes('PostgreSQL')) {
    sampleQuestions.push({
      question: 'When would you choose a Document Store (MongoDB) over a Relational DB (PostgreSQL), and how do you handle data integrity?',
      category: 'Technical',
      difficulty: 'Medium',
      answerKey: 'Compare ACID transactions, schema flexibility, denormalization vs indexing, and migration ease.'
    });
  }

  return sampleQuestions;
}

module.exports = {
  extractSkillsFromText,
  analyzeSkillGap,
  generateInterviewQuestions
};
