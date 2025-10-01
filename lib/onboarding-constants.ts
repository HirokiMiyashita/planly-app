export interface OnboardingStep {
  title: string;
  content: string;
  image: string;
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
  pageKey: string;
}

// ページごとのオンボーディング設定
export const ONBOARDING_CONFIGS: Record<string, OnboardingConfig> = {
  // ホームページ用
  home: {
    pageKey: "home",
    steps: [
      {
        title: "Planlyへようこそ！",
        content: "Planlyは、グループでイベントの日程を調整できるアプリです。",
        image: "👋",
      },
      {
        title: "イベントを作成",
        content: "「イベント作成」から、イベント名と候補日時を設定できます。",
        image: "📅",
      },
      {
        title: "参加者を招待",
        content:
          "作成したイベントの「招待」ボタンから、参加者にURLを共有できます。",
        image: "📤",
      },
      {
        title: "参加表明",
        content:
          "招待されたURLから、○（参加）、△（未定）、×（不参加）で回答できます。",
        image: "✅",
      },
      {
        title: "日程を確定",
        content:
          "参加状況を確認して、「この日時で確定」ボタンでイベントを確定できます。",
        image: "🎉",
      },
    ],
  },

  // イベント作成ページ用
  createEvent: {
    pageKey: "createEvent",
    steps: [
      {
        title: "イベント作成のコツ",
        content:
          "イベント名は分かりやすく、候補日時は複数設定することをお勧めします。",
        image: "💡",
      },
      {
        title: "日時の設定",
        content: "参加者の都合を考慮して、複数の候補日時を設定しましょう。",
        image: "📅",
      },
      {
        title: "詳細情報の入力",
        content: "場所や詳細な説明があると、参加者が判断しやすくなります。",
        image: "📝",
      },
    ],
  },

  // 参加表明ページ用
  participation: {
    pageKey: "participation",
    steps: [
      {
        title: "参加表明の方法",
        content: "○（参加）、△（未定）、×（不参加）で回答してください。",
        image: "✅",
      },
      {
        title: "コメントの活用",
        content: "コメント欄で都合の良い時間帯や要望があれば記入してください。",
        image: "💬",
      },
      {
        title: "回答の変更",
        content: "回答後も変更可能です。都合が変わった場合は更新してください。",
        image: "🔄",
      },
    ],
  },

  // マイイベントページ用
  myEvents: {
    pageKey: "myEvents",
    steps: [
      {
        title: "作成したイベントの管理",
        content: "ここで作成したイベントの一覧を確認できます。",
        image: "📋",
      },
      {
        title: "参加状況の確認",
        content: "各イベントの参加状況をリアルタイムで確認できます。",
        image: "👥",
      },
      {
        title: "イベントの確定",
        content: "参加状況を見て、最適な日時でイベントを確定できます。",
        image: "🎯",
      },
    ],
  },

  // 参加イベントページ用
  attendEvent: {
    pageKey: "attendEvent",
    steps: [
      {
        title: "参加予定のイベント",
        content: "招待されたイベントの一覧を確認できます。",
        image: "📅",
      },
      {
        title: "参加表明の確認",
        content: "自分の回答状況を確認し、必要に応じて変更できます。",
        image: "✅",
      },
      {
        title: "イベント詳細",
        content: "各イベントの詳細情報や参加者一覧を確認できます。",
        image: "📊",
      },
    ],
  },
};

// デフォルトのオンボーディング設定（ホームページ用）
export const DEFAULT_ONBOARDING_CONFIG = ONBOARDING_CONFIGS.home;

// ページパスからオンボーディング設定を取得する関数
export function getOnboardingConfigByPath(pathname: string): OnboardingConfig {
  // パスに基づいて適切な設定を返す
  if (pathname.includes("/createEvent")) {
    return ONBOARDING_CONFIGS.createEvent;
  }
  if (pathname.includes("/participation")) {
    return ONBOARDING_CONFIGS.participation;
  }
  if (pathname.includes("/myEvents")) {
    return ONBOARDING_CONFIGS.myEvents;
  }
  if (pathname.includes("/attendEvent")) {
    return ONBOARDING_CONFIGS.attendEvent;
  }

  // デフォルトはホームページ用
  return DEFAULT_ONBOARDING_CONFIG;
}
