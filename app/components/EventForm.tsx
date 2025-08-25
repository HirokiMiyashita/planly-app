'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createEvent } from '@/app/actions/eventActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EventForm() {
  const { user, signOut } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
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

  const addCandidateDate = (date: string) => {
    if (date && !candidateDates.some(candidate => candidate.date === date)) {
      setCandidateDates([...candidateDates, {
        date,
        startTime: defaultStartTime,
        endTime: defaultEndTime
      }]);
    }
  };

  const removeCandidateDate = (dateToRemove: string) => {
    setCandidateDates(candidateDates.filter(candidate => candidate.date !== dateToRemove));
  };

  const updateCandidateTime = (date: string, field: 'startTime' | 'endTime', value: string) => {
    setCandidateDates(candidateDates.map(candidate => 
      candidate.date === date 
        ? { ...candidate, [field]: value }
        : candidate
    ));
  };

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 候補日データをJSON文字列として追加
      formData.append('candidateDates', JSON.stringify(candidateDates));
      
      const result = await createEvent(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // フォームをリセット
        setEventName('');
        setDescription('');
        setCandidateDates([]);
        setDefaultStartTime('');
        setDefaultEndTime('');
        setCustomDate('');
        formRef.current?.reset();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '予期しないエラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">新規イベント作成</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ようこそ、{user?.lineUserName}さん</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form ref={formRef} action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm font-medium border-l-4 border-red-400 pl-2">
              イベント名
            </Label>
            <p className="text-xs text-gray-500">例) お盆のテニスの開催予定</p>
            <Input 
              id="eventName"
              name="eventName"
              placeholder="イベント名を入力してください"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium border-l-4 border-red-400 pl-2">
              説明文
            </Label>
            <p className="text-xs text-gray-500">例) 門真市のテニスコートで試合形式で開催します</p>
            <Textarea 
              id="description"
              name="description"
              placeholder="イベントの詳細を入力してください"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium border-l-4 border-red-400 pl-2">
              開催候補日時
            </Label>
            
            <div className="space-y-3">
              <Label className="text-xs text-gray-500">
                候補日
              </Label>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => addCandidateDate(getToday())}
                  title="今日の日付を候補日として追加"
                >
                  今日を追加
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => addCandidateDate(getTomorrow())}
                  title="明日の日付を候補日として追加"
                >
                  明日を追加
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => addCandidateDate(getNextWeek())}
                  title="来週の日付を候補日として追加"
                >
                  来週を追加
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input 
                  type="date"
                  placeholder="日付を選択"
                  className="flex-1"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
                <Button 
                  type="button"
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
              
              {candidateDates.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-500">選択された候補日:</div>
                  <div className="space-y-2">
                    {candidateDates.map((candidate) => (
                      <div key={candidate.date} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatDate(candidate.date)}</span>
                          <button 
                            type="button"
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

            <div className="space-y-2 pt-4">
              <Label className="text-xs text-gray-500">
                デフォルト時間（新規候補日に適用）
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center py-2">
                    <span className="text-xs text-gray-500 pl-4">開始</span>
                    <Button 
                      type="button"
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
                    name="defaultStartTime"
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
                      type="button"
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
                    name="defaultEndTime"
                    placeholder="終了時間"
                    value={defaultEndTime}
                    onChange={(e) => setDefaultEndTime(e.target.value)}
                    className="w-[85%] mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              variant="outline" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
            <Button 
              type="button"
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
        </form>
      </main>
    </>
  );
}
