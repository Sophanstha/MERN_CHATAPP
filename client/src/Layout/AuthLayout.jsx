import logo from '../assets/logo.png'
import ThemeToggle from '../component/ThemeToggle.jsx';

const AuthLayout = ({ children }) => {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200'>
      <header className='relative flex justify-center items-center py-3 h-20 shadow-md bg-white dark:bg-slate-900 border-b border-transparent dark:border-slate-800 px-6'>
        <div className='flex items-center gap-2'>
          <img 
            src={logo}
            alt='logo'
            className='h-12 w-auto object-contain dark:brightness-110'
          />
        </div>
        <div className='absolute right-6'>
          <ThemeToggle />
        </div>
      </header>
      <main className='py-6 px-4'>
        {children}
      </main>
    </div>
  )
};

export default AuthLayout;
  