import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-4 bg-dolibarr">
      <div className="container mx-auto px-4 text-center">
        <Link
          href="https://www.tracom.info/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-all hover:text-blue-500 "
        >
          Tracom Consulting ({currentYear})
        </Link>
      </div>
    </footer>
  )
}

export default Footer
