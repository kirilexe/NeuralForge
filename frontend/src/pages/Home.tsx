
import Navbar from "../components/header/Navbar";
import TextType from "../components/home/TextType";
import "./Home.css";

function HomePage() {
  return (
    <div className="home-root">
      <Navbar />
      <div className="home-content">
        {/* add content here */}
        <TextType 
          text={["Welcome to Neuralforge!", "Build and deploy ML models with ease."]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="_"
        />
        content content content
      </div>
    </div>
  );
}

export default HomePage;



