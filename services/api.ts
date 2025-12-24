
import { AgentStatus, AgentType, JobStatus, QueryPayload, StructuredResult, WebFinding } from '../types';
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";

const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A comprehensive executive summary." },
    market_analysis: { type: Type.STRING },
    clinical_analysis: { type: Type.STRING },
    ip_analysis: { type: Type.STRING },
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
      required: ["sales_mn_usd", "cagr", "top_competitors", "indication", "source"]
    },
    go_to_market: {
      type: Type.OBJECT,
      properties: {
        launch_viability_score: { type: Type.NUMBER },
        viability_reasoning: { type: Type.STRING },
        recommended_strategy: { type: Type.STRING },
        optimal_price_band: { type: Type.STRING },
        time_to_market: { type: Type.STRING },
        tier_distribution: {
          type: Type.OBJECT,
          properties: {
             tier1: { type: Type.NUMBER },
             tier2: { type: Type.NUMBER },
             tier3: { type: Type.NUMBER }
          }
        },
        epidemiology: {
            type: Type.OBJECT,
            properties: {
                prevalence: { type: Type.STRING },
                patient_population: { type: Type.STRING },
                source: { type: Type.STRING }
            }
        },
        regulatory_hurdles: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    indication_expansion: {
        type: Type.OBJECT,
        properties: {
            overall_repurposing_score: { type: Type.NUMBER },
            potential_indications: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        indication: { type: Type.STRING },
                        evidence_strength: { type: Type.STRING },
                        mechanism_link: { type: Type.STRING },
                        estimated_cost: { type: Type.STRING },
                        estimated_duration: { type: Type.STRING }
                    }
                }
            }
        }
    },
    patents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          patent_id: { type: Type.STRING },
          assignee: { type: Type.STRING },
          expiry: { type: Type.STRING },
          summary: { type: Type.STRING },
          patent_type: { type: Type.STRING },
          remaining_years: { type: Type.NUMBER },
          source: { type: Type.STRING }
        }
      }
    },
    trials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          phase: { type: Type.STRING },
          status: { type: Type.STRING },
          sponsor: { type: Type.STRING },
          source: { type: Type.STRING }
        }
      }
    },
    exim: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          import_volume: { type: Type.NUMBER },
          export_volume: { type: Type.NUMBER },
          source: { type: Type.STRING }
        }
      }
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          market_share_index: { type: Type.NUMBER },
          innovation_index: { type: Type.NUMBER },
          type: { type: Type.STRING }
        }
      }
    },
    whitespace_score: { type: Type.NUMBER },
    biosimilar_score: { type: Type.NUMBER }
  },
  required: ["summary", "market", "go_to_market", "patents", "trials", "swot", "competitors"]
};

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseDelay = 15000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 429 || error?.code === 429)) {
      await delay(baseDelay);
      return retryWithBackoff(fn, retries - 1, baseDelay * 2);
    }
    throw error;
  }
}

const extractSources = (response: GenerateContentResponse): WebFinding[] => {
  const sources: WebFinding[] = [];
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  if (groundingMetadata?.groundingChunks) {
    groundingMetadata.groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Reference",
          url: chunk.web.uri,
          snippet: "",
          confidence: 1
        });
      }
    });
  }
  return sources;
};

const THOUGHT_LIBRARY: Record<string, string[]> = {
  [AgentType.COUNCIL_HEAD]: ["Supporting market hypothesis...", "Validating strategic conclusions...", "Reinforcing key takeaways..."],
  [AgentType.COUNCIL_CRITIC]: ["Scanning for data inconsistencies...", "Challenging revenue projections...", "Questioning clinical timelines..."],
  [AgentType.COUNCIL_JUDGE]: ["Synthesizing debate points...", "Refining final intelligence...", "Ensuring absolute accuracy..."],
  [AgentType.MARKET]: ["Scraping latest sales data...", "Reviewing growth reports...", "Analyzing market penetration..."],
  [AgentType.PRICING]: ["Comparing competitor price lists...", "Checking reimbursement tiers...", "Analyzing hospital procurement..."],
  [AgentType.EXIM]: ["Monitoring customs data...", "Analyzing shipping logs...", "Reviewing import licenses..."],
  [AgentType.PATENT]: ["Scanning USPTO/EPO registries...", "Reviewing FTO litigations...", "Calculating expiry dates..."],
  [AgentType.TRIALS]: ["Scraping clinicaltrials.gov...", "Reviewing phase III results...", "Monitoring trial recruitment..."],
  [AgentType.SCIENTIFIC]: ["Mining PubMed for papers...", "Scanning pre-print servers...", "Analyzing molecular pathways..."],
};

