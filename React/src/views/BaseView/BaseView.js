import React, { Component,useEffect, useState } from 'react';
import EditingView from '../EditingView/EditingView';
import PlaybackView from '../PlaybackView/PlaybackView';
import ScreenshotView from '../ScreenshotView/ScreenshotView';
import CardApiService from '../../services/CardApiService/CardApiService';
import logger from '../../services/LoggerService/LoggerService';
import './BaseView.scss';



class BaseView extends Component {
   notifiedLoad = false;
  
   static cardApiInitContexts = [
      CardApiService.PLAYBACKCONTEXT.EDIT,
      CardApiService.PLAYBACKCONTEXT.THEME,
      CardApiService.PLAYBACKCONTEXT.DEVICE
   ];

   static editingContexts = [CardApiService.PLAYBACKCONTEXT.EDIT, CardApiService.PLAYBACKCONTEXT.THEME];

   constructor(props) {
      super(props);
      this.state = {
         context: '',
         model: {},
         mode: '',
         message: ''
        
      };
   
   }
   onReceivedCardApiMessage(event) {
      const eventType = event.message.toLowerCase();
      if (eventType === 'api.init' && !this.hasNotified) {
        this.hasNotified = true;
        const cardApi = window.$cardApi;
        cardApi.notifyOnLoad();
      }
    }

   componentDidMount() {
      CardApiService.setBroadcastCallback(this.handleBroadcast.bind(this));
      this.updateViewState();
      this.updateModeState();

      const cardApi = window.$cardApi;
      cardApi.subscribeToMessages(this.onReceivedCardApiMessage.bind(this));

      
   }
   
 
   handleBroadcast(event, data) {
      switch (event) {
         case 'cardapi.mode-update':
            this.updateModeState();
            break;
         case 'cardapi.model-update':
            this.updateModelState();
            break;
         case 'cardapi.card-message':
            this.handleWindowMessage(data);
            break;
         default:
            logger.warn('Received unhandled event: ' + event);
      }
   }

   getCardConfig() {
      return CardApiService.getConfig() || {};
   }

   updateModelState() {
      this.setState({ model: CardApiService.getModel() });
   }

   updateModeState() {
      this.setState({ mode: CardApiService.getMode() });
   }

  
   handleWindowMessage(data) {
      if (data.event && data.event.message === 'api.init') {
         this.setState({ receivedConfig: true });
      }
   }

   updateViewState() {
      this.setState({ context: CardApiService.getPlaybackContext() });
   }

   // This Method is
   // Used to determine which view to show based on context,
   // CardApi and Model are injected to child components
   getCurrentView() {
      const props = {
         model: this.state.model
      };

      switch (this.state.context) {
         case CardApiService.PLAYBACKCONTEXT.EDIT:
         case CardApiService.PLAYBACKCONTEXT.THEME:
            return <EditingView {...props} />;
         case CardApiService.PLAYBACKCONTEXT.SCREENSHOT:
         case CardApiService.PLAYBACKCONTEXT.THEMESCREENSHOT:
            return <ScreenshotView {...props} />;
         case CardApiService.PLAYBACKCONTEXT.DEVICE:
         case CardApiService.PLAYBACKCONTEXT.NONE:
            return <EditingView {...props} />;
         default:
      
      }
   }

   // Notify cardApi that we are loaded
   notifyLoaded() {
      if (this.notifiedLoad) {
         return;
      }

      logger.debug('notifyLoaded');
      CardApiService.notifyLoaded();
      this.notifiedLoad = true;

      // const cardApi = window.$cardApi;
      // cardApi.subscribeToMessages(this.onReceivedCardApiMessage.bind(this));
   }

   // Notify cardApi that we are completed
   notifyComplete() {
      logger.debug('notifyComplete');
      CardApiService.notifyComplete();
   }

   // Notify cardApi that we have an error
   notifyOnError() {
      this.setState({ hasError: true });
      logger.debug('notifyOnError');
      CardApiService.notifyOnError();
   }

   render() {
      return <>{this.getCurrentView()}</>; 
   }
}

export default BaseView;
