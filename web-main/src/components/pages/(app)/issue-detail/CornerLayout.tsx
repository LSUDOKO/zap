interface CornerLayoutProps {
  children: React.ReactNode;
}

export default function CornerLayout({ children }: CornerLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-3 py-1 relative">
      <div className="absolute left-0 top-1 bottom-0 w-px bg-gray-200"></div>
      <div className="absolute right-0 top-1 bottom-0 w-px bg-gray-200"></div>
      
      <div className="absolute top-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 left-1 w-6 h-2 border-l-2 border-t-2 border-gray-400"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 top-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute top-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 right-0 w-6 h-2 border-r-2 border-t-2 border-gray-400"></div>
        </div>
      </div>

      {children}

      <div className="absolute bottom-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 left-1 w-6 h-2 border-l-2 border-b-2 border-gray-400"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 bottom-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute bottom-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 right-0 w-6 h-2 border-r-2 border-b-2 border-gray-400"></div>
        </div>
      </div>
    </div>
  );
}