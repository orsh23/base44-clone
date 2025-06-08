import PropTypes from "prop-types";
import "../globals.css";

function MyApp({ Component, pageProps }) {
  if (!Component) {
    console.error("Error: Page component is undefined.", { Component, pageProps });
    return (
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>Application Error</h1>
        <p>The page component could not be loaded.</p>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};

export default MyApp;
