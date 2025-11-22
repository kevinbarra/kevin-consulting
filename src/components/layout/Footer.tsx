import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b1121] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Columna 1: Marca */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">K</div>
              <span className="font-bold text-lg">Kevin<span className="text-blue-400">Consulting</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Ingeniería de software de alto nivel accesible para negocios reales. 
              Transformamos el código en rentabilidad.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h4 className="font-bold text-white mb-6">Soluciones</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Inventarios</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Puntos de Venta</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Web Corporativa</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Apps a la Medida</a></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Aviso de Privacidad</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Garantía de Software</a></li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            © 2025 Kevin Consulting. Hecho en México 🇲🇽
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={18} /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}