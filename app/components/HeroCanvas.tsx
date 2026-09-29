/*
  h-[50vh]: 50% viewport height.
  overflow-hidden: clips the canvas if it overflows.
  relative: positioning context so the ShaderCanvas can use absolute inset-0.
*/
const HeroCanvas = ({ children }: { children: React.ReactNode }) => {
    return (
        <section className="relative w-full h-[50vh] overflow-hidden">
            {children}
        </section>
    );
};

export default HeroCanvas;

