import { Outlet } from '@tanstack/react-router';
import AnimatedBubbles from './AnimatedBubbles';
import AuthSidebar from './AuthSidebar';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full relative overflow-hidden bg-gradient-to-tr from-[#0c2139] via-[#105372] to-[#2db5cd]">
      <AnimatedBubbles />
      <AuthSidebar />
      <main className="w-full md:w-1/2 bg-gradient-to-b from-[#eaf8fc] via-[#e7f0f8] to-[#f5fbfd] flex items-center justify-center p-6 md:p-10 z-20">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}