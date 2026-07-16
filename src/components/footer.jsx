function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm">&copy; {new Date().getFullYear()} Herramientas Tandil. Todos los derechos reservados.</p>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                GitHub
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;