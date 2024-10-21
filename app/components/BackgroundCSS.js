// components/BackgroundCSS.js
const BackgroundCSS = () => (
    <div className="background-container">
      <div className="content">
        <h1>Employee Self Services</h1>
      </div>
      <style jsx>{`
        .background-container {
          width: 100%;
          height: 100vh;
          background-image: url('/background.svg');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .content {
          position: relative;
          z-index: 1;
          padding: 50px;
          color: #333;
        }
      `}</style>
    </div>
  );
  
  export default BackgroundCSS;
  