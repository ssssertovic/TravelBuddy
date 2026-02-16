function Footer() {
  return (
    <footer className="bg-emerald-700 py-2">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-white text-xs tracking-wide">
          © {new Date().getFullYear()} by Sarah Šertović 
        </p>
      </div>
    </footer>
  );
}

export default Footer;