let currentJob: JobStatus | null = null;
let chatInstance: Chat | null = null;

export const ChatService = {
  initializeChat: (context?: StructuredResult) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let systemInstruction = "You are the MoleculeX AI Assistant, a pharma research expert.";
    if (context) {
      systemInstruction += `\n\nCONTEXT: Market: ${context.market.sales_mn_usd}M. GTM Score: ${context.go_to_market?.launch_viability_score}.`;
    }
    chatInstance = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction },
    });
  },
  sendMessage: async (message: string): Promise<string> => {
    if (!chatInstance) ChatService.initializeChat();
    try {
      const result = await chatInstance!.sendMessage({ message });
      return result.text || "Error processing chat.";
    } catch (error) {
      return "Error processing chat.";
    }
  }
};

export const ApiService = {
  startQuery: async (payload: QueryPayload): Promise<{ job_id: string }> => {
    const jobId = `job_${Date.now()}`;
    const allAgents: Record<string, AgentStatus> = {};
    Object.values(AgentType).forEach(type => {
      allAgents[type] = AgentStatus.WAITING;
    });

    currentJob = {
      jobId,
      progress: 0,
      isComplete: false,
      agents: allAgents,
      agentThoughts: {},
      logs: []
    };
    runOrchestrator(jobId, payload);
    return { job_id: jobId };
  },
  getStatus: async (jobId: string): Promise<JobStatus> => {
    if (!currentJob || currentJob.jobId !== jobId) throw new Error("Job not found");
    return { ...currentJob };
  },
  getResult: async (jobId: string): Promise<StructuredResult> => {
    return (currentJob as any).finalResult; 
  }
};

