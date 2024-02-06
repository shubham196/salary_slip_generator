import React from 'react';
import PlaybackView from '../PlaybackView/PlaybackView';
import PropTypes from 'prop-types';
import './EditingView.scss';
import CalendarComponent from '../../components/CalendarComponent';

class EditingView extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      message: '',
      backgroundColor: '',
      backgroundImg: '',
      richtextStyle: {}, // Added richtextStyle in state
      richtextValue: '',
      bannerImageInput: {}, // Initialize as an empty object
      bannerImage:{},
      FileUrl: '',
      IpUrl:''
    };
  }

  componentDidMount() {
    this.updateStateFromModel(this.props.model);
  }

  componentDidUpdate(prevProps) {
    if (this.props.model !== prevProps.model) {
      this.updateStateFromModel(this.props.model);
    }
  }

  updateStateFromModel(model) {
    if (!model || !model.inputs) {
      return;
    }

 // Update background
 const backgroundInput = model.inputs.find((input) => input.name === 'background');
 if (backgroundInput && backgroundInput.value) {
   const { bgColor, bgImage } = backgroundInput.value;

   this.setState({
     backgroundColor: bgColor || '', // Set bgColor if available, otherwise empty string
     backgroundImg: bgImage || '',   // Set bgImage if available, otherwise empty string
   });
 }

    // Update richtext value and style
    const richtextInput = model.inputs.find((input) => input.name === 'richtext');
    if (richtextInput.style && richtextInput.value  ) {
      this.setState({
        richtextValue: richtextInput.value.html,
        richtextStyle: richtextInput.style || {
        
         
        }, // Fetch and set the richtext style
      });
    }

    console.log("Rich", richtextInput.value.html);


  // Update banner image
  const bannerImageInput = model.inputs.find((input) => input.name === 'bannerimage');
  if (bannerImageInput && bannerImageInput.value && bannerImageInput.value[0]) {
    const { path } = bannerImageInput.value[0];
    this.setState({
      bannerImage: { path } || {}, // Set as an object
    });
  }

  console.log("bannerImageInput",bannerImageInput);

    // Update other state properties as needed based on the model data
    const titleInput = model.inputs.find((input) => input.name === 'title');
    if (titleInput && titleInput.value) {
      this.setState({ message: titleInput.value });
    }
   

    
    // Update other state properties as needed based on the model data
    const calendarIdInput = model.inputs.find((input) => input.name === 'icsFileUrl');
    if (calendarIdInput && calendarIdInput.value) {
      this.setState({ FileUrl: calendarIdInput.value });
    }
    // console.log("Calendar Input", calendarIdInput.value);

       // Update other state properties as needed based on the model data
       const calendarIpInput = model.inputs.find((input) => input.name === 'ipAddress');
       if (calendarIpInput && calendarIpInput.value) {
         this.setState({ IpUrl: calendarIpInput.value });
       }
       // console.log("Calendar Input", calendarIpInput.value);
  }
 
render() {
  
   const { backgroundColor, message, richtextValue, richtextStyle,backgroundImg, bannerImage, FileUrl, IpUrl  } = this.state;
   console.log("Editview FileUrl:",FileUrl)
   return (
    
     <div className="editing-view" style={{ backgroundColor}}>
       <PlaybackView
         mode="Editing"
         message={ message }
         richtextValue={ richtextValue }
         richtextStyle={ richtextStyle } // Pass richtextStyle as a prop
         backgroundImg={ backgroundImg }
         bannerImage={bannerImage}
        //  FileUrl={FileUrl}
        
         // Pass backgroundImg as a prop
       />
      <CalendarComponent  
        FileUrl={FileUrl}
        IpUrl={IpUrl}
      />
     {/* <div
        className="richtext-container"
        style={richtextStyle}
        dangerouslySetInnerHTML={{ __html: richtextValue }}
      /> */}
     </div>
   );
 }
}

export default EditingView;

