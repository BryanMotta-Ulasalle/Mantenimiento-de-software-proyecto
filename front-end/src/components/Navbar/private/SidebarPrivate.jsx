import LogoPrivate from "./LogoPrivate"
import NavBarPrivate from './NavBarPrivate';
import NavPrivate from "./NavPrivate";
import { Store } from 'lucide-react';

const SidebarPrivate = () => {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-black/93">
      <LogoPrivate />
      <NavBarPrivate/>
      <div className="mt-auto">
        <NavPrivate to="/" children="Pagina principal" icon={Store}/>
      </div>
    </aside>
  )
}

export default SidebarPrivate
