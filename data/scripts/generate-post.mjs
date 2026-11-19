import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const POST_COUNT = Math.max(1, Number.parseInt(process.env.POST_COUNT || '1', 10) || 1);

const KEYWORDS_PATH = path.resolve('data/keywords.json');
const POSTS_DIR = path.resolve('src/content/posts');

const CATEGORY_LINKS = {
  chanel: { label: '샤넬 아카이브', href: '/chanel/' },
  hermes: { label: '에르메스 아카이브', href: '/hermes/' },
  louisvuitton: { label: '루이비통 아카이브', href: '/louisvuitton/' },
  guide: { label: '등급·판별 백과', href: '/guide/' },
};

// 홍보성/상업성 문구 혼입 방지용 필터
const BANNED_PATTERNS = [
  /카카오톡/i,
  /카톡/i,
  /텔레그램/i,
  /오픈채팅/i,
  /goacemall/i,
  /문의\s*주세요/i,
  /상담\s*받으/i,
  /주문\s*가능/i,
  /바로\s*구매/i,
  /할인\s*이벤트/i,
  /최저가/i,
  /https?:\/\/(?!repledaitda\.com)/i,
];

function getKstDateString() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function buildSystemPrompt() {
  return `당신은 하이엔드 가죽 공예, 봉제 공정, 하드웨어 마감, 등급 체계(미러급·SA급·올수공 등)를 객관적으로 기록하는 독립 리서치 매거진 '레플다있다 아카이브'의 수석 에디터입니다.

[절대 준수 규칙]
1. 순수 정보성·분석형 전문 블로그 문체(~합니다 / ~입니다)를 유지하세요.
2. 판매 유도, 홍보, 과장 광고("무조건 최고", "100% 동일", "문의하세요", "구매처 추천", 카카오톡·전화번호·외부 URL·특정 쇼핑몰 언급)를 절대 금지합니다.
3. 특정 공장을 근거 없이 과장하거나 확정적인 가격을 임의로 지어내지 말고, 가죽 물성·공정 차이·구조적 특징·시각적 검수(QC) 기준에 집중하세요.
4. 반드시 아래 JSON 스키마만 출력하세요. JSON 외의 설명이나 코드블록 마크다운(\`\`\`)을 앞뒤에 붙이지 마세요.

{
  "title": "구글 검색 CTR을 높이는 구체적이고 정보성 있는 제목 (연도 2026 또는 숫자/비교 포인트 포함, 28~52자)",
  "description": "검색 결과 요약에 노출될 메타 설명 (핵심 키워드 포함, 110~150자)",
  "summary": "글 상단 KEY SUMMARY 박스에 들어갈 2~3문장 핵심 결론 (180~260자)",
  "readingTime": "예상 읽기 시간 (예: 5분)",
  "tags": ["핵심태그1", "핵심태그2", "핵심태그3", "핵심태그4"],
  "faqs": [
    { "question": "독자가 실제로 검색할 만한 구체적 질문 1", "answer": "객관적이고 명확한 2~3문장 답변" },
    { "question": "질문 2", "answer": "답변 2" },
    { "question": "질문 3", "answer": "답변 3" },
    { "question": "질문 4", "answer": "답변 4" }
  ],
  "contentMarkdown": "본문 마크다운 전체 (최소 1,800자 이상)"
}

[contentMarkdown 작성 규칙]
- 본문에 H1(#)은 쓰지 마세요(레이아웃에서 자동 출력됨). H2(##)와 H3(###)만 사용하세요.
- 필수 구성:
  1) 도입부: 해당 주제가 검색·비교 과정에서 왜 혼동되는지 간결하게 정리
  2) 핵심 비교표: 마크다운 표(| 항목 | 기준 A | 기준 B |) 최소 1개 이상 필수 포함
  3) 세부 디테일 분석: 가죽 결, 땀수·스티치, 각인·하드웨어, 마감(엣지코트) 등을 H2/H3로 구조화
  4) 실전 점검 체크리스트: 불릿 리스트로 5~7개 핵심 확인 항목 정리
  5) 객관적 한계 및 주의사항: 사진과 실물의 조명 차이, 개체 편차 등 중립적 관점 제시
- 본문 하단 부근에 해당 카테고리 아카이브로의 내부 링크를 자연스럽게 1회 포함하세요.`;
}

function buildUserPrompt(item) {
  const catInfo = CATEGORY_LINKS[item.category];
  return `다음 주제로 전문 리서치 칼럼 1편을 작성해 주세요.

- 핵심 타겟 키워드: ${item.keyword}
- 카테고리: ${catInfo.label} (내부 링크 경로: ${catInfo.href})
- 집필 방향(Angle): ${item.angle}
- 기준 연도: 2026년

핵심 타겟 키워드와 관련 동의어를 제목, 메타 설명, 소제목(H2), 본문에 과하지 않고 자연스럽게 녹여 주세요. JSON 객체 형식으로만 응답하세요.`;
}

