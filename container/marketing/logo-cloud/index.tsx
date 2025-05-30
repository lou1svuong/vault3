import { InfiniteSlider } from "@/components/ui/infinite-slider";
import ProgressiveBlur from "@/components/ui/progressive-blur";
import Image from "next/image";

export default function LogoCloud() {
  return (
    <section className="bg-background overflow-hidden border-t border-dashed py-4 lg:py-0  divide-x">
      <div className="group relative">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex items-center ml-4">
            <p className="text-end text-md font-semibold">Backed by the best</p>
            <p className="md:border-r h-10 ml-2"></p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/logo/sui.webp"
                  alt="Nvidia Logo"
                  height={50}
                  width={50}
                  className="mx-auto size-8 w-fit"
                />
                <p className="text-muted-foreground text-xl font-bold">Sui</p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/logo/aqua-move.png"
                  alt="Nvidia Logo"
                  height={50}
                  width={50}
                  className="mx-auto size-10 w-fit"
                />
                <p className="text-muted-foreground text-xl font-bold">
                  Aqua Move
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/logo/sui.webp"
                  alt="Nvidia Logo"
                  height={50}
                  width={50}
                  className="mx-auto size-8 w-fit"
                />
                <p className="text-muted-foreground text-xl font-bold">Sui</p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/logo/aqua-move.png"
                  alt="Nvidia Logo"
                  height={50}
                  width={50}
                  className="mx-auto size-10 w-fit"
                />
                <p className="text-muted-foreground text-xl font-bold">
                  Aqua Move
                </p>
              </div>
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
