import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Marquee from '../sections/Marquee';
import Process from '../sections/Process';
import Team from '../sections/Team';
import Services from '../sections/Services';
import Portfolio from '../sections/Portfolio';
import Socials from '../sections/Socials';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Process />
        <Team />
        <Portfolio />
        <Socials />
      </main>
      <Footer />
    </>
  );
}
