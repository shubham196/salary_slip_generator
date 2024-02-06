import React from 'react';
import PlaybackView from '../PlaybackView/PlaybackView';
import PropTypes from 'prop-types';
import './ScreenshotView.scss';

class ScreenshotView extends React.Component {
   static propTypes = {
      model: PropTypes.object.isRequired
   };

   constructor(props) {
      super(props);
      this.state = {
         message: ''
      };
   }

   componentDidMount() {
      if (!this.props.model) {
         return;
      }

      this.setState({ message: this.props.model.inputs && this.props.model.inputs[0].value });
   }

   componentDidUpdate(prevProps, prevState) {
      if (!this.props.model) {
         return;
      }

      if (this.props.model !== prevProps.model) {
         this.setState({ message: this.props.model.inputs && this.props.model.inputs[0].value });
      }
   }

   render() {
      return (
         <div className='screenshot-view'>
            <PlaybackView model={this.props.model} mode='Screenshot' message={this.state.message} />
         </div>
      );
   }
}

export default ScreenshotView;
