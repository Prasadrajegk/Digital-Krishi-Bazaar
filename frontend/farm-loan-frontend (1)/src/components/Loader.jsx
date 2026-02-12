import './Loader.css';

const Loader = ({ size = 'medium', text = '' }) => {
  return (
    <div className={`loader-wrapper ${size}`}>
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-icon">🌾</div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;