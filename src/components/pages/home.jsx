import CarrouselOfert from '../carrouseles/carrouselOfertas';
import CarrouselVendidos from '../carrouseles/carrouselVendidos';
import Footer from '../footer';
import SeccionHerramientas from '../secciones/seccionHerramientas';
import SeccionNov from '../secciones/seccionNov';

const Home = () => {
  return (
    <>
      <h2 className="text-center py-4 text-dark-text">Bienvenidos a Herramientas Tandil</h2>
      <CarrouselOfert></CarrouselOfert>
      <SeccionHerramientas></SeccionHerramientas>
      <CarrouselVendidos></CarrouselVendidos>
      <SeccionNov></SeccionNov>
      <Footer></Footer>
    </>
  );
};

export default Home;