async function callDeepSeek(item) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.65,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(item) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('DeepSeek 응답 본문이 비어 있습니다.');
  }

  // 혹시 코드펜스가 섞였을 경우 대비
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

function validateArticle(article) {
  const requiredFields = ['title', 'description', 'summary', 'contentMarkdown'];
  for (const field of requiredFields) {
    if (typeof article[field] !== 'string' || article[field].trim().length < 10) {
      throw new Error(`필수 필드 누락 또는 너무 짧음: ${field}`);
    }
  }

  if (article.contentMarkdown.trim().length < 1200) {
    throw new Error(`본문 길이가 기준(1200자) 미만입니다: ${article.contentMarkdown.length}자`);
  }

  if (!article.contentMarkdown.includes('|')) {
    throw new Error('본문에 필수 비교표(Markdown Table)가 누락되었습니다.');
  }

  if (!Array.isArray(article.faqs) || article.faqs.length < 3) {
    throw new Error('FAQ 항목이 3개 미만입니다.');
  }

  const fullText = [
    article.title,
    article.description,
    article.summary,
    article.contentMarkdown,
    ...article.faqs.map((f) => `${f.question} ${f.answer}`),
  ].join('\n');

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(fullText)) {
      throw new Error(`금지된 홍보성 패턴이 감지되었습니다: ${pattern}`);
    }
  }
}

function serializeMarkdown(item, article, pubDate) {
  const tags = Array.isArray(article.tags)
    ? article.tags.map((t) => String(t).replace(/^#/, '').trim()).filter(Boolean).slice(0, 6)
    : [];

  const faqs = article.faqs
    .filter((f) => f && f.question && f.answer)
    .slice(0, 5)
    .map(
      (f) =>
        `  - question: ${JSON.stringify(String(f.question).trim())}\n    answer: ${JSON.stringify(String(f.answer).trim())}`
    )
    .join('\n');

  const readingTime =
    typeof article.readingTime === 'string' && article.readingTime.trim()
      ? article.readingTime.trim()
      : '5분';

  // 본문에 실수로 H1(# )이 들어갔다면 H2(## )로 안전 보정
  const safeBody = article.contentMarkdown
    .replace(/^#\s+/gm, '## ')
    .trim();

  return `---
title: ${JSON.stringify(article.title.trim())}
description: ${JSON.stringify(article.description.trim())}
pubDate: ${pubDate}
category: ${JSON.stringify(item.category)}
tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]
summary: ${JSON.stringify(article.summary.trim())}
readingTime: ${JSON.stringify(readingTime)}
faqs:
${faqs}
---

${safeBody}
`;
}

async function generateWithRetry(item, maxAttempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[시도 ${attempt}/${maxAttempts}] 생성 중: ${item.slug} (${item.keyword})`);
      const article = await callDeepSeek(item);
      validateArticle(article);
      return article;
    } catch (err) {
      lastError = err;
      console.warn(`[경고] 시도 ${attempt} 실패: ${err.message}`);
    }
  }
  throw lastError;
}

async function main() {
  if (!API_KEY) {
    throw new Error('환경변수 DEEPSEEK_API_KEY가 설정되어 있지 않습니다.');
  }

  await fs.mkdir(POSTS_DIR, { recursive: true });
  const rawKeywords = await fs.readFile(KEYWORDS_PATH, 'utf8');
  const keywords = JSON.parse(rawKeywords);

  const pendingItems = keywords.filter((k) => k.status === 'pending');
  if (pendingItems.length === 0) {
    console.log('발행 대기(pending) 중인 키워드가 없습니다. 작업을 종료합니다.');
    return;
  }

  const targets = pendingItems.slice(0, POST_COUNT);
  const pubDate = getKstDateString();
  let publishedCount = 0;

  for (const item of targets) {
    const filePath = path.join(POSTS_DIR, `${item.slug}.md`);

    try {
      await fs.access(filePath);
      console.log(`[스킵] 이미 존재하는 파일: ${item.slug}.md`);
      item.status = 'published';
      continue;
    } catch {
      // 파일이 없으면 정상 생성 진행
    }

    const article = await generateWithRetry(item);
    const mdContent = serializeMarkdown(item, article, pubDate);
    await fs.writeFile(filePath, mdContent, 'utf8');

    item.status = 'published';
    item.publishedAt = pubDate;
    publishedCount += 1;

    console.log(`[완료] 저장됨: src/content/posts/${item.slug}.md`);
    console.log(`       제목: ${article.title}`);
  }

  await fs.writeFile(KEYWORDS_PATH, `${JSON.stringify(keywords, null, 2)}\n`, 'utf8');
  console.log(`\n총 ${publishedCount}편의 아티클을 생성하고 keywords.json을 업데이트했습니다.`);
}

main().catch((err) => {
  console.error('[치명적 오류]', err.message);
  process.exit(1);
});