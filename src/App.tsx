import { Outlet } from 'react-router-dom';
import { useTest } from './hooks/useTest';

const App = () => {
  const { msg } = useTest();

  console.log(msg);

  return (
    <Outlet />
  )
}

export default App;