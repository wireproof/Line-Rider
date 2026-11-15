# Line Rider for iOS

An experimental iPhone and iPad reconstruction of Line Rider, built for touch and adaptive screen sizes, including iPhone Duo. The app provides a track editor, blue, red, and green lines, a physics simulation, original iRide artwork and a short sound effect. Tracks are stored locally in the app's WebKit data.

## Status

Version 0.1.0 build 5 is a test build, not a finished recreation. The editor and rider use original iRide art and the open-source lr-core physics engine; gameplay, rider animation, sound behavior, and performance are not yet verified to match the original. This build was installed on the iPhone Duo and iPad Pro; this release has not been runtime- or visually tested on either device during the delivery audit.

## Build

Generate the Xcode project with `xcodegen generate`, open `LineRider.xcodeproj`, select an Apple development team, and build the LineRider scheme with Xcode and the iOS SDK. The bundle identifier is `com.wireproof.linerider`. A device build requires suitable signing and a provisioning profile. The release IPA is unsigned and must be signed for the intended device before installation.

## Project assets and attribution

`App/Web` contains the bundled game, the original iRide sprite atlas and audio, and the bundled physics engine. `Reference/iRide` holds the extracted original iRide image and sound assets, and `Reference/Flash` contains the supplied original Flash reference. The app icon is in `App/Assets.xcassets`. These assets are included as project reference material.

The physics engine originates from [lr-core](https://github.com/conundrumer/lr-core), revision `ce48ebed967d24ff4582995b31342440901f913d`. Its source and package metadata are under `ThirdParty/lr-core`; its bundled dependencies include immy and lodash. See `ThirdParty/licenses` for dependency licenses. Line Rider and its original artwork are associated with their respective creators and rights holders.
