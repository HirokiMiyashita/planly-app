import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
}

export default function Header({title}: HeaderProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  return (
    <header className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{title}</p>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">ようこそ、{user?.lineUserName}さん</span>
            </div>
        </div>
    </header>
  );
}