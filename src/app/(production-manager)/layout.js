import Navbar2 from "@/components/Navbar2";
import { ProdManagerProvider } from "@/context/ProdManagerContext";


export default function ProductionManagerLayout({ children }) {
  return (
    <>
    <ProdManagerProvider>
      <Navbar2/>
      {children}
      </ProdManagerProvider>
      </>
  );
}
