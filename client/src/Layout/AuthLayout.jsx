import logo from '../assets/logo.png'

const AuthLayout = ({ children }) => {
    return (
      <>
            <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
            <img 
              src={logo}
              alt='logo'
              width={180}
              height={60}
            />
        </header>
        <div>
        {children}
        </div>
      </>
    )
  };
  
  export default AuthLayout;
  