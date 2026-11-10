import { EvaChrome } from './components/EvaChrome'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { ScrollProgress } from './components/ScrollFx'
import { About } from './pages/About'
import { Home } from './pages/Home'
import { Work } from './pages/Work'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50)
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

function Pages() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route index element={<Home />} />
          <Route path="work/:slug" element={<Work />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

// Vite's base is "/" locally and "/portfolio-3d/" on GitHub Pages. React
// Router wants the same prefix without a trailing slash so every Link and
// route resolves under the project site.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <Preloader />
      <ScrollManager />
      <Nav />
      <EvaChrome />
      <ScrollProgress />
      <Pages />
      <Footer />
    </BrowserRouter>
  )
}
