import { PrimeReactProvider } from 'primereact/api';

const PrimeReactHoc: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <PrimeReactProvider>{children}</PrimeReactProvider>;
};

export default PrimeReactHoc;
