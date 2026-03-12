export interface AuditOptions {
  /** Domain to audit (e.g. "example.com") */
  domain: string;
  /** Company/brand name for knowledge graph search (default: domain) */
  companyName?: string;
  /** HTTP request timeout in ms (default: 10000) */
  timeout?: number;
  /** Progress callback */
  onProgress?: (event: ProgressEvent) => void;
}

export interface ProgressEvent {
  step: 'started' | 'crawlerAccess' | 'structuredData' | 'knowledgeGraph' | 'contentBasics' | 'completed';
  completed: number;
  total: number;
}

export interface DimensionResult {
  score: number;
  detail: Record<string, unknown>;
}

export interface Recommendation {
  priority: 'high' | 'medium';
  category: 'crawlerAccess' | 'structuredData' | 'knowledgeGraph' | 'contentBasics';
  action_en: string;
  action_zh: string;
}

export interface AuditResult {
  domain: string;
  overallScore: number;
  dimensions: {
    crawlerAccess: DimensionResult;
    structuredData: DimensionResult;
    knowledgeGraph: DimensionResult;
    contentBasics: DimensionResult;
  };
  recommendations: Recommendation[];
}
