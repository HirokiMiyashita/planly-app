import { useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { 
    isLineBrowser, 
    user, 
    isAuthenticated,
    setLineBrowser, 
    setUser, 
    setAuthenticated,
    logout 
  } = useAuthStore();

  // LINE内ブラウザかどうかを判定
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isLine = userAgent.includes('line');
    setLineBrowser(isLine);
  }, [setLineBrowser]);

  // NextAuth.jsのセッション状態をZustandストアに同期
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.lineUserId && session?.user?.lineUserName) {
      setUser({
        lineUserId: session.user.lineUserId,
        lineUserName: session.user.lineUserName,
      });
    } else {
      setUser(null);
    }
  }, [session, status, setUser]);

  // LINE内ブラウザでの自動ログイン
  useEffect(() => {
    if (isLineBrowser && status === 'unauthenticated') {
      signIn('line');
    }
  }, [isLineBrowser, status]);

  const handleSignIn = () => signIn('line');
  const handleSignOut = () => {
    signOut();
    logout();
  };

  return {
    // 状態
    isLineBrowser,
    user,
    isAuthenticated,
    isLoading: status === 'loading',
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
};
