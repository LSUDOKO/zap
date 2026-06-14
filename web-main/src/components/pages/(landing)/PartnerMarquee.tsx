import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";

const partners = [
  {
    name: "Mantle",
    logo: "/images/Logo/mantle-logo.webp",
    width: 120,
    height: 40,
  },
  {
    name: "Mantle USD",
    logo: "/images/Logo/mantle-usd-logo.webp",
    width: 40,
    height: 40,
  },
  {
    name: "EigenLayer",
    logo: "/images/Logo/eigenlayer-seeklogo.svg",
    width: 120,
    height: 40,
  },
  {
    name: "Reclaim Protocol",
    logo: "/images/Logo/reclaim-protocol.webp",
    width: 70,
    height: 40,
  },
];

export default function PartnerMarquee() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-1 relative">
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
        <main className="px-8 py-12 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Powered By
          </h2>
          <div className="relative flex w-full items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center justify-center w-64 h-24"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="object-contain"
                  />
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-gray-50"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-50"></div>
          </div>
        </main>
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
