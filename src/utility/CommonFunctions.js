import {
  check,
  PERMISSIONS,
  RESULTS,
  checkMultiple,
  requestMultiple,
} from 'react-native-permissions';

export const checkPermissions = async () => {
  let CAMERA_PERMISSION =
    Platform.OS == 'android'
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;
  let AUDIO_PERMISSION =
    Platform.OS == 'android'
      ? PERMISSIONS.ANDROID.RECORD_AUDIO
      : PERMISSIONS.IOS.MICROPHONE;
  try {
    let statuses = await checkMultiple([CAMERA_PERMISSION, AUDIO_PERMISSION]);
    let cameraPerm = statuses[CAMERA_PERMISSION] == 'granted';
    let audioPerm = statuses[AUDIO_PERMISSION] == 'granted';
    if (!cameraPerm && !audioPerm) {
      return await requestPerm(CAMERA_PERMISSION, AUDIO_PERMISSION);
    } else if (!cameraPerm) {
      return await requestPerm(CAMERA_PERMISSION);
    } else if (!audioPerm) {
      return await requestPerm(AUDIO_PERMISSION);
    }
    else {
      return true;
    }
  } catch (error) {
    console.log('error in checking permissions', error);
  }
};
export const requestPerm = async (...params) => {
  let permissions = [...params];
  let noOfPermissions = permissions.length;
  try {
    let statuses = await requestMultiple([...params]);
    if (
      (noOfPermissions == 1 && statuses[permissions[0]] == 'granted') ||
      (noOfPermissions == 2 &&
        statuses[permissions[0]] == 'granted' &&
        statuses[permissions[1]] == 'granted')
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('error in requesting permissions', error);
  }
};
