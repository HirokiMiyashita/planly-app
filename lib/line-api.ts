import axios from "axios";

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!CHANNEL_ACCESS_TOKEN) {
  throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
}

// プッシュメッセージを送信
export async function sendPushMessage(userId: string, message: string) {
  try {
    const response = await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
      },
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("LINE API Error:", error);
    return { success: false, error };
  }
}

// 複数のユーザーに一斉送信
export async function sendBroadcastMessage(userIds: string[], message: string) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushMessage(userId, message)),
  );

  const successful = results.filter(
    (result) => result.status === "fulfilled" && result.value.success,
  ).length;

  return {
    success: successful > 0,
    sent: successful,
    total: userIds.length,
  };
}

// イベント確定通知メッセージを生成
export function createEventConfirmedMessage(
  eventTitle: string,
  confirmedDate: string,
  confirmedTime: string,
  participationStatus: string,
) {
  const appUrl = `${process.env.NEXTAUTH_URL}/attendEvent`;
  const baseMessage = `🎉 イベントが確定しました！

📅 イベント名: ${eventTitle}
🕒 確定日時: ${confirmedDate} ${confirmedTime}
🔗 確認URL: ${appUrl}`;

  switch (participationStatus) {
    case "○":
      return `${baseMessage}

ご参加ありがとうございました！`;

    case "△":
      return `${baseMessage}

あなたは△でしたが、どうするか作成者に言ってくださいね。`;

    case "×":
      return `${baseMessage}

確定しましたが不参加のようですね。またのご参加お待ちしております。`;

    default:
      return `${baseMessage}

アンケートにご参加ありがとうございました！`;
  }
}
