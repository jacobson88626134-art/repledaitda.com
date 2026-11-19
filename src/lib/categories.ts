export type CategoryKey = 'chanel' | 'hermes' | 'louisvuitton' | 'guide';

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  enLabel: string;
  href: string;
  title: string;
  description: string;
  intro: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  chanel: {
    key: 'chanel',
    label: '샤넬 아카이브',
    enLabel: 'CHANEL',
    href: '/chanel/',
    title: '샤넬 미러급·레플리카 소재 및 공정 분석 아카이브',
    description:
      '샤넬 클래식 플랩백, 22백, 지갑류의 램스킨·캐비어 가죽 차이, 마이크로 내장칩 구조, 커뮤니티 주요 검수 체크포인트를 객관적으로 분석합니다.',
    intro:
      '캐비어와 램스킨의 유분·엠보싱 차이부터 2021년 이후 도입된 마이크로 내장칩, 다이아몬드 퀼팅 땀수 비율까지 샤넬 주요 라인업의 디테일과 등급 기준을 기록하는 아카이브입니다.',
  },
  hermes: {
    key: 'hermes',
    label: '에르메스 아카이브',
    enLabel: 'HERMES',
    href: '/hermes/',
    title: '에르메스 레플리카 가죽·올수공 새들스티치 분석 아카이브',
    description:
      '에르메스 버킨, 켈리, 콘스탄스의 토고·엡솜·끌레망스 가죽 특성, 올수공 새들 스티치와 반수공·미싱 공정 차이, 각인 판별 기준을 정리합니다.',
    intro:
      '하이엔드 가죽 공예의 정점인 에르메스 라인업에서 토고·엡솜 가죽의 결, 밀랍사 사선 새들 스티치, 하드웨어 각인 깊이에 따른 공정별 차이를 체계적으로 다룹니다.',
  },
  louisvuitton: {
    key: 'louisvuitton',
    label: '루이비통 아카이브',
    enLabel: 'LOUIS VUITTON',
    href: '/louisvuitton/',
    title: '루이비통 캔버스·지갑 레플리카 디테일 분석 아카이브',
    description:
      '루이비통 모노그램·다미에 캔버스 코팅 질감, 카우하이드 태닝 변화, 지갑류 대칭 패턴과 박음질 기준을 객관적으로 정리합니다.',
    intro:
      '모노그램 캔버스의 광택과 유연성, 카우하이드 가죽의 에이징 특성, 그리고 가장 수요가 높은 지갑·파우치류의 패턴 대칭과 마감 기준을 분석합니다.',
  },
  guide: {
    key: 'guide',
    label: '등급·판별 백과',
    enLabel: 'GUIDE',
    href: '/guide/',
    title: '미러급 vs SA급 차이 및 명품 레플리카 용어·검수 백과',
    description:
      '미러급, SA급, 커스텀급 등 시장에서 혼용되는 등급 용어의 실제 공정 차이와 가방·지갑 공통 검수(QC) 체크리스트를 정리한 리서치 백과입니다.',
    intro:
      '검색 과정에서 가장 혼동하기 쉬운 미러급·SA급·1:1 등급의 실제 기준과 소재, 바느질, 금속 도금, 마감 상태를 스스로 점검할 수 있는 공통 리서치 가이드를 제공합니다.',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);