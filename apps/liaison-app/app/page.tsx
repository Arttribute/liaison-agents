import AppBar from "@/components/layout/app-bar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <AppBar />
      <div className="mt-12">
        <div className="relative flex h-[300px] flex-col items-center rounded-lg bg-background">
          <div className="max-w-6xl grid grid-cols-12 mt-12 h-full items-center z-10 gap-8">
            <div className="col-span-12 lg:col-span-6">
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Liaison Agents"
                  className="rounded-xl"
                  width={800}
                  height={800}
                />
              </div>
              <div>
                <Image
                  src="/liaison-h.png"
                  alt="Simple private connectors that let agents act onchain"
                  className="rounded-xl"
                  width={800}
                  height={800}
                />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <div className="border border-gray-400 rounded-xl p-4 h-96 w-96"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
