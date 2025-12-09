
import { AgentStatus, AgentType, JobStatus, QueryPayload, StructuredResult } from '../types';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Schema definition for the Final Report Agent
const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A comprehensive executive summary. Use markdown formatting for bolding key figures." },
    market: {
      type: Type.OBJECT,
      properties: {
        indication: { type: Type.STRING },
        country: { type: Type.STRING },
        year: { type: Type.NUMBER },
        sales_mn_usd: { type: Type.NUMBER },
        cagr: { type: Type.NUMBER },
        top_competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
        source: { type: Type.STRING },
        fetched_at: { type: Type.STRING }
      },
      required: ["sales_mn_usd", "cagr", "top_competitors", "indication"]
    },
    patents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          molecule: { type: Type.STRING },
          patent_id: { type: Type.STRING },
          assignee: { type: Type.STRING },
          filing_date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          expiry: { type: Type.STRING, description: "YYYY-MM-DD format" },
          claims: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING, description: "A concise 1-sentence summary of what the patent actually protects." },
          patent_type: { type: Type.STRING, description: "Classify as 'Composition of Matter', 'Method of Use', 'Formulation', or 'Process'." },
          remaining_years: { type: Type.NUMBER },
          source: { type: Type.STRING }
        },
        required: ["patent_id", "expiry", "remaining_years", "summary", "patent_type"]
      }
    },
    trials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING, description: "The official scientific title of the study." },
          phase: { type: Type.STRING },
          status: { type: Type.STRING },
          sponsor: { type: Type.STRING, description: "The primary organization or pharma company sponsoring the trial." },
          enrollment: { type: Type.NUMBER, description: "Estimated enrollment count." },
          conditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of conditions or diseases studied." }
        },
        required: ["id", "phase", "status", "title", "sponsor"]
      }
    },
    exim: {
      type: Type.ARRAY,
      description: "Return exactly 5 years of data if available, or at least 3 years.",
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          import_volume: { type: Type.NUMBER },
          export_volume: { type: Type.NUMBER },
          top_importers: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 Key strengths of this therapeutic area/molecule." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 Key weaknesses or gaps." },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 Future opportunities (whitespace)." },
        threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 Key threats (regulatory, patent cliffs)." }
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
    },
    competitors: {
      type: Type.ARRAY,
      description: "Map key players for a Competitive Landscape Chart. ENSURE scores vary widely to create a scattered chart, do not put everyone in the middle.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          market_share_index: { type: Type.NUMBER, description: "0-100 score for market dominance" },
          innovation_index: { type: Type.NUMBER, description: "0-100 score for pipeline innovation" },
          type: { type: Type.STRING, description: "Leader, Challenger, Niche, or Established" }
        },
        required: ["name", "market_share_index", "innovation_index", "type"]
      }
    },
    whitespace_score: { type: Type.NUMBER },
    biosimilar_score: { type: Type.NUMBER },
    pdf_url: { type: Type.STRING }
  },
  required: ["summary", "market", "patents", "trials", "exim", "swot", "competitors", "whitespace_score", "biosimilar_score"]
};

