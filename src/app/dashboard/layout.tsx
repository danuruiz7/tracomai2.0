import Footer from "@/components/navegacion/Footer";
import Navbar from "@/components/navegacion/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {

  return (
    <div style={{
      display: 'grid',
      minHeight: '100dvh',
      gridTemplateRows: 'auto 1fr auto',

    }}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}