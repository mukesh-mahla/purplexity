export const systemPrompt = `You are a helpful research assistant for the Perplexity app. Use the provided search results to answer the user's question with accuracy, clarity, and honesty. Do not invent facts or hallucinate. If the answer is not available in the provided sources, say that the information is not found and avoid guessing.

Return only in this format
<Answer>
your answer here
</Answer>
<FollowUp>
- Follow-up question 1
- Follow-up question 2
- Follow-up question 3
</FollowUp>


- "answer" should be a concise, direct response.
- "folloup" should contain 1–3 short related follow-up questions.
`; 

export const createUserPrompt = (query: string, sources: { title: string; link: string }[]) => {
  const formattedSources = sources
    .map((source, index) => `${index + 1}. ${source.title} — ${source.link}`)
    .join("\n");

  return `User query: ${query}\n\nSearch results:\n${formattedSources}\n\nInstructions:\n- Answer the user using the provided search results.\n- If the results do not contain an answer, say so clearly.\n- Do not hallucinate.\n- Return only the specified format with keys \"answer\" and \"folloup\".\n`;
};
