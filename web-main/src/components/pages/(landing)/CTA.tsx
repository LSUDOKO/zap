import Link from "next/link"
import { Button } from "../../ui/button"
import { HiArrowRight } from "react-icons/hi2"

export default function CTA() {
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
                <main className="px-8 py-16 bg-gray-50 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Ready to Start Contributing?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Join thousands of open source contributors earning rewards for their valuable contributions through verified pull requests.
                        </p>
                        <Button 
                            asChild
                            className="cursor-pointer bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
                        >
                            <Link href="/issues" className="flex items-center gap-2">
                                Start Explore
                                <HiArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
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
    )
}