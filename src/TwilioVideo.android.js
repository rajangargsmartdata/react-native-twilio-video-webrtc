/**
 * Component to orchestrate the Twilio Video connection and the various video
 * views.
 *
 * Authors:
 *   Ralph Pina <slycoder@gmail.com>
 *   Jonathan Chang <slycoder@gmail.com>
 */

import {
  Platform,
  UIManager,
  View,
  findNodeHandle,
  requireNativeComponent,
  NativeModules,
} from "react-native";
import React, { Component } from "react";

import PropTypes from "prop-types";

const TwilioVideoManager = NativeModules.TwilioVideoModule;

const propTypes = {
  ...View.propTypes,
  /**
   * Callback that is called when camera source changes
   */
  onCameraSwitched: PropTypes.func,

  /**
   * Callback that is called when video is toggled.
   */
  onVideoChanged: PropTypes.func,

  /**
     * Callback that is called when screen share permission received.
     */
  onScreenShareChanged: PropTypes.func,

  /**
     * Callback that is called when a audio is toggled.
     */
  onAudioChanged: PropTypes.func,

  /**
   * Callback that is called when user is connected to a room.
   */
  onRoomDidConnect: PropTypes.func,

  /**
   * Callback that is called when connecting to room fails.
   */
  onRoomDidFailToConnect: PropTypes.func,

  /**
   * Callback that is called when user is disconnected from room.
   */
  onRoomDidDisconnect: PropTypes.func,

  /**
   * Called when a new data track has been added
   *
   * @param {{participant, track}}
   */
  onParticipantAddedDataTrack: PropTypes.func,

  /**
   * Called when a data track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedDataTrack: PropTypes.func,

  /**
   * Called when an dataTrack receives a message
   *
   * @param {{message}}
   */
  onDataTrackMessageReceived: PropTypes.func,

  /**
   * Called when a new video track has been added
   *
   * @param {{participant, track, enabled}}
   */
  onParticipantAddedVideoTrack: PropTypes.func,

  /**
   * Called when a video track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedVideoTrack: PropTypes.func,

  /**
   * Called when a new audio track has been added
   *
   * @param {{participant, track}}
   */
  onParticipantAddedAudioTrack: PropTypes.func,

  /**
   * Called when a audio track has been removed
   *
   * @param {{participant, track}}
   */
  onParticipantRemovedAudioTrack: PropTypes.func,

  /**
   * Callback called a participant enters a room.
   */
  onRoomParticipantDidConnect: PropTypes.func,

  /**
   * Callback that is called when a participant exits a room.
   */
  onRoomParticipantDidDisconnect: PropTypes.func,
  /**
   * Called when a video track has been enabled.
   *
   * @param {{participant, track}}
   */
  onParticipantEnabledVideoTrack: PropTypes.func,
  /**
   * Called when a video track has been disabled.
   *
   * @param {{participant, track}}
   */
  onParticipantDisabledVideoTrack: PropTypes.func,
  /**
   * Called when an audio track has been enabled.
   *
   * @param {{participant, track}}
   */
  onParticipantEnabledAudioTrack: PropTypes.func,
  /**
   * Called when an audio track has been disabled.
   *
   * @param {{participant, track}}
   */
  onParticipantDisabledAudioTrack: PropTypes.func,
  /**
   * Callback that is called when stats are received (after calling getStats)
   */
  onStatsReceived: PropTypes.func,
  /**
   * Callback that is called when network quality levels are changed (only if enableNetworkQualityReporting in connect is set to true)
   */
  onNetworkQualityLevelsChanged: PropTypes.func,
  /**
   * Called when dominant speaker changes
   * @param {{ participant, room }} dominant participant and room
   */
  onDominantSpeakerDidChange: PropTypes.func,
  /**
   * This method is only called when a Room which was not previously recording starts recording.
   */
  onRecordingStarted: PropTypes.func,
  /**
   * This method is only called when a Room which was previously recording stops recording.
   */
  onRecordingStopped: PropTypes.func,
  /**
   * Callback that is called after determining what codecs are supported
   */
  onLocalParticipantSupportedCodecs: PropTypes.func,
  /**
   * This method is only called when a Room which was not previously recording starts recording.
   */
  onRecordingStarted: PropTypes.func,
  /**
   * This method is only called when a Room which was previously recording stops recording.
   */
  onRecordingStopped: PropTypes.func,
  /**
   * Callback that is called after determining what codecs are supported
   */
  onLocalParticipantSupportedCodecs: PropTypes.func,
};

const nativeEvents = {
  connectToRoom: 1,
  disconnect: 2,
  switchCamera: 3,
  toggleVideo: 4,
  toggleSound: 5,
  getStats: 6,
  disableOpenSLES: 7,
  toggleSoundSetup: 8,
  toggleRemoteSound: 9,
  releaseResource: 10,
  toggleBluetoothHeadset: 11,
  sendString: 12,
  publishVideo: 13,
  publishAudio: 14,
  setRemoteAudioPlayback: 15,
  toggleScreenShare: 15
}

