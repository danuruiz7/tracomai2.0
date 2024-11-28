import { Menu } from 'lucide-react'
import Link from 'next/link'

import { getSession } from '@/actions/auth/getSession'
import { logout } from '@/actions/auth/logout'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import ItemNav from './ItemNav'


const Navbar = async () => {
  const navItems = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/generar-excel', label: 'Generar Excel' },
    { href: '/dashboard/cortar-pdf', label: 'Corta PDF' },
  ]
  const session = await getSession();


  return (
    <nav className=" bg-dolibarr">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold bg-white px-4 py-2 rounded">{session?.name ?? 'Usuario'}</span>
        </Link>
        <div className="hidden md:flex md:items-center md:space-x-4">
          {navItems.map((item) => (
            <ItemNav key={item.href} href={item.href}>
              {item.label}
            </ItemNav>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <form action={logout}>
            <Button type="submit" className='bg-red-500 border border-transparent hover:border hover:border-red-500 hover:bg-white hover:text-red-500'>Cerrar sesión</Button>
          </form>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <ItemNav key={item.href} href={item.href}>
                  {item.label}
                </ItemNav>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

export default Navbar

