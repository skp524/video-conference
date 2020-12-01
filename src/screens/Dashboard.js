import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from "react-native-twilio-video-webrtc";
import { checkPermissions } from "../utility/CommonFunctions";
import Icon from 'react-native-vector-icons/Ionicons';

class Dashboard extends Component {
  state = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    status: "disconnected",
    participants: new Map(),
    videoTracks: new Map(),
    roomName: "Room 2",
    showLocalView: true,
    trackSid: "",
    trackIdentifier: {},
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0LTE2MDY4MTE0MTYiLCJpc3MiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0Iiwic3ViIjoiQUMxNDZiOGE1YTZjNWFkYTdjNjU3OTJjZmU3NWQwYWVjNCIsImV4cCI6MTYwNjgxNTAxNiwiZ3JhbnRzIjp7ImlkZW50aXR5Ijoic2hhc2hhbmsiLCJ2aWRlbyI6e319fQ.jZ3qYFk9_qVKmakRGnXyOM8chCB0scSZ4lIuCzk1cQs",
    tokenPhone: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0LTE2MDY4MTE0NTQiLCJpc3MiOiJTSzllMTY3MzExYWM3ZTM2MGQ1OGJjMDhkMTg1OTI2YzA0Iiwic3ViIjoiQUMxNDZiOGE1YTZjNWFkYTdjNjU3OTJjZmU3NWQwYWVjNCIsImV4cCI6MTYwNjgxNTA1NCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoibWF5YW5rIiwidmlkZW8iOnt9fX0.BkvM7icxRgB6GHipaQcx5Th-hLNKyde5HI-640TnnXs",
  };
  connect = async () => {
    try {
      const permissionCheck = await checkPermissions();
      permissionCheck ? this.twilioRef.connect({
        roomName: this.state.roomName,
        accessToken: this.state.token,
        audio: true,
        dominantSpeaker: true,
      }) : await checkPermissions();
    } catch (error) {
      console.log(error);
      Alert.alert("Enter Valid room name")
    }
  };
  _onConnectButtonPress = async () => {
    try {
      const permissionCheck = await checkPermissions();
      permissionCheck ? this.twilioRef.connect({
        roomName: this.state.roomName,
        accessToken: this.state.tokenPhone,
        audio: true,
        dominantSpeaker: true,
      }) : await checkPermissions();
    } catch (error) {
      console.log(error);
      Alert.alert("Enter Valid room name")
    }
    this.setState({ status: "connecting" });
  };


  _onEndButtonPress = () => {
    this.twilioRef.disconnect();
  };

  _onMuteButtonPress = () => {
    this.twilioRef
      .setLocalAudioEnabled(!this.state.isAudioEnabled)
      .then(isEnabled => this.setState({ isAudioEnabled: isEnabled }));
    console.log(this.state.isAudioEnabled)
  };

  _onFlipButtonPress = () => {
    this.twilioRef.flipCamera();
  };

  _onRoomDidConnect = ({ roomName, error }) => {
    console.log('onRoomDidConnect: ', roomName);

    this.setState({ status: 'connected' });
  };

  _onRoomDidDisconnect = ({ roomName, error }) => {
    console.log("ERROR: ", error);
    console.log(roomName)
    this.setState({ status: "disconnected" });
    console.log(this.state.videoTracks)
  };

  _onRoomDidFailToConnect = error => {
    console.log("ERROR: ", error);

    this.setState({ status: "disconnected" });
  };

  _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantAddedVideoTrack: ", participant, track);

    this.setState({
      videoTracks: new Map([
        ...this.state.videoTracks,
        [
          track.trackSid,
          { participantSid: participant.sid, videoTrackSid: track.trackSid, identity: participant.identity },
        ]
      ])
    });
    console.log(this.state.videoTracks)
  };

  _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantRemovedVideoTrack: ", participant, track);

    const videoTracks = this.state.videoTracks;
    videoTracks.delete(track.trackSid);

    this.setState({ videoTracks: new Map([...videoTracks]) });
  };

  setTwilioRef = ref => {
    this.twilioRef = ref;
  };
  render() {
    return (
      <View style={styles.container} >
        {this.state.status === "disconnected" && (
          <View>
            <Button title="phone1" onPress={this.connect} />
            <Button title="phone2" onPress={this._onConnectButtonPress} />
          </View>
        )}
        {this.state.status === "connected" ||
          this.state.status === "connecting" ? (<View style={styles.callContainer} >
            <View style={styles.firstContainer}>
              {this.state.showLocalView ? (<TwilioVideoLocalView
                enabled={true}
                style={styles.bigVideoView} />) :
                (<TwilioVideoParticipantView
                  style={styles.bigVideoView}
                  key={this.state.trackSid}
                  trackIdentifier={this.state.trackIdentifier}
                />)}
            </View>
            <View style={styles.secondContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.remoteGrid}>
                <TouchableOpacity
                  style={styles.innerContainer}
                  onPress={() => this.setState({ showLocalView: true })}>
                  <TwilioVideoLocalView
                    enabled={true}
                    style={styles.smallVideoView} />
                  <Text style={styles.txt}>You</Text>
                </TouchableOpacity>
                {Array.from(
                  this.state.videoTracks,
                  ([trackSid, trackIdentifier]) => {
                    return (
                      <TouchableOpacity
                        style={styles.innerContainer}
                        key={trackSid} onPress={() => {
                          this.setState({ trackSid: trackSid, trackIdentifier: trackIdentifier, showLocalView: false })
                        }}
                      >
                        <TwilioVideoParticipantView
                          style={styles.smallVideoView}
                          key={trackSid}
                          trackIdentifier={trackIdentifier}
                        />
                        <Text
                          style={styles.txt}
                        >{trackIdentifier.identity}</Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </ScrollView>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onEndButtonPress}
              >
                <Icon
                  name='call' size={30} color='#dd3439' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onMuteButtonPress}
              >
                <Icon
                  name={this.state.isAudioEnabled ? "md-mic-outline" : "md-mic-off-outline"} size={30} color='#fff' />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onFlipButtonPress}
              >
                <Icon
                  name='sync' size={30} color='#fff' />
              </TouchableOpacity>
              <View />
            </View>
          </View>
          ) : null}
        <TwilioVideo
          ref={this.setTwilioRef}
          onRoomDidConnect={this._onRoomDidConnect}
          onRoomDidDisconnect={this._onRoomDidDisconnect}
          onRoomDidFailToConnect={this._onRoomDidFailToConnect}
          onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this._onParticipantRemovedVideoTrack}
        />
      </View>);
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
  },
  callContainer: {
    flex: 1,
  },
  firstContainer: {
    flex: 3,
  },
  secondContainer: {
    flex: 3,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: "row",
    marginTop: 35
  },
  innerContainer: {
    flexDirection: 'column',
    width: 170,
  },
  txt: {
    flex: 1,
    alignSelf: 'center',
    marginLeft: 15,
    fontSize: 22,
    color: '#fff'
  },
  smallVideoView: {
    flex: 5,
    marginLeft: 15
  },
  optionsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center'
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 50,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center"
  },
  bigVideoView: {
    flex: 3,
  },
});
export default Dashboard;