class CustomTwilioVideoView extends Component {
  _videoRef = null;
  _videoHandle = null;

  setRef = (ref) => {
    if (ref) {
      this._videoRef = ref;
      this._videoHandle = findNodeHandle(ref);
    } else {
      this._videoRef = null;
      this._videoHandle = null;
    }
  };

  connect({
    roomName,
    accessToken,
    cameraType = "front",
    enableAudio = true,
    enableVideo = true,
    enableRemoteAudio = true,
    enableNetworkQualityReporting = false,
    dominantSpeakerEnabled = false,
    maintainVideoTrackInBackground = false,
    encodingParameters = {},
  }) {
    this.runCommand(nativeEvents.connectToRoom, [
      roomName,
      accessToken,
      enableAudio,
      enableVideo,
      enableRemoteAudio,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      maintainVideoTrackInBackground,
      cameraType,
      encodingParameters,
    ]);
  }

  sendString(message) {
    this.runCommand(nativeEvents.sendString, [message]);
  }

  publishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [true]);
  }

  publishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [true]);
  }

  unpublishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [false]);
  }

  unpublishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [false]);
  }

  disconnect() {
    this.runCommand(nativeEvents.disconnect, []);
  }

  componentWillUnmount() {
    this.runCommand(nativeEvents.releaseResource, []);
  }

  flipCamera() {
    this.runCommand(nativeEvents.switchCamera, []);
  }

  setLocalVideoEnabled(enabled) {
    this.runCommand(nativeEvents.toggleVideo, [enabled]);
    return Promise.resolve(enabled);
  }

  setScreenShareEnabled (enabled) {
    this.runCommand(nativeEvents.toggleScreenShare, [enabled])
  }

  setLocalAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setRemoteAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleRemoteSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setBluetoothHeadsetConnected(enabled) {
    this.runCommand(nativeEvents.toggleBluetoothHeadset, [enabled]);
    return Promise.resolve(enabled);
  }

  setRemoteAudioPlayback({ participantSid, enabled }) {
    this.runCommand(nativeEvents.setRemoteAudioPlayback, [
      participantSid,
      enabled,
    ]);
  }

  getStats() {
    this.runCommand(nativeEvents.getStats, []);
  }

  disableOpenSLES() {
    this.runCommand(nativeEvents.disableOpenSLES, []);
  }

  toggleSoundSetup(speaker) {
    this.runCommand(nativeEvents.toggleSoundSetup, [speaker]);
  }

  runCommand(event, args) {
    switch (Platform.OS) {
      case "android":
        UIManager.dispatchViewManagerCommand(
          findNodeHandle(this._videoHandle),
          event,
          args
        );
        break;
      default:
        break;
    }
  }

  buildNativeEventWrappers() {
    return [
      "onCameraSwitched",
      "onVideoChanged",
      "onAudioChanged",
      'onScreenShareChanged',
      "onRoomDidConnect",
      "onRoomDidFailToConnect",
      "onRoomDidDisconnect",
      "onParticipantAddedDataTrack",
      "onParticipantRemovedDataTrack",
      "onDataTrackMessageReceived",
      "onParticipantAddedVideoTrack",
      "onParticipantRemovedVideoTrack",
      "onParticipantAddedAudioTrack",
      "onParticipantRemovedAudioTrack",
      "onRoomParticipantDidConnect",
      "onRoomParticipantDidDisconnect",
      "onParticipantEnabledVideoTrack",
      "onParticipantDisabledVideoTrack",
      "onParticipantEnabledAudioTrack",
      "onParticipantDisabledAudioTrack",
      "onStatsReceived",
      "onNetworkQualityLevelsChanged",
      "onDominantSpeakerDidChange",
      "onRecordingStarted",
      "onRecordingStopped",
      "onLocalParticipantSupportedCodecs",
    ].reduce((wrappedEvents, eventName) => {
      if (this.props[eventName]) {
        return {
          ...wrappedEvents,
          [eventName]: (data) => this.props[eventName](data.nativeEvent),
        };
      }
      return wrappedEvents;
    }, {});
  }

  isRecording() {
    if (!TwilioVideoManager) {
      throw new Error("TwilioVideoManager not found");
    }

    return TwilioVideoManager.isRecording(this._videoHandle);
  }

  render() {
    return (
      <NativeCustomTwilioVideoView
        ref={this.setRef}
        {...this.props}
        {...this.buildNativeEventWrappers()}
      />
    );
  }
}

CustomTwilioVideoView.propTypes = propTypes;

const NativeCustomTwilioVideoView = requireNativeComponent(
  "RNCustomTwilioVideoView",
  CustomTwilioVideoView
);

module.exports = CustomTwilioVideoView;
