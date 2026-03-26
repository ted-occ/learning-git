export interface StepInfo {
  id: string;
  title: string;
  commandCount: number;
  commandStartIndex: number; // global 0-based start index
}

export function extractSteps(markdown: string): StepInfo[] {
  const steps: StepInfo[] = [];
  const stepRegex = /^### (\d+-\d+)\.\s+(.+)$/gm;
  const matches: { id: string; title: string; index: number }[] = [];

  let match;
  while ((match = stepRegex.exec(markdown)) !== null) {
    matches.push({ id: match[1], title: match[2], index: match.index });
  }

  let globalIndex = 0;
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const sectionContent = markdown.slice(start, end);

    const codeBlocks = sectionContent.match(/^```[^\n]*\n[\s\S]*?^```/gm);
    const commandCount = codeBlocks ? codeBlocks.length : 0;

    steps.push({
      id: matches[i].id,
      title: matches[i].title,
      commandCount,
      commandStartIndex: globalIndex,
    });

    globalIndex += commandCount;
  }

  return steps;
}
