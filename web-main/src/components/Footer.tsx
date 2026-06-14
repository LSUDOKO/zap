export default function Footer() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-1 relative mt-12">
      <div className="absolute left-0 top-1 bottom-0 w-px bg-gray-200"></div>
      <div className="absolute right-0 top-1 bottom-0 w-px bg-gray-200"></div>

      <div className="absolute top-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 left-1 w-6 h-2 border-l-2 border-t-2 border-black"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 top-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute top-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute top-0 right-0 w-6 h-2 border-r-2 border-t-2 border-black"></div>
        </div>
      </div>

      <div className="bg-white overflow-hidden border-t border-gray-300">
        <footer className="px-8 py-12 bg-gray-50">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tight opacity-50">
              zkPull
            </h1>
          </div>
          
          <div className="border-t border-gray-300 pt-8">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
              <div className="text-center">
                <p className="text-sm text-gray-900 font-medium">
                  zkPull &copy; {new Date().getFullYear()}
                </p>
                <p className="text-sm text-gray-600">
                  Powered by zkTLS technology on Mantle blockchain.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <div className="absolute bottom-[-5] left-[-4] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 left-1 w-6 h-2 border-l-2 border-b-2 border-black"></div>
        </div>
      </div>

      <div className="absolute bg-gray-200 bottom-[-5] w-[99%] flex items-center justify-center border border-gray-200"></div>

      <div className="absolute bottom-[-5] right-[-1] z-20">
        <div className="w-6 h-6">
          <div className="absolute bottom-0 right-0 w-6 h-2 border-r-2 border-b-2 border-black"></div>
        </div>
      </div>
    </div>
  );
}
