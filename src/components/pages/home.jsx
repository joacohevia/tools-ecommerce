import CarrouselOfert from '../carrouseles/carrouselOfertas';
import CarrouselVendidos from '../carrouseles/carrouselVendidos';
import SeccionHerramientas from '../secciones/seccionHerramientas';
import SeccionNov from '../secciones/seccionNov';
import Portada from './portada';
import WhatsAppButton from '../whatsappButton';

const Home = () => {
  return (
    <>
      <Portada />
      <CarrouselVendidos />
      <SeccionHerramientas />
      <CarrouselOfert />
      <SeccionNov />
      <WhatsAppButton />
    </>
  );
};

export default Home;
