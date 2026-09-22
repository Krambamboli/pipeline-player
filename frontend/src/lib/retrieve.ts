const API_BASE = "http://localhost:8000/api/retrieve";

export interface RetrieveCollection {
  name: string;
  is_hybrid: boolean;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, any>;
}

export interface PrefetchResult {
  using: string;
  chunks: RetrievedChunk[];
}

export interface RetrieveResponse {
  rewritten_query: string;
  query_vectors: Record<string, any>;
  pre_fusion: PrefetchResult[];
  fused_results: RetrievedChunk[];
}

export async function getCollections(): Promise<RetrieveCollection[]> {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) throw new Error("Failed to fetch retrieve collections");
  return res.json();
}

export async function rewriteQuery(query: string): Promise<string> {
  const res = await fetch(`${API_BASE}/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to rewrite query");
  const data = await res.json();
  return data.rewritten_query;
}

export async function runRetrieve(
  collectionName: string,
  query: string,
  limit: number,
  fusionStrategy: string
): Promise<RetrieveResponse> {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection_name: collectionName,
      query,
      limit,
      fusion_strategy: fusionStrategy,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run retrieval");
  }
  return res.json();
}

/**
 * WHY: After retrieval, we want GPT-4o to synthesise a grounded answer
 * from the ranked chunks. We stream tokens in real-time for a typing effect.
 *
 * HOW: We POST the query + chunk texts to the /answer SSE endpoint and
 * read the response body as a stream, invoking the callback for each token.
 * Using fetch + ReadableStream because EventSource only supports GET requests.
 */
export async function generateAnswer(
  query: string,
  chunks: string[],
  model: string,
  imageRefs: { source: string; page: number }[] | undefined,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, chunks, model, image_references: imageRefs }),
  });

  if (!res.ok || !res.body) {
    onError("Failed to start answer generation");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // Parse SSE lines from the buffer
    const lines = buffer.split("\n");
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.slice(6);
        if (payload === "[DONE]") {
          onDone();
          return;
        }
        if (payload.startsWith("[ERROR]")) {
          onError(payload.slice(8));
          return;
        }
        onToken(payload);
      }
    }
  }
  onDone();
}