async function runOrchestrator(jobId: string, payload: QueryPayload) {
  if (!currentJob) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelReasoning = 'gemini-3-pro-preview';
  const modelFast = 'gemini-3-flash-preview';

  const updateStatus = (agent: AgentType, status: AgentStatus, message?: string) => {
    if (!currentJob) return;
    currentJob.agents[agent] = status;
    if (status !== AgentStatus.RUNNING) delete currentJob.agentThoughts[agent];
    if (message) {
      currentJob.logs.unshift({ id: `l_${Date.now()}_${agent}`, agent, message, timestamp: new Date().toISOString(), status });
    }
  };

  const executeAgentWithGrounding = async (agent: AgentType, prompt: string): Promise<{ text: string, sources: WebFinding[] }> => {
    updateStatus(agent, AgentStatus.RUNNING, `Scraping data for ${agent}...`);
    const thoughts = THOUGHT_LIBRARY[agent] || ["Searching databases...", "Analyzing findings...", "Validating data..."];
    let idx = 0;
    const interval = setInterval(() => {
      if (currentJob?.agents[agent] === AgentStatus.RUNNING) {
        currentJob.agentThoughts[agent] = thoughts[idx++ % thoughts.length];
      }
    }, 2500);

    try {
      // Explicitly type the retryWithBackoff call to resolve unknown property 'text' error
      const res = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
        model: modelFast,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      }));
      clearInterval(interval);
      updateStatus(agent, AgentStatus.COMPLETED);
      return { 
        text: res.text || "", 
        sources: extractSources(res)
      };
    } catch (e: any) {
      clearInterval(interval);
      updateStatus(agent, AgentStatus.FAILED, e.message);
      throw e;
    }
  };

  const executeReasoningAgent = async (agent: AgentType, prompt: string): Promise<string> => {
    updateStatus(agent, AgentStatus.RUNNING, `Processing ${agent}...`);
    try {
      // Explicitly type the retryWithBackoff call to resolve unknown property 'text' error
      const res = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
        model: modelReasoning,
        contents: prompt
      }));
      updateStatus(agent, AgentStatus.COMPLETED);
      return res.text || "";
    } catch (e: any) {
      updateStatus(agent, AgentStatus.FAILED, e.message);
      throw e;
    }
  };

  try {
    // 1. MASTER DELEGATION & SWARM (0% -> 50%)
    updateStatus(AgentType.MASTER, AgentStatus.RUNNING, "Master Agent: Initiating global swarm for web intelligence...");
    
    const swarmPrompts = {
      market: `Scrape CURRENT (2024-2025) sales data, market share, and growth trends for ${payload.query} in ${payload.region}.`,
      trials: `Scrape clinicaltrials.gov and recent journals for active Phase II/III trials for ${payload.query}. Identify top sponsors.`,
      patents: `Scrape patent registries for key molecules related to ${payload.query}. Find expiry dates and FTO risks.`,
      scientific: `Search for mechanism of action (MOA) breakthroughs and literature summaries for ${payload.query}.`,
      epidemiology: `Search WHO/CDC for prevalence and patient demographics of ${payload.query} in ${payload.region}.`,
      pricing: `Scrape current pricing and hospital procurement tiers for ${payload.query} in ${payload.region}.`
    };

    const swarmResults = await Promise.all([
      executeAgentWithGrounding(AgentType.MARKET, swarmPrompts.market),
      executeAgentWithGrounding(AgentType.TRIALS, swarmPrompts.trials),
      executeAgentWithGrounding(AgentType.PATENT, swarmPrompts.patents),
      executeAgentWithGrounding(AgentType.SCIENTIFIC, swarmPrompts.scientific),
      executeAgentWithGrounding(AgentType.EPIDEMIOLOGY, swarmPrompts.epidemiology),
      executeAgentWithGrounding(AgentType.PRICING, swarmPrompts.pricing)
    ]);

    const collectedContext = swarmResults.map(r => r.text).join("\n---\n");
    const allSources = swarmResults.flatMap(r => r.sources);
    currentJob.progress = 50;

    // 2. GENERATE DRAFT REPORT (50% -> 60%)
    updateStatus(AgentType.REPORT, AgentStatus.RUNNING, "Synthesizing raw data into intelligence draft...");
    const draftReportText = await executeReasoningAgent(AgentType.REPORT, 
      `ACT AS DRAFTER. Create a comprehensive report on ${payload.query} using this raw data:\n${collectedContext}. 
      Focus on Market Potential, Clinical Risks, and IP Barriers.`
    );
    currentJob.progress = 60;

    // 3. COUNCIL DEBATE (60% -> 90%)
    updateStatus(AgentType.MASTER, AgentStatus.RUNNING, "Master Agent: Submitting draft to Strategic Council for debate...");
    
    const headArgument = await executeReasoningAgent(AgentType.COUNCIL_HEAD, 
      `SUPPORTING ARGUMENT. Review this report: \n${draftReportText}\nProvide 3 strong reasons why this analysis is solid and the opportunities identified are viable.`
    );

    const criticArgument = await executeReasoningAgent(AgentType.COUNCIL_CRITIC, 
      `CRITICAL DEBATE. Review this report and the Head's support: \nReport: ${draftReportText}\nSupport: ${headArgument}\nFind 3 critical flaws, missing data gaps, or risks that were ignored. Be ruthless.`
    );

    updateStatus(AgentType.COUNCIL_JUDGE, AgentStatus.RUNNING, "Council Judge: Synthesizing final verdict...");
    const finalVerdict = await executeReasoningAgent(AgentType.COUNCIL_JUDGE, 
      `SYNTHESIS & JUDGMENT.
      Draft: ${draftReportText}
      Supporter: ${headArgument}
      Critic: ${criticArgument}
      Issue a final, corrected research directive that merges these insights into one definitive intelligence piece.`
    );
    currentJob.progress = 90;

    // 4. FINAL JSON OUTPUT (90% -> 100%)
    updateStatus(AgentType.REPORT, AgentStatus.RUNNING, "Finalizing report with Council directives...");
    // Explicitly type the retryWithBackoff call to resolve unknown property 'text' error
    const finalRes = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: modelReasoning,
      contents: `GENERATE FINAL JSON. 
      Context: ${collectedContext}
      Council Directive: ${finalVerdict}
      Query: ${payload.query}
      Region: ${payload.region}
      Ensure all schema requirements are met.`,
      config: { responseMimeType: "application/json", responseSchema: REPORT_SCHEMA }
    }));

    const resultData = JSON.parse(cleanJsonOutput(finalRes.text || "{}"));
    // Add collected web findings to the result
    resultData.web_findings = allSources;
    
    (currentJob as any).finalResult = resultData;
    currentJob.progress = 100;
    currentJob.isComplete = true;
    updateStatus(AgentType.MASTER, AgentStatus.COMPLETED, "Strategic analysis complete. Report verified by Council.");

  } catch (e: any) {
    updateStatus(AgentType.MASTER, AgentStatus.FAILED, e.message);
    currentJob.isComplete = true;
  }
}
