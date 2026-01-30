import { LoginProjectBox } from "@/components/login/LoginProjectBox";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <header className="absolute top-8 right-8">
        <span className="font-playfair text-2xl font-semibold text-gray-700">
          AXcalibur
        </span>
      </header>
      <h1 className="font-playfair text-[128px] font-bold tracking-widest text-gray-800 mb-4">
        AVALON
      </h1>
      <LoginProjectBox />
      <footer className="mt-12 text-gray-400 text-xs text-center leading-relaxed">
        <p>
          데모를 위해 Static Export을 하며 파일 경로 기반 라우팅을 쿼리 파라미터
          방식으로 변경하였고
        </p>
        <p>
          MSW(Mock Service Worker)를 활용하여 가상 서버 환경을 구축하였습니다.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