// Utility to clean JSON from markdown
const cleanJsonOutput = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\n?|\n?```/g, "").trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

// DELAY: 20 seconds to be absolutely safe for Free Tier (approx 3 RPM target)
// This prevents 429 RESOURCE_EXHAUSTED errors by enforcing strict spacing.
const SAFE_DELAY_MS = 20000;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry helper with exponential backoff for 429 errors
// Increased default retries to 4 and base delay to 20s for maximum robustness
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 4, baseDelay = 20000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = error?.toString() || '';
    const errorMsg = error?.message || '';
    
    const isQuotaError = 
      error?.status === 429 || 
      error?.code === 429 || 
      errorStr.includes('429') || 
      errorMsg.includes('429') || 
      errorMsg.includes('quota') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      error?.status === 503 ||
      error?.status === 500;

    if (retries > 0 && isQuotaError) {
      console.warn(`Quota limit hit (429) or Server Error (5xx). Retrying in ${baseDelay}ms... (Attempts left: ${retries})`);
      await delay(baseDelay);
      return retryWithBackoff(fn, retries - 1, baseDelay * 2);
    }
    throw error;
  }
}

// Simulation state
let currentJob: JobStatus | null = null;

// Chat Service Implementation
let chatInstance: any = null;

export const ChatService = {
  // Initialize or reset chat with context
  initializeChat: (context?: StructuredResult) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create system prompt based on context if available
    let systemInstruction = "You are the MoleculeX AI Assistant, an expert in pharmaceutical market research, clinical trials, and intellectual property strategy. You help users analyze drug development opportunities.";
    
    if (context) {
      systemInstruction += `\n\nCURRENT CONTEXT: The user is analyzing a report with the following data:
      - Summary: ${context.summary}
      - Market: ${context.market.sales_mn_usd} Mn USD sales, ${context.market.cagr} CAGR.
      - Top Competitors: ${context.market.top_competitors.join(', ')}.
      - Patents: ${context.patents.length} key patents found.
      - Clinical Trials: ${context.trials.length} trials found.
      
      Use this context to answer user questions specifically about this analysis.`;
    }

    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
  },

  sendMessage: async (message: string): Promise<string> => {
    if (!chatInstance) {
      ChatService.initializeChat();
    }
    
    try {
      const result = await chatInstance!.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Chat Error:", error);
      return "I'm currently experiencing high traffic (Rate Limit). Please wait a moment and try again.";
    }
  }
};

export const ApiService = {
  startQuery: async (payload: QueryPayload): Promise<{ job_id: string }> => {
    const jobId = `job_${Date.now()}`;
    currentJob = {
      jobId,
      progress: 0,
      isComplete: false,
      agents: {
        [AgentType.MASTER]: AgentStatus.RUNNING,
        [AgentType.MARKET]: AgentStatus.WAITING,
        [AgentType.PATENT]: AgentStatus.WAITING,
        [AgentType.TRIALS]: AgentStatus.WAITING,
        [AgentType.WEB]: AgentStatus.WAITING,
        [AgentType.EXIM]: AgentStatus.WAITING,
        [AgentType.REPORT]: AgentStatus.WAITING,
      },
      logs: [{
        id: '1', agent: AgentType.MASTER, message: `Received query: "${payload.query}"`, timestamp: new Date().toISOString(), status: AgentStatus.RUNNING
      }]
    };
    
    // Start the real orchestration in background
    runOrchestrator(jobId, payload);
    
    return { job_id: jobId };
  },

  getStatus: async (jobId: string): Promise<JobStatus> => {
    if (!currentJob || currentJob.jobId !== jobId) {
      throw new Error("Job not found");
    }
    return { ...currentJob };
  },

  getResult: async (jobId: string): Promise<StructuredResult> => {
    return (currentJob as any).finalResult; 
  }
};

// --- ORCHESTRATOR LOGIC ---

async function runOrchestrator(jobId: string, payload: QueryPayload) {
  if (!currentJob) return;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelSearch = 'gemini-2.5-flash';
  const modelReasoning = 'gemini-2.5-flash'; 

  const updateStatus = (agent: AgentType, status: AgentStatus, message?: string) => {
    if (!currentJob) return;
    currentJob.agents[agent] = status;
    if (message) {
      currentJob.logs.unshift({
        id: `log_${Date.now()}_${agent}`,
        agent,
        message,
        timestamp: new Date().toISOString(),
        status
      });
    }
  };

  // Safe executor wrapper
  const executeAgent = async (agentType: AgentType, taskName: string, taskFn: () => Promise<any>): Promise<any> => {
      updateStatus(agentType, AgentStatus.RUNNING, taskName);
      try {
          const res = await retryWithBackoff(taskFn);
          updateStatus(agentType, AgentStatus.COMPLETED, `${agentType} task completed.`);
          return res;
      } catch (error: any) {
          console.error(`${agentType} failed:`, error);
          // Don't throw here, instead update status to FAILED and re-throw so the orchestrator can decide to continue or stop
          // Or simpler: Update to FAILED and throw, but orchestrator catches it.
          updateStatus(agentType, AgentStatus.FAILED, `Failed: ${error.message}`);
          throw error; 
      }
  };

  try {
    // 1. MASTER AGENT: Analysis
    updateStatus(AgentType.MASTER, AgentStatus.RUNNING, "Initializing Sequential Swarm Protocol...");
    currentJob.progress = 5;
    
    // Define Task Functions
    const runMarket = () => ai.models.generateContent({
      model: modelSearch, 
      contents: `
      TASK: Find PRECISE market data for: "${payload.query}" in ${payload.region || 'Global'}.
      Find:
      1. Market Size (USD Millions) & Reference Year.
      2. CAGR % for forecast period.
      3. Top 3-5 Competitors.
      Use Google Search to find reputable industry reports.
    `, 
      config: { tools: [{ googleSearch: {} }] }
    });

    const runExim = () => ai.models.generateContent({
      model: modelSearch,
      contents: `
      TASK: Analyze Import/Export trends for "${payload.molecule || payload.query}" in ${payload.region || 'Global'}.
      Find:
      1. Import Volume (last 5 years: 2020-2024).
      2. Export Volume (last 5 years: 2020-2024).
      3. Top Importing Countries.
      Use Google Search to find trade statistics.
      `,
      config: { tools: [{ googleSearch: {} }] }
    });

    const runPatent = () => ai.models.generateContent({
      model: modelSearch,
      contents: `
      TASK: Find key patents for "${payload.molecule || payload.query}".
      Find:
      1. Patent ID (US/EP/WO).
      2. Assignee (Company).
      3. Filing Date & Expiry Date (Very Important).
      4. Summary of Claims (What is protected?).
      Use Google Search (Google Patents).
      `,
      config: { tools: [{ googleSearch: {} }] }
    });

    const runTrials = () => ai.models.generateContent({
      model: modelSearch,
      contents: `
      TASK: Find recent Clinical Trials for "${payload.molecule || payload.query}".
      Find:
      1. NCT ID.
      2. Study Title.
      3. Phase (1/2/3).
      4. Status (Recruiting/Completed).
      5. Sponsor.
      6. Enrollment Count.
      Use Google Search (ClinicalTrials.gov).
      `,
      config: { tools: [{ googleSearch: {} }] }
    });

    const runWeb = () => ai.models.generateContent({
      model: modelSearch,
      contents: `
      TASK: Scientific & Competitive Landscape search for "${payload.query}".
      Find:
      1. Recent breakthrough papers/news.
      2. Competitor strategic moves (M&A, partnerships).
      3. SWOT elements.
      Use Google Search.
      `,
      config: { tools: [{ googleSearch: {} }] }
    });

    // 2. SEQUENTIAL EXECUTION WITH FAULT TOLERANCE
    // If one agent fails, we catch it, log it, and continue to the next.
    // This prevents "Critical Failure" if one agent hits a quota or network error.

    // Initial warm-up delay
    await delay(2000);

    // Agent 1: Market
    let marketRes = { text: "Market data unavailable." };
    try {
        marketRes = await executeAgent(AgentType.MARKET, "Scraping industry reports...", runMarket);
    } catch (e) {
        console.warn("Market Agent skipped due to error.");
    }
    currentJob.progress = 20;
    await delay(SAFE_DELAY_MS); 

    // Agent 2: EXIM
    let eximRes = { text: "Trade data unavailable." };
    try {
        eximRes = await executeAgent(AgentType.EXIM, "Querying global trade databases...", runExim);
    } catch (e) {
        console.warn("EXIM Agent skipped due to error.");
    }
    currentJob.progress = 40;
    await delay(SAFE_DELAY_MS);

    // Agent 3: Patent
    let patentRes = { text: "Patent data unavailable." };
    try {
        patentRes = await executeAgent(AgentType.PATENT, "Searching patent registries...", runPatent);
    } catch (e) {
        console.warn("Patent Agent skipped due to error.");
    }
    currentJob.progress = 60;
    await delay(SAFE_DELAY_MS);

    // Agent 4: Trials
    let trialsRes = { text: "Trials data unavailable." };
    try {
        trialsRes = await executeAgent(AgentType.TRIALS, "Scanning clinical trial registries...", runTrials);
    } catch (e) {
        console.warn("Trials Agent skipped due to error.");
    }
    currentJob.progress = 75;
    await delay(SAFE_DELAY_MS);

    // Agent 5: Web
    let webRes = { text: "Web findings unavailable." };
    try {
        webRes = await executeAgent(AgentType.WEB, "Broad literature search...", runWeb);
    } catch (e) {
        console.warn("Web Agent skipped due to error.");
    }
    currentJob.progress = 85;
    await delay(SAFE_DELAY_MS); 

    // 3. REPORT AGENT: Synthesis
    updateStatus(AgentType.REPORT, AgentStatus.RUNNING, "Synthesizing strategic intelligence & SWOT analysis...");
    updateStatus(AgentType.MASTER, AgentStatus.RUNNING, "Finalizing report...");

    // Helper to safely extract sources
    const extractSources = (res: any, type: string) => {
      try {
        return res?.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || `${type} Source`,
          url: c.web?.uri || '',
          snippet: `Source for ${type} analysis`,
          confidence: 0.95
        })).filter((s: any) => s.url) || [];
      } catch (e) {
        return [];
      }
    };

    const marketSources = extractSources(marketRes, 'Market');
    const eximSources = extractSources(eximRes, 'Trade');
    const patentSources = extractSources(patentRes, 'Patent');
    const trialsSources = extractSources(trialsRes, 'Trials');
    const webSources = extractSources(webRes, 'Science');
    
    const allSources = [...marketSources, ...eximSources, ...patentSources, ...trialsSources, ...webSources];
    const uniqueSources = Array.from(new Map(allSources.map(s => [s.url, s])).values());
    
    const synthesisPrompt = `
      You are an expert Pharmaceutical Analyst (Report Agent). 
      Synthesize the following RAW INTELLIGENCE from 5 specialized agents into a structured JSON report.
      
      USER QUERY: ${payload.query}
      REGION: ${payload.region}
      MOLECULE: ${payload.molecule}
      
      --- RAW DATA ---
      MARKET: ${marketRes?.text || "Unavailable"}
      TRADE: ${eximRes?.text || "Unavailable"}
      PATENT: ${patentRes?.text || "Unavailable"}
      TRIALS: ${trialsRes?.text || "Unavailable"}
      SCIENTIFIC: ${webRes?.text || "Unavailable"}
      
      INSTRUCTIONS for PRECISION:
      1. **Market**: Extract EXACT numeric data.
      2. **Patents**: Return dates in 'YYYY-MM-DD'. Summarize SCOPE in simple English. Classify type (Composition vs Method).
      3. **Trials**: Extract NCT IDs, Sponsors, TITLES, Enrollment, and Conditions.
      4. **SWOT Analysis**: Generate a strategic SWOT based on the data.
      5. **Competitor Landscape**: Identify 4-6 key players and assign them a score (0-100) for "Market Share" and "Innovation" to populate a scatter plot. MAKE SURE THE SCORES ARE SPREAD OUT so they don't overlap.
      6. **EXIM**: Try to generate a 5-year trend (2020-2024) for import/export volumes if data suggests it, otherwise estimate based on trends.
      7. **Summary**: Write a professional, dense executive summary highlighting the opportunity.
      8. Return strictly JSON matching the schema.
      9. IF DATA IS MISSING (e.g., "Unavailable"), fill the JSON with reasonable placeholders or empty arrays, but DO NOT FAIL.
    `;

    const runReport = () => ai.models.generateContent({
      model: modelReasoning,
      contents: synthesisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      }
    });

    let reportResponse;
    try {
        reportResponse = await retryWithBackoff(runReport);
    } catch (e) {
        console.warn("Report Generation failed (Quota), retrying synthesis...");
        await delay(20000); // Extra safety for final report
        reportResponse = await retryWithBackoff(runReport);
    }

    const finalJsonText = reportResponse.text;
    let structuredData: StructuredResult;
    
    try {
      const cleanJson = cleanJsonOutput(finalJsonText);
      structuredData = JSON.parse(cleanJson);
      
      structuredData.web_findings = uniqueSources.slice(0, 12); 
      structuredData.pdf_url = `report_${jobId}.pdf`; 
    } catch (e) {
      console.error("JSON Parse Error", e);
      structuredData = {
          summary: "Analysis complete. However, the structured report generation encountered a format error or quota limit during synthesis.",
          market: { indication: "N/A", country: "Global", year: 2024, sales_mn_usd: 0, cagr: 0, top_competitors: [], source: "Error", fetched_at: new Date().toISOString() },
          patents: [],
          trials: [],
          exim: [],
          web_findings: uniqueSources.slice(0, 5),
          whitespace_score: 0,
          biosimilar_score: 0,
          swot: { strengths: ["Data gathered"], weaknesses: ["Parse failed"], opportunities: [], threats: [] },
          competitors: []
      };
    }

    // 4. COMPLETE
    (currentJob as any).finalResult = structuredData;
    updateStatus(AgentType.REPORT, AgentStatus.COMPLETED, "Strategic report generated.");
    updateStatus(AgentType.MASTER, AgentStatus.COMPLETED, "Orchestration complete.");
    currentJob.progress = 100;
    currentJob.isComplete = true;

  } catch (error: any) {
    // This catch block should only be hit if the MASTER or REPORT agents critical fail
    console.error("Orchestration Critical Failure", error);
    updateStatus(AgentType.MASTER, AgentStatus.FAILED, `Critical failure: ${error.message}`);
    if (currentJob) {
       currentJob.isComplete = true;
       (currentJob as any).finalResult = null;
    }
  }
}
