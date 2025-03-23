import AppBar from "@/components/layout/app-bar";
import Image from "next/image";
import LiaisonForm from "@/components/agents/liaison-form";

export default function Home() {
  return (
    <div>
      <AppBar />
      <div className="mt-12">
        <div className="flex flex-col items-center justify-center">
          <div className="max-w-6xl grid grid-cols-12  mt-20 h-full gap-8">
            <div className="col-span-12 lg:col-span-7 lg:mt-16 flex flex-col items-center gap-2">
              <div className="mb-7">
                <Image
                  src="/liaison-agent.png"
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
            <div className="col-span-12 lg:col-span-5 ">
              <div className="flex items-center justify-center p-4">
                <LiaisonForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
