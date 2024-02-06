import React from 'react';
import PropTypes from 'prop-types';
import './PlaybackView.scss';
import { determineOrientation } from '../../services/ScreenOrientationService/ScreenOrientationService';
import CalendarComponent from '../../components/CalendarComponent';
import ToggleMessage from '../../components/ToggleMessage';
class PlaybackView extends React.Component {
  // Description of injected properties
  static propTypes = {
    mode: PropTypes.string.isRequired,
    message: PropTypes.string,
    richtextValue: PropTypes.string,
    richtextStyle: PropTypes.object,
    backgroundImg: PropTypes.string,
    bannerImage: PropTypes.object,
    content: PropTypes.string, // Include content prop
    logo: PropTypes.string, // Include content prop
    
  };

  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener('resize', this.updateWindowSize.bind(this));
  }

  updateWindowSize() {
    if (this.state.width !== window.innerWidth || this.state.height !== window.innerHeight) {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    }
  }

  render()  {
    const { mode, message, richtextValue, richtextStyle, backgroundImg, bannerImage, content1, logo } = this.props;
  // console.log("Playback view File URl")
    return (
      <div
        className="playback-view"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          width: "100%",
          height: "100vh",
        }}
      >
        <br />
        <div className="logo1"><img id="img1" src='assets/images/logo1.png' alt=""/></div>
        <CalendarComponent />
        <br />
        <div className="model-message">{message}</div>
        <br />
       
        <div id="content">{content1}</div>
        <span
          className="overlay-texth2" // Corrected class attribute
          style={richtextStyle}
          dangerouslySetInnerHTML={{ __html: richtextValue }}
        />
        <br />
        <div className="overlay-image">
          <img
            src={bannerImage.path}
            alt=""
          />
          
        </div>
      </div>
    );
  }
  
}

export default PlaybackView;
