import type { AuditOptions, AuditResult } from '../types.js';
import { normalizeDomain, fetchHomepage } from './http.js';
import { checkCrawlerAccess } from './crawler-access.js';
import { checkStructuredData } from './structured-data.js';
import { checkKnowledgeGraph } from './knowledge-graph.js';
import { checkContentBasics } from './content-basics.js';
import { generateRecommendations } from './recommendations.js';

export async function audit(options: AuditOptions): Promise<AuditResult> {
  const domain = normalizeDomain(options.domain);
  const timeout = options.timeout ?? 10000;
  const searchTerm = options.companyName || domain;
  const progress = options.onProgress;

  progress?.({ step: 'started', completed: 0, total: 4 });

  // Run crawlerAccess + knowledgeGraph + fetchHomepage in parallel
  const [crawlerAccess, knowledgeGraph, homepage] = await Promise.all([
    checkCrawlerAccess(domain, timeout),
    checkKnowledgeGraph(searchTerm, timeout),
    fetchHomepage(domain, timeout),
  ]);

  progress?.({ step: 'crawlerAccess', completed: 1, total: 4 });

  // structuredData + contentBasics depend on homepage HTML
  const structuredData = checkStructuredData(homepage.html, homepage.error);
  progress?.({ step: 'structuredData', completed: 2, total: 4 });

  progress?.({ step: 'knowledgeGraph', completed: 3, total: 4 });

  const contentBasics = checkContentBasics(domain, homepage.html, homepage.error);
  progress?.({ step: 'contentBasics', completed: 4, total: 4 });

  // Calculate overall score
  const overallScore = Math.round(
    crawlerAccess.score * 0.3 +
    structuredData.score * 0.25 +
    knowledgeGraph.score * 0.2 +
    contentBasics.score * 0.25,
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    crawlerAccess,
    structuredData,
    knowledgeGraph,
    contentBasics,
  );

  progress?.({ step: 'completed', completed: 4, total: 4 });

  return {
    domain,
    overallScore,
    dimensions: {
      crawlerAccess,
      structuredData,
      knowledgeGraph,
      contentBasics,
    },
    recommendations,
  };
}
