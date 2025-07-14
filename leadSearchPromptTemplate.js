// leadSearchPromptTemplate.js

/**
 * Returns a readable, well-formatted prompt for generating LinkedIn Sales Navigator lead search URLs.
 * @param {Object} params
 * @param {string} params.jobDescription
 * @param {string} [params.companyName]
 * @param {string} [params.location]
 * @param {number} [params.numUrls]
 * @returns {string}
 */
function generateLeadSearchPrompt({ jobDescription, companyName, location, numUrls }) {
    return `
  You are an expert in LinkedIn Sales Navigator and B2B lead generation.
  
  Your task:
  - Analyze the following job description${companyName ? ` for the company "${companyName}"` : ''}${location ? ` in the location "${location}"` : ''}.
  - Generate ${numUrls || 3} distinct LinkedIn Sales Navigator lead search URLs, each using a different search strategy (e.g., different titles, functions, seniority levels, or keyword logic).
  - For each URL, extract and use the most relevant values for the following parameters:
  
    1. companyIncluded — current company hiring for the role  
       Example: companyIncluded=OpenAI
  
    2. titleIncluded — likely hiring manager or relevant collaborators (comma-separated, URL-encoded)  
       Example: titleIncluded=VP%20Product,Director%20of%20Product,Product%20Manager
  
    3. functionIncluded — LinkedIn function numeric code  
       Common values:  
       - 2 = Engineering  
       - 19 = Product Management  
       - 20 = Marketing  
       - 23 = HR  
       Example: functionIncluded=19
  
    4. seniorityLevel — numeric codes for decision-maker levels  
       Common values:  
       - 3 = VP  
       - 4 = Director  
       - 5 = Manager  
       - 6 = Senior IC  
       Example: seniorityLevel=4,5,6
  
    5. geoIncluded — LinkedIn region ID (if inferable from the job or company location)  
       Example: geoIncluded=105080838 (San Francisco Bay Area)
  
    6. keywords — advanced boolean keyword search for profile content (URL-encoded)  
       Examples:  
       - keywords=AI%20AND%20(Product%20OR%20Platform)  
       - keywords=veterinary%20AND%20NOT%20sales  
       - keywords=healthcare%20AND%20(diagnostics%20OR%20NLP)
  
    7. viewAllFilters — always include this flag  
       Example: viewAllFilters=true
  
  - Output only the ${numUrls || 3} valid LinkedIn Sales Navigator lead search URLs, one per line.
  - Use only the parameters above, separated by '&' in each URL.
  - Ensure all values are URL-encoded.
  - Do not include any extra commentary, explanation, or formatting—just the URLs, one per line.
  
  Job Description:
  ${jobDescription}
  
  LinkedIn Sales Navigator Lead Search URLs:
  `;
  }  