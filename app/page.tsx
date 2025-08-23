"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [candidateDates, setCandidateDates] = useState<Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [customDate, setCustomDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultStartTime, setDefaultStartTime] = useState("");
  const [defaultEndTime, setDefaultEndTime] = useState("");
  const [lineUserName, setLineUserName] = useState("");
  const [lineUserId, setLineUserId] = useState("");

  // LINE内ブラウザかどうかを判定
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isLine = userAgent.includes('line');
    
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
      // アクセストークンがある場合はユーザー情報を取得
      fetchLineUserInfo(accessToken);
    } else if (isLine) {
      // LINE内ブラウザでアクセストークンがない場合は自動的にログインページにリダイレクト
      window.location.href = getLineLoginUrl();
    }
  }, []);

  // LINE APIからユーザー情報を取得
  const fetchLineUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('/api/line/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLineUserName(data.userName);
        setLineUserId(data.userId);
      } else {
        console.error('Failed to get user info:', data.message);
      }
    } catch (error) {
      console.error('LINE user info fetch error:', error);
    }
  };

  // LINE Login URLを生成
  const getLineLoginUrl = () => {
    const clientId = '2007979395';
    const redirectUri = encodeURIComponent('https://5d9ea260ba14.ngrok-free.app/api/line/callback');
    const state = Math.random().toString(36).substring(7);
    
    return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid`;
  };

  // 候補日を追加する関数
  const addCandidateDate = (date: string) => {
    if (date && !candidateDates.some(candidate => candidate.date === date)) {
      setCandidateDates([...candidateDates, {
        date,
        startTime: defaultStartTime,
        endTime: defaultEndTime
      }]);
    }
  };
  console.log(candidateDates);
  // 候補日を削除する関数
  const removeCandidateDate = (dateToRemove: string) => {
    setCandidateDates(candidateDates.filter(candidate => candidate.date !== dateToRemove));
  };

  // 候補日の時間を更新する関数
  const updateCandidateTime = (date: string, field: 'startTime' | 'endTime', value: string) => {
    setCandidateDates(candidateDates.map(candidate => 
      candidate.date === date 
        ? { ...candidate, [field]: value }
        : candidate
    ));
  };

  // 今日の日付を取得
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 明日の日付を取得
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // 来週の日付を取得（7日後）
  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  // 日付を日本語形式で表示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `${dateString} (今日)`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${dateString} (明日)`;
    } else {
      return dateString;
    }
  };
  return (
    <>
      {/* ヘッダー */}
      <header className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">新規イベント作成</div>
          <div className="flex items-center gap-2">
            {lineUserName ? (
              <span className="text-sm text-gray-600">ようこそ、{lineUserName}さん</span>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = getLineLoginUrl()}
              >
                LINEでログイン
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-4 space-y-6">
        {/* イベント名 */}
        <div className="space-y-2">
          <Label htmlFor="event-name" className="text-sm font-medium border-l-4 border-red-400 pl-2">
            イベント名
          </Label>
          <p className="text-xs text-gray-500">例) お盆のテニスの開催予定</p>
          <Input 
            id="event-name"
            placeholder="イベント名を入力してください"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        {/* 説明文 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium border-l-4 border-red-400 pl-2">
            説明文
          </Label>
          <p className="text-xs text-gray-500">例) 門真市のテニスコートで試合形式で開催します</p>
          <Textarea 
            id="description"
            placeholder="イベントの詳細を入力してください"
            className="min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 開催日時 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium border-l-4 border-red-400 pl-2">
            開催候補日時
          </Label>
          
          {/* 候補日選択 */}
          <div className="space-y-3">
            <Label className="text-xs text-gray-500">
              候補日
            </Label>
            
            {/* クイック選択 */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => addCandidateDate(getToday())}
                title="今日の日付を候補日として追加"
              >
                今日を追加
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => addCandidateDate(getTomorrow())}
                title="明日の日付を候補日として追加"
              >
                明日を追加
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => addCandidateDate(getNextWeek())}
                title="来週の日付を候補日として追加"
              >
                来週を追加
              </Button>
            </div>
            
            {/* カスタム日付追加 */}
            <div className="flex items-center gap-2">
              <Input 
                type="date"
                placeholder="日付を選択"
                className="flex-1"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  addCandidateDate(customDate);
                  setCustomDate("");
                }}
              >
                追加
              </Button>
            </div>
            
            {/* 選択された候補日 */}
            {candidateDates.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-gray-500">選択された候補日:</div>
                <div className="space-y-2">
                  {candidateDates.map((candidate) => (
                    <div key={candidate.date} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatDate(candidate.date)}</span>
                        <button 
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => removeCandidateDate(candidate.date)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 w-[85%]">
                          <Label className="text-xs text-gray-500">開始時間</Label>
                          <Input 
                            type="time"
                            value={candidate.startTime}
                            onChange={(e) => updateCandidateTime(candidate.date, 'startTime', e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1 w-[85%]">
                          <Label className="text-xs text-gray-500">終了時間</Label>
                          <Input 
                            type="time"
                            value={candidate.endTime}
                            onChange={(e) => updateCandidateTime(candidate.date, 'endTime', e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* デフォルト時間設定 */}
          <div className="space-y-2 pt-4">
            <Label className="text-xs text-gray-500">
              デフォルト時間（新規候補日に適用）
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center py-2">
                  <span className="text-xs text-gray-500 pl-4">開始</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 bg-blue-50 hover:bg-blue-100 ml-4"
                    onClick={() => {
                      const now = new Date();
                      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                      setDefaultStartTime(timeString);
                    }}
                    title="現在時刻を設定"
                  >
                    🕐 現在時刻
                  </Button>
                </div>
                <Input 
                  type="time"
                  placeholder="開始時間"
                  value={defaultStartTime}
                  onChange={(e) => setDefaultStartTime(e.target.value)}
                  className="w-[85%] mx-auto"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center py-2">
                  <span className="text-xs text-gray-500 pl-4">終了</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 bg-green-50 hover:bg-green-100 ml-4"
                    onClick={() => {
                      if (defaultStartTime) {
                        const [hours, minutes] = defaultStartTime.split(':');
                        const endTime = new Date();
                        endTime.setHours(parseInt(hours) + 1, parseInt(minutes));
                        const timeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                        setDefaultEndTime(timeString);
                      }
                    }}
                    title="開始時刻から1時間後を設定"
                  >
                    ⏰ 1時間後
                  </Button>
                </div>
                <Input 
                  type="time"
                  placeholder="終了時間"
                  value={defaultEndTime}
                  onChange={(e) => setDefaultEndTime(e.target.value)}
                  className="w-[85%] mx-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={async () => {
              try {
                if (!lineUserId) {
                  alert('LINEログインが必要です。先にLINEでログインしてください。');
                  return;
                }
                
                const response = await fetch('/api/events', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    eventName,
                    description,
                    candidateDates,
                    defaultStartTime,
                    defaultEndTime,
                    createdBy: lineUserId,
                  }),
                });

                const data = await response.json();

                if (data.success) {
                  alert('イベントが正常に保存されました！');
                  // フォームをリセット
                  setEventName('');
                  setDescription('');
                  setCandidateDates([]);
                  setDefaultStartTime('');
                  setDefaultEndTime('');
                  setCustomDate('');
                } else {
                  alert('保存に失敗しました: ' + data.message);
                }
              } catch (error) {
                console.error('保存エラー:', error);
                alert('保存中にエラーが発生しました');
              }
            }}
          >
            保存
          </Button>
          <Button 
            className="flex-1"
            onClick={() => {
              console.log("プレビューデータ:", {
                eventName,
                description,
                candidateDates,
                defaultStartTime,
                defaultEndTime,
              });
              alert('プレビュー機能です！');
            }}
          >
            プレビュー
          </Button>
        </div>
      </main>
    </>
  );
}